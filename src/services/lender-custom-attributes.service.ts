import { CustomAttributesTypeEnum } from 'commons/enums/custom-attributes-type.enum';
import { EnterpriseStatusEnum } from 'commons/enums/enterprise-status.enum';
import { ConflictException } from 'commons/exceptions';
import { LenderCustomAttributesOrderBy } from 'commons/filter';
import { ICustomAttribute } from 'commons/interfaces/custom-attribute.interface';
import { ILenderCustomAttribute } from 'commons/interfaces/lender-custom-attribute.interface';
import { IAnswerOptions, ICustomAttribute as ICustomAttributeLender } from 'commons/interfaces/lender-payer.interface';
import { IUpdateFundingLinkPayerLenderCustomAttribute } from 'commons/interfaces/update-funding-link-payer-lender-custom-attribute.interface';
import LiberaUtils from 'commons/libera.utils';
import { AnswerCustomAttributesDAO } from 'dao/answer-custom-attributes.dao';
import { AnswerOptionsDAO } from 'dao/answer-options.dao';
import { CatCustomAttributesDAO } from 'dao/cat-custom-attributes.dao';
import { EnterpriseFundingLinkDAO } from 'dao/enterprise-funding-link.dao';
import { EnterpriseDAO } from 'dao/enterprise.dao';
import { LenderCustomAttributesLinkDAO } from 'dao/lender-custom-attributes-link.dao';
import { LenderCustomAttributesDAO } from 'dao/lender-custom-attributes.dao';
import { OptionCustomAttributesDAO } from 'dao/option-custom-attributes.dao';
import { UserDAO } from 'dao/user.dao';
import { AnswerCustomAttributes } from 'entities/answer-custom-attributes';
import { AnswerOptions } from 'entities/answer-options';
import { CatCustomAttributes } from 'entities/cat-custom-attributes';
import { LenderCustomAttributes } from 'entities/lender-custom-attributes';
import { LenderCustomAttributesLink } from 'entities/lender-custom-attributes-link';
import { OptionCustomAttributes } from 'entities/option-custom-attributes';
import _ from 'lodash';
import moment, { isDate } from 'moment';

export class LenderCustomAttributesService {

    static async getLenderCustomAttributes(lenderId: number, orderBy: LenderCustomAttributesOrderBy) {
        console.log('SERVICE: Starting getLenderCustomAttributes method');
        const enterprise = await EnterpriseDAO.getEnterpriseById(lenderId);

        if (!enterprise || enterprise.status == EnterpriseStatusEnum.DELETED)
            throw new ConflictException('SCF.LIBERA.19', { enterpriseId: lenderId });

        const result = await LenderCustomAttributesDAO.getByLenderId(lenderId, orderBy);
        let lenderCustomAttributes: ILenderCustomAttribute[] = result
            .map(({ id, customAttribute, creationDate }) =>
                (<ILenderCustomAttribute>{ id: +id, name: customAttribute.name, type: customAttribute.type, creationDate }));

        for (let attribute of lenderCustomAttributes) {
            if (attribute.type === CustomAttributesTypeEnum.CHECKBOX || attribute.type === CustomAttributesTypeEnum.RADIO) {
                const options: OptionCustomAttributes[] = await OptionCustomAttributesDAO.getOptionsByAttributeId(attribute.id);
                attribute.options = options;
            }
        }

        console.log('SERVICE: Ending getLenderCustomAttributes method');
        return lenderCustomAttributes;
    }

    static async createCustomAttribute(lenderId: number, customAttributeData: ICustomAttribute) {
        console.log('SERVICE: Starting createCustomAttribute method');
        const name = customAttributeData.name;
        const type = customAttributeData.type;
        const creationUser = await UserDAO.getBasicUserById(customAttributeData.userId);
        let catCustomAttr: CatCustomAttributes;

        const lender = await EnterpriseDAO.getEnterpriseById(lenderId);

        if (!lender || lender.status == EnterpriseStatusEnum.DELETED)
            throw new ConflictException('SCF.LIBERA.19', { enterpriseId: lenderId });

        let lenderCustomAttr: LenderCustomAttributes = await LenderCustomAttributesDAO.validateByNameAndType(lenderId, name, type);

        if (lenderCustomAttr)
            throw new ConflictException('SCF.LIBERA.155');

        catCustomAttr = new CatCustomAttributes();
        catCustomAttr.name = customAttributeData.name;
        catCustomAttr.type = customAttributeData.type;
        catCustomAttr.creationDate = moment(moment.now(), 'x').toDate();

        catCustomAttr = await CatCustomAttributesDAO.create(catCustomAttr);
        console.log(`catCustomAttr created: ${JSON.stringify(catCustomAttr)}`);

        if (catCustomAttr.type == CustomAttributesTypeEnum.RADIO || catCustomAttr.type == CustomAttributesTypeEnum.CHECKBOX) {
            console.log(`catCustomAttr type is RADIO or CHECKBOX`);

            for (let option of customAttributeData.options) {
                let optionCustomAttribute = new OptionCustomAttributes();
                optionCustomAttribute.customAttribute = catCustomAttr;
                optionCustomAttribute.value = option.value;

                await OptionCustomAttributesDAO.create(optionCustomAttribute);
            }
        }

        lenderCustomAttr = new LenderCustomAttributes();
        lenderCustomAttr.customAttribute = catCustomAttr;
        lenderCustomAttr.lender = lender;
        lenderCustomAttr.creationDate = moment(moment.now(), 'x').toDate();
        lenderCustomAttr.creationUser = creationUser;

        await LenderCustomAttributesDAO.create(lenderCustomAttr);

        customAttributeData.id = lenderCustomAttr.id;
        customAttributeData.creationDate = lenderCustomAttr.creationDate;
        delete customAttributeData.options;
        delete customAttributeData.userId;

        if (customAttributeData.type == CustomAttributesTypeEnum.CHECKBOX || customAttributeData.type == CustomAttributesTypeEnum.RADIO) {
            customAttributeData.options = await OptionCustomAttributesDAO.getOptionsByAttributeId(customAttributeData.id);
        }

        console.log('SERVICE: Ending createCustomAttribute method');

        return customAttributeData;
    }

    static async deleteFundingLinkPayerLenderCustomAttribute(lenderId: number, payerId: number, customAttributeId: number) {
        console.log('SERVICE: Starting deleteFundingLinkPayerLenderCustomAttribute method');
        const lender = await EnterpriseDAO.getEnterpriseById(lenderId);

        if (!lender || lender.status == EnterpriseStatusEnum.DELETED)
            throw new ConflictException('SCF.LIBERA.19', { enterpriseId: lenderId });

        const payer = await EnterpriseDAO.getEnterpriseById(payerId);

        if (!payer || payer.status == EnterpriseStatusEnum.DELETED)
            throw new ConflictException('SCF.LIBERA.19', { enterpriseId: payerId });

        const enterpriseFundingLink = await EnterpriseFundingLinkDAO.getByLenderIdAndPayerId(lenderId, payerId);

        if (!enterpriseFundingLink)
            throw new ConflictException('SCF.LIBERA.219', { lenderId, payerId });

        const lenderCustomAttributesLink: LenderCustomAttributesLink = await LenderCustomAttributesLinkDAO.getById(customAttributeId);

        if (!lenderCustomAttributesLink)
            throw new ConflictException('SCF.LIBERA.224', { customAttributeId, payerId, lenderId });

        console.log(`lenderCustomAttributesLink obtanied: ${JSON.stringify(lenderCustomAttributesLink)}`);

        const answerLenderCustomAttribute: AnswerCustomAttributes = await AnswerCustomAttributesDAO.getByLenderCustomAttributeLinkId(lenderCustomAttributesLink.id);

        if (answerLenderCustomAttribute) {
            await AnswerOptionsDAO.deletePreviousOptionsByAnswerId(answerLenderCustomAttribute.id);
            await AnswerCustomAttributesDAO.delete(answerLenderCustomAttribute);
        }

        await LenderCustomAttributesLinkDAO.delete(lenderCustomAttributesLink);

        console.log('SERVICE: Ending deleteFundingLinkPayerLenderCustomAttribute method');
    }

    static async updateFundingLinkPayerLenderCustomAttribute(lenderId: number, payerId: number, userId: number,
        lenderCustomAttributesDatas: IUpdateFundingLinkPayerLenderCustomAttribute[]) {
        console.log('SERVICE: Starting updateFundingLinkPayerLenderCustomAttribute method');
        const lender = await EnterpriseDAO.getEnterpriseById(lenderId);

        if (!lender || lender.status == EnterpriseStatusEnum.DELETED)
            throw new ConflictException('SCF.LIBERA.19', { enterpriseId: lenderId });

        const payer = await EnterpriseDAO.getEnterpriseById(payerId);

        if (!payer || payer.status == EnterpriseStatusEnum.DELETED)
            throw new ConflictException('SCF.LIBERA.19', { enterpriseId: payerId });

        const creationUser = await UserDAO.getById(userId);

        const enterpriseFundingLink = await EnterpriseFundingLinkDAO.getBasicByLenderIdAndPayerId(lenderId, payerId);
        console.log(`fundinglink id ${enterpriseFundingLink.id}`);
        if (!enterpriseFundingLink)
            throw new ConflictException('SCF.LIBERA.219', { lenderId, payerId });

        for (let attribute of lenderCustomAttributesDatas) {

            const lenderCustomAttribute = await LenderCustomAttributesDAO.getById(attribute.id);
            if (!lenderCustomAttribute)
                throw new ConflictException('SCF.LIBERA.233', { attributeId: attribute.id, lenderId });

            const lenderCustomAttributesLink = await LenderCustomAttributesLinkDAO
                .getByFundingLinkIdAndCustomAttributeId(enterpriseFundingLink.id, lenderCustomAttribute.customAttribute.id);

            // if the el link does not exists
            if (!lenderCustomAttributesLink) {
                console.log(`=======> Creating Lender Custom Atrribute Link`);
                const lenderCustomAttributeLink = new LenderCustomAttributesLink();
                lenderCustomAttributeLink.catCustomAttribute = lenderCustomAttribute.customAttribute;
                lenderCustomAttributeLink.enterpriseFundingLink = enterpriseFundingLink;

                const customAttribute = await LenderCustomAttributesLinkDAO.save(lenderCustomAttributeLink);
                console.log(`LENDER ATTRIBUTE LINK`, customAttribute);

                console.log(`Creation Answer Custom Attribute `);
                let answerCustomAttribute = new AnswerCustomAttributes();
                answerCustomAttribute.lenderCustomAttributeLink = customAttribute;
                answerCustomAttribute.creationUser = creationUser;
                answerCustomAttribute.modificationUser = creationUser;

                if (lenderCustomAttribute.customAttribute.type === CustomAttributesTypeEnum.CURRENCY
                    || lenderCustomAttribute.customAttribute.type === CustomAttributesTypeEnum.DATE
                    || lenderCustomAttribute.customAttribute.type === CustomAttributesTypeEnum.DECIMAL
                    || lenderCustomAttribute.customAttribute.type === CustomAttributesTypeEnum.INTEGER
                    || lenderCustomAttribute.customAttribute.type === CustomAttributesTypeEnum.TEXT) {

                    if (!attribute.value) throw new ConflictException('SCF.LIBERA.225', { attributeId: attribute.id })

                    if (lenderCustomAttribute.customAttribute.type === CustomAttributesTypeEnum.DATE) {
                        if (!isDate(attribute.value)) throw new ConflictException('SCF.LIBERA.234');
                    }
                    else {
                        if (lenderCustomAttribute.customAttribute.type === CustomAttributesTypeEnum.DECIMAL ||
                            lenderCustomAttribute.customAttribute.type === CustomAttributesTypeEnum.INTEGER ||
                            lenderCustomAttribute.customAttribute.type === CustomAttributesTypeEnum.CURRENCY) {
                            if (isNaN(parseFloat(attribute.value))) throw new ConflictException('SCF.LIBERA.225');
                        }
                    }

                    if (lenderCustomAttribute.customAttribute.type === CustomAttributesTypeEnum.INTEGER) {
                        attribute.value = Number.parseInt(attribute.value).toFixed(0);
                    }
                    else if (lenderCustomAttribute.customAttribute.type === CustomAttributesTypeEnum.DECIMAL ||
                        lenderCustomAttribute.customAttribute.type === CustomAttributesTypeEnum.CURRENCY) {
                        attribute.value = LiberaUtils.toFixedTrunc(+attribute.value, 2);
                    }

                    answerCustomAttribute.creationDate = moment(moment.now(), 'x').toDate();
                    answerCustomAttribute.modificationDate = moment(moment.now(), 'x').toDate();
                    answerCustomAttribute.value = attribute.value;
                    await AnswerCustomAttributesDAO.save(answerCustomAttribute);
                }

                if (lenderCustomAttribute.customAttribute.type === CustomAttributesTypeEnum.RADIO) {
                    console.log(`Custom attribute type : RADIO`);

                    if (!attribute.options || !attribute.options[0].id)
                        throw new ConflictException('SCF.LIBERA.235', { attributeName: lenderCustomAttribute.customAttribute.name });

                    const option = await OptionCustomAttributesDAO.getById(attribute.options[0].id);
                    if (!option) throw new ConflictException('SCF.LIBERA.223', { optionId: attribute.options[0].id });

                    if (!_.indexOf(lenderCustomAttribute.customAttribute.optionsCustomAttributes, option))
                        throw new ConflictException('SCF.LIBERA.222', { optionId: option.id, customAttributeId: lenderCustomAttribute.customAttribute.id });

                    answerCustomAttribute.optionCustomAttribute = option;
                    answerCustomAttribute.value = option.id.toString();
                    answerCustomAttribute.creationDate = moment(moment.now(), 'x').toDate();
                    answerCustomAttribute.modificationDate = moment(moment.now(), 'x').toDate();
                    await AnswerCustomAttributesDAO.save(answerCustomAttribute);
                }

                if (lenderCustomAttribute.customAttribute.type === CustomAttributesTypeEnum.CHECKBOX) {
                    console.log(`Custom attribute type : CHECKBOX`);

                    if (attribute.options && attribute.options.length > 1) {
                        console.log(`attribute.options is NOT null or empty`);
                        //throw new ConflictException('SCF.LIBERA.235', { attributeName: lenderCustomAttribute.customAttribute.name });

                        for (const option of attribute.options) {
                            if (!option || !option.id)
                                throw new ConflictException('SCF.LIBERA.235', { attributeName: lenderCustomAttribute.customAttribute.name });
                        }

                        console.log(attribute.options);
                        answerCustomAttribute.creationDate = moment(moment.now(), 'x').toDate();
                        answerCustomAttribute.modificationDate = moment(moment.now(), 'x').toDate();
                        const answer = await AnswerCustomAttributesDAO.save(answerCustomAttribute);

                        console.log(`answer saved: ${JSON.stringify(answer)}`);

                        console.log(`Cheching for every id`);
                        for (let aoption of attribute.options) {
                            console.log(`answer option ID: ${aoption.id}`);

                            const option = await OptionCustomAttributesDAO.getById(aoption.id);
                            if (!option) throw new ConflictException('SCF.LIBERA.223', { optionId: aoption.id });

                            if (!_.indexOf(lenderCustomAttribute.customAttribute.optionsCustomAttributes, option))
                                throw new ConflictException('SCF.LIBERA.222', { optionId: option.id, customAttributeId: lenderCustomAttribute.customAttribute.id });

                            let answerOption = new AnswerOptions();
                            answerOption.answerCustomAttribute = answer;
                            answerOption.optionCustomAttributes = option;
                            console.log('ANSWER_OPTION', answerOption);
                            console.log('A punto de guardar la respuesta');
                            await AnswerOptionsDAO.save(answerOption);
                            console.log('Despues de guardar la respuesta');
                        }
                    }
                }
            }
            else {
                // The link exists
                console.log(`Existing Lender Custom Atrribute Link`);
                console.log(`Getting answer from link`);
                let answerCustomAttribute = await AnswerCustomAttributesDAO.getByLenderCustomAttributeLinkId(lenderCustomAttributesLink.id);

                if (!answerCustomAttribute) {
                    answerCustomAttribute = new AnswerCustomAttributes();
                    answerCustomAttribute.creationDate = moment(moment.now(), 'x').toDate();
                    answerCustomAttribute.lenderCustomAttributeLink = lenderCustomAttributesLink;
                    answerCustomAttribute.creationUser = creationUser;
                    answerCustomAttribute.modificationUser = creationUser;
                }

                if (lenderCustomAttribute.customAttribute.type === CustomAttributesTypeEnum.CURRENCY
                    || lenderCustomAttribute.customAttribute.type === CustomAttributesTypeEnum.DATE
                    || lenderCustomAttribute.customAttribute.type === CustomAttributesTypeEnum.DECIMAL
                    || lenderCustomAttribute.customAttribute.type === CustomAttributesTypeEnum.INTEGER
                    || lenderCustomAttribute.customAttribute.type === CustomAttributesTypeEnum.TEXT) {

                    if (!attribute.value) throw new ConflictException('SCF.LIBERA.225', { attributeId: attribute.id })

                    if (lenderCustomAttribute.customAttribute.type === CustomAttributesTypeEnum.DATE) {
                        if (!moment(attribute.value).isValid()) throw new ConflictException('SCF.LIBERA.234');
                    }
                    else {
                        if (lenderCustomAttribute.customAttribute.type === CustomAttributesTypeEnum.DECIMAL ||
                            lenderCustomAttribute.customAttribute.type === CustomAttributesTypeEnum.INTEGER ||
                            lenderCustomAttribute.customAttribute.type === CustomAttributesTypeEnum.CURRENCY) {
                            if (isNaN(parseFloat(attribute.value))) throw new ConflictException('SCF.LIBERA.225');
                        }
                    }

                    if (lenderCustomAttribute.customAttribute.type === CustomAttributesTypeEnum.INTEGER) {
                        attribute.value = Number.parseInt(attribute.value).toFixed(0);
                    }
                    else if (lenderCustomAttribute.customAttribute.type === CustomAttributesTypeEnum.DECIMAL ||
                        lenderCustomAttribute.customAttribute.type === CustomAttributesTypeEnum.CURRENCY) {
                        attribute.value = LiberaUtils.toFixedTrunc(+attribute.value, 2);
                    }

                    answerCustomAttribute.modificationDate = moment(moment.now(), 'x').toDate();
                    answerCustomAttribute.value = attribute.value;
                    await AnswerCustomAttributesDAO.update(answerCustomAttribute);
                }

                if (lenderCustomAttribute.customAttribute.type === CustomAttributesTypeEnum.RADIO) {
                    console.log(`Custom attribute type : RADIO`);

                    if (!attribute.options || !attribute.options[0].id)
                        throw new ConflictException('SCF.LIBERA.235', { attributeName: lenderCustomAttribute.customAttribute.name });

                    const option = await OptionCustomAttributesDAO.getById(attribute.options[0].id);
                    console.log('options', option);

                    if (!option) throw new ConflictException('SCF.LIBERA.223', { optionId: attribute.options[0].id });

                    if (!_.indexOf(lenderCustomAttribute.customAttribute.optionsCustomAttributes, option))
                        throw new ConflictException('SCF.LIBERA.222', { optionId: option.id, customAttributeId: lenderCustomAttribute.customAttribute.id });

                    console.log(answerCustomAttribute);

                    answerCustomAttribute.optionCustomAttribute = option;
                    answerCustomAttribute.value = option.id.toString();
                    answerCustomAttribute.modificationDate = moment(moment.now(), 'x').toDate();
                    await AnswerCustomAttributesDAO.update(answerCustomAttribute);
                }

                if (lenderCustomAttribute.customAttribute.type === CustomAttributesTypeEnum.CHECKBOX) {
                    console.log(`Custom attribute type : CHECKBOX`);

                    if (!attribute.options || attribute.options.length < 1) {
                        console.log(`attribute has no options, deleting it...`);
                        await AnswerOptionsDAO.deletePreviousOptionsByAnswerId(answerCustomAttribute.id);
                    }
                    else {
                        console.log(`attribute has options, processing it...`);
                        for (const option of attribute.options) {
                            if (!option || !option.id)
                                throw new ConflictException('SCF.LIBERA.235', { attributeName: lenderCustomAttribute.customAttribute.name });
                        }

                        await AnswerOptionsDAO.deletePreviousOptionsByAnswerId(answerCustomAttribute.id);

                        console.log(`Cheching for every id`);
                        for (let aoption of attribute.options) {

                            console.log(aoption.id);

                            const option = await OptionCustomAttributesDAO.getById(aoption.id);
                            if (!option) throw new ConflictException('SCF.LIBERA.223', { optionId: aoption.id });

                            if (!_.indexOf(lenderCustomAttribute.customAttribute.optionsCustomAttributes, option))
                                throw new ConflictException('SCF.LIBERA.222', { optionId: option.id, customAttributeId: lenderCustomAttribute.customAttribute.id });

                            let answerOption = new AnswerOptions();
                            answerOption.answerCustomAttribute = answerCustomAttribute;
                            answerOption.optionCustomAttributes = option;
                            console.log('ANSWER_OPTION', answerOption);
                            console.log('A punto de guardar la respuest');
                            await AnswerOptionsDAO.save(answerOption);
                            console.log('Despues de guardar la respuest');
                        }
                    }
                }

                answerCustomAttribute.modificationDate = moment(moment.now(), 'x').toDate();
                await AnswerCustomAttributesDAO.save(answerCustomAttribute);
            }
        }

        const fundingLinkPayer = await EnterpriseFundingLinkDAO.getByLenderIdAndPayerId(lenderId, payerId);

        if (!fundingLinkPayer)
            throw new ConflictException('SCF.LIBERA.219', { lenderId, payerId });

        let customAttributes: ICustomAttributeLender[] = await LenderCustomAttributesLinkDAO.getAllByEnterpriseFundingLinkId(fundingLinkPayer.id);

        console.log(`customAttributes obtained: ${JSON.stringify(customAttributes)}`);

        for (let customAttribute of customAttributes) {

            const lenderCustomAttr: LenderCustomAttributes = await LenderCustomAttributesDAO
                .getByLenderIdAndCatCustomAttrId(lenderId, customAttribute.attributeId);

            customAttribute.attributeId = lenderCustomAttr != null ? lenderCustomAttr.id : null;

            if (customAttribute.type === CustomAttributesTypeEnum.CHECKBOX
                || customAttribute.type === CustomAttributesTypeEnum.RADIO) {
                // if type is radio o checkbox, get the list of options by the lender custom attribute id
                customAttribute.options = await OptionCustomAttributesDAO.getOptionsByLenderCustomAttributesId(customAttribute.id);

                console.log(`customAttribute.options obtained: ${JSON.stringify(customAttribute.options)}`);

                // if type is checkbox get the options marked (answers) by the lender
                if (customAttribute.type === CustomAttributesTypeEnum.CHECKBOX) {
                    const answer: AnswerCustomAttributes = await AnswerCustomAttributesDAO
                        .getByLenderCustomAttributeLinkId(customAttribute.id);

                    const options: IAnswerOptions[] = await AnswerOptionsDAO.getOptionsByAnswerId(answer.id);

                    console.log(`options Answers `, options);

                    if (!options) {
                        customAttribute.options.map(option => {
                            option.isChecked = false;
                        });
                    }
                    else {
                        const ids: number[] = options.map(option => option.optionId);
                        const coincidence: number[] = [];
                        console.log(`IDs from answers`, ids);
                        customAttribute.options.map(option => {
                            console.log(`options`, ids, option.id);
                            if (ids.includes(option.id)) {
                                coincidence.push(option.id);
                                option.isChecked = true;
                                console.log(`The id ${option.id} is on the array ${ids}`);
                            }
                            else {
                                console.log(`The id ${option.id} isnt on the array ${ids}`);
                                option.isChecked = false;
                            }

                        });
                        console.log(coincidence);
                    }
                }
            }
        }

        return customAttributes;
    }

    static async deleteCustoAttribute(lenderId: number, lenderCustomAttributeId: number) {
        console.log('SERVICE: Starting deleteCustoAttribute method');
        const lender = await EnterpriseDAO.getEnterpriseById(lenderId);

        if (!lender || lender.status == EnterpriseStatusEnum.DELETED)
            throw new ConflictException('SCF.LIBERA.19', { enterpriseId: lenderId });

        const lenderCustomAttribute: LenderCustomAttributes = await LenderCustomAttributesDAO.getById(lenderCustomAttributeId);

        if (!lenderCustomAttribute)
            throw new ConflictException('SCF.LIBERA.217', { customAttributeId: lenderCustomAttributeId });

        if (lenderCustomAttribute.lender.id != lender.id)
            throw new ConflictException('SCF.LIBERA.212', { lenderId, lenderCustomAttributeId });

        await this.deleteAllLenderAttrsLinksByAttrbId(lenderCustomAttribute.customAttribute.id);

        await LenderCustomAttributesDAO.delete(lenderCustomAttribute);

        console.log('SERVICE: Ending deleteCustoAttribute method');
    }

    static async deleteAllLenderAttrsLinksByAttrbId(catCustomAttributeId: number) {
        console.log('SERVICE: Starting deleteCustoAttribute method');

        const lenderCustomAttrLinkIds: LenderCustomAttributesLink[] = await LenderCustomAttributesLinkDAO
            .getBasicByCatCustomAttributeId(catCustomAttributeId);

        if (!lenderCustomAttrLinkIds || lenderCustomAttrLinkIds.length < 1) {
            console.log(`No lenderCustomAttrLinks found`);
            return;
        }

        console.log(`lenderCustomAttrLinkIds obtained: ${JSON.stringify(lenderCustomAttrLinkIds)}`);

        const lenderCustomAttrIds: number[] = lenderCustomAttrLinkIds.map(lenderCustomAttrLinkId => lenderCustomAttrLinkId.id);
        console.log(`lenderCustomAttrIds obtained: ${JSON.stringify(lenderCustomAttrIds)}`);

        const answerCustomAttrIds: number[] = lenderCustomAttrLinkIds.filter(lenderCustomAttrLinkId => {
            if (!lenderCustomAttrLinkId.answersCustomAttributes) {
                return false; // skip
            }
            return true;
        }).map(lenderCustomAttrLinkId => lenderCustomAttrLinkId.answersCustomAttributes.id);

        console.log(`answerCustomAttrIds obtained: ${JSON.stringify(answerCustomAttrIds)}`);

        if (answerCustomAttrIds.length > 0) {
            //delete deletePreviousOptionsByAnswerId
            await AnswerOptionsDAO.deleteByAnswerCustomAttrIds(answerCustomAttrIds);
        }

        //delete answerCustomAttribute
        await AnswerCustomAttributesDAO.deleteByLenderCustomAttrLinkIds(lenderCustomAttrIds);

        //delete lenderCustomAttributesLinks
        await LenderCustomAttributesLinkDAO.deleteByIds(lenderCustomAttrIds);

        console.log('SERVICE: Ending deleteCustoAttribute method');
    }
}
