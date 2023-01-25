import { BaseEntity, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { AnswerCustomAttributes } from './answer-custom-attributes';
import { CatCustomAttributes } from './cat-custom-attributes';
import { EnterpriseFundingLink } from './enterprise-funding-link';

@Entity({ name: 'LENDER_CUSTOM_ATTRIBUTES_LINK' })
export class LenderCustomAttributesLink extends BaseEntity {

    @PrimaryGeneratedColumn({
        name: 'ID'
    })
    id: number;

    @ManyToOne(type => CatCustomAttributes, catCustomAttribute => catCustomAttribute.lenderCustomAttributesLinks)
    @JoinColumn({
        name: 'ATTRIBUTE_ID'
    })
    catCustomAttribute: CatCustomAttributes;

    @ManyToOne(type => EnterpriseFundingLink, enterpriseFundingLink => enterpriseFundingLink.lenderCustomAttributesLink)
    @JoinColumn({
        name: 'ENTERPRISE_FUNDING_LINK_ID'
    })
    enterpriseFundingLink: EnterpriseFundingLink;

    @OneToOne(type => AnswerCustomAttributes, answerCustomAttributes => answerCustomAttributes.lenderCustomAttributeLink)
    answersCustomAttributes: AnswerCustomAttributes;

    static getByFundingLinkIdAndCustomAttributeId(enterpriseFundingLinkId: number, customAttributeId: number) {
        return this.createQueryBuilder('lenderCustomAttributesLink')
            .leftJoinAndSelect('lenderCustomAttributesLink.enterpriseFundingLink', 'enterpriseFundingLink')
            .leftJoinAndSelect('lenderCustomAttributesLink.catCustomAttribute', 'customAttribute')
            .where('enterpriseFundingLink.id = :enterpriseFundingLinkId', { enterpriseFundingLinkId })
            .andWhere('customAttribute.id = :customAttributeId', { customAttributeId })
            .getOne();
    }

    static getAllByEnterpriseFundingLinkId(enterpriseFundingLinkId: number) {
        return this.createQueryBuilder('lenderCustomAttributesLink')
            .select('lenderCustomAttributesLink.id', 'id')
            .addSelect('customAttribute.name', 'name')
            .addSelect('customAttribute.id', 'attributeId')
            .addSelect('answer.value', 'value')
            .addSelect('customAttribute.type', 'type')
            .innerJoin('lenderCustomAttributesLink.enterpriseFundingLink', 'enterpriseFundingLink')
            .innerJoin('lenderCustomAttributesLink.catCustomAttribute', 'customAttribute')
            .innerJoin('lenderCustomAttributesLink.answersCustomAttributes', 'answer')
            .where('enterpriseFundingLink.id = :enterpriseFundingLinkId', { enterpriseFundingLinkId })
            .getRawMany();
    }

    static getById(id: number) {
        return this.createQueryBuilder('lenderCustomAttributesLink')
            .leftJoinAndSelect('lenderCustomAttributesLink.enterpriseFundingLink', 'enterpriseFundingLink')
            .leftJoinAndSelect('lenderCustomAttributesLink.catCustomAttribute', 'customAttribute')
            .where('lenderCustomAttributesLink.id = :id', { id })
            .getOne();
    }

    static getBasicByCatCustomAttributeId(catCustomAttributeId: number): Promise<LenderCustomAttributesLink[]> {
        return this.createQueryBuilder('lenderCustomAttributesLink')
            .leftJoinAndSelect('lenderCustomAttributesLink.answersCustomAttributes', 'answersCustomAttributes')
            .leftJoin('lenderCustomAttributesLink.catCustomAttribute', 'catCustomAttribute')
            .where('catCustomAttribute.id = :catCustomAttributeId', { catCustomAttributeId })
            .getMany();
    }

    static deleteByIds(lenderCustomAttrsLinkIds: number[]) {
        return this.createQueryBuilder('lenderCustomAttrLink')
            .delete()
            .where('id IN (:lenderCustomAttrsLinkIds)', { lenderCustomAttrsLinkIds })
            .execute();
    }
}