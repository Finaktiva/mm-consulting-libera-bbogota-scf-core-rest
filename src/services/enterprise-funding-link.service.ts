import { CustomAttributesTypeEnum } from 'commons/enums/custom-attributes-type.enum';
import { EnterpriseStatusEnum } from 'commons/enums/enterprise-status.enum';
import { ConflictException } from 'commons/exceptions';
import { BasicFilter, EnterpriseQuotaRequestFilterBy, EnterpriseQuotaRequestOrderBy, LenderPayersFilterBy } from 'commons/filter';
import { IAnswerOptions, ICustomAttribute, ILenderPayer } from 'commons/interfaces/lender-payer.interface';
import { ILenderFundingLink } from 'commons/interfaces/lender-quota-request.interface';
import { AnswerCustomAttributesDAO } from 'dao/answer-custom-attributes.dao';
import { AnswerOptionsDAO } from 'dao/answer-options.dao';
import { EnterpriseFundingLinkDAO } from 'dao/enterprise-funding-link.dao';
import { EnterpriseDAO } from 'dao/enterprise.dao';
import { LenderCustomAttributesLinkDAO } from 'dao/lender-custom-attributes-link.dao';
import { LenderCustomAttributesDAO } from 'dao/lender-custom-attributes.dao';
import { OptionCustomAttributesDAO } from 'dao/option-custom-attributes.dao';
import { AnswerCustomAttributes } from 'entities/answer-custom-attributes';
import { LenderCustomAttributes } from 'entities/lender-custom-attributes';

export class EnterpriseFundingLinkService {

    static async getEnterpriseLendersByPayer(payerId: number,
        filter: BasicFilter<EnterpriseQuotaRequestFilterBy, EnterpriseQuotaRequestOrderBy>) {
        console.log('SERVICE: Starting getEnterpriseLendersByPayer method');
        const payer = await EnterpriseDAO.getEnterpriseById(payerId);

        if (!payer || payer.status == EnterpriseStatusEnum.DELETED)
            throw new ConflictException('SCF.LIBERA.19', { enterpriseId: payerId });

        const enterpriseLendersPage = await EnterpriseFundingLinkDAO.getEnterpriseLendersByPayer(payerId, filter);
        console.log('enterpriseLendersPage -->>>', enterpriseLendersPage);

        if (!enterpriseLendersPage[1])
            return { totalEnterpriseLenders: 0, lenderQuotaRequests: [] };

        const totalEnterpriseLenders = enterpriseLendersPage[1];
        const lenderQuotaRequests: ILenderFundingLink[] = [];
        for (let { payer, lender, ratePercentage } of enterpriseLendersPage[0]) {
            const enterpriseFundingLink = await EnterpriseFundingLinkDAO.getBasicByLenderIdAndPayerId(lender.id, payer.id);
            const balanceData = await EnterpriseFundingLinkDAO.getGeneralBalance(enterpriseFundingLink.id);
            const lenderQuotaRequestItem: ILenderFundingLink = {
                id: lender.id,
                enterpriseName: lender.enterpriseName,
                nit: lender.nit,
                availableQuota: balanceData.generalBalance,
                grantedQuota: balanceData.totalFundingAmount,
                rate: ratePercentage ? ratePercentage : 0
            };
            lenderQuotaRequests.push(lenderQuotaRequestItem);
        };
        console.log('SERVICE: Ending getEnterpriseLendersByPayer method');
        return { totalEnterpriseLenders, lenderQuotaRequests };
    }

    static async getEnterprisePayersByLender(lenderId: number, filter: BasicFilter<LenderPayersFilterBy, string>) {
        console.log('SERVICE: Starting getEnterprisePayersByLender method');
        const lender = await EnterpriseDAO.getEnterpriseById(lenderId);

        if (!lender || lender.status == EnterpriseStatusEnum.DELETED)
            throw new ConflictException('SCF.LIBERA.19', { enterpriseId: lenderId });

        const enterprisePayersPage = await EnterpriseFundingLinkDAO.getEnterprisePayersByLender(lenderId, filter);
        console.log('enterprisePayersPage --->>>', enterprisePayersPage);


        if (!enterprisePayersPage[1])
            return { totalEnterprisePayers: 0, enterprisePayers: [] };

        const totalEnterprisePayers = enterprisePayersPage[1];
        const enterprisePayers: ILenderPayer[] = [];
        for (let { payer, lenderCustomAttributesLink } of enterprisePayersPage[0]) {
            const fundingLinkPayer = await EnterpriseFundingLinkDAO.getByLenderIdAndPayerId(lenderId, payer.id);
            const { userProperties } = payer.owner;

            let customAttributes: ICustomAttribute[] = await LenderCustomAttributesLinkDAO.getAllByEnterpriseFundingLinkId(fundingLinkPayer.id);

            for (let customAttribute of customAttributes) {

                if (customAttribute.type === CustomAttributesTypeEnum.CHECKBOX
                    || customAttribute.type === CustomAttributesTypeEnum.RADIO) {
                    // if type is radio o checkbox, get the list of options by the lender custom attribute id
                    customAttribute.options = await OptionCustomAttributesDAO.getOptionsByLenderCustomAttributesId(customAttribute.id);

                    console.log(`======> customAttribute.options obtained: ${JSON.stringify(customAttribute.options)}`);

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
                            console.log(ids);
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
            const enterprisePayerItem: ILenderPayer = {
                id: +payer.id,
                enterpriseName: payer.enterpriseName,
                nit: payer.nit,
                sector: {
                    id: payer.sector ? +payer.sector.id : null,
                    name: payer.sector ? payer.sector.name : null
                },
                enterpriseType: payer.type,
                owner: {
                    name: userProperties.name ? userProperties.name : null,
                    firstSurname: userProperties.firstSurname ? userProperties.firstSurname : null,
                    secondSurname: userProperties.secondSurname ? userProperties.secondSurname : null,
                    email: payer.owner.email
                },
                customAttributes
            };
            enterprisePayers.push(enterprisePayerItem);
        }
        console.log('enterprisePayers', enterprisePayers);

        console.log('SERVICE: Ending getEnterprisePayersByLender method');
        return { totalEnterprisePayers, enterprisePayers };
    }

    static async getPayerByLenderIdAndPayerId(lenderId: number, payerId: number) {
        console.log('SERVICE: Starting getPayerByLenderIdAndPayerId method');
        const lender = await EnterpriseDAO.getEnterpriseById(lenderId);

        if (!lender || lender.status == EnterpriseStatusEnum.DELETED)
            throw new ConflictException('SCF.LIBERA.19', { enterpriseId: lenderId });

        const payer = await EnterpriseDAO.getEnterpriseById(payerId);

        if (!payer || payer.status == EnterpriseStatusEnum.DELETED)
            throw new ConflictException('SCF.LIBERA.19', { enterpriseId: payerId });

        const { userProperties } = payer.owner;
        const fundingLinkPayer = await EnterpriseFundingLinkDAO.getByLenderIdAndPayerId(lenderId, payerId);

        if (!fundingLinkPayer)
            throw new ConflictException('SCF.LIBERA.219', { lenderId, payerId });

        console.log('FUNDING LINK', fundingLinkPayer.id);
        let customAttributes: ICustomAttribute[] = await LenderCustomAttributesLinkDAO.getAllByEnterpriseFundingLinkId(fundingLinkPayer.id);

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

        const enterpriseFundingLinkPayer: ILenderPayer = {
            id: +payer.id,
            enterpriseName: payer.enterpriseName,
            nit: payer.nit,
            sector: {
                id: payer.sector ? +payer.sector.id : null,
                name: payer.sector ? payer.sector.name : null
            },
            enterpriseType: payer.type,
            owner: {
                name: userProperties.name ? userProperties.name : null,
                firstSurname: userProperties.firstSurname ? userProperties.firstSurname : null,
                secondSurname: userProperties.secondSurname ? userProperties.secondSurname : null,
                email: payer.owner.email
            },
            customAttributes
        };

        console.log('SERVICE: Ending getPayerByLenderIdAndPayerId method');
        return enterpriseFundingLinkPayer;
    }
}