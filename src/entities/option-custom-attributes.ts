import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { AnswerCustomAttributes } from './answer-custom-attributes';
import { AnswerOptions } from './answer-options';
import { CatCustomAttributes } from './cat-custom-attributes';
import { LenderCustomAttributes } from './lender-custom-attributes';
import { LenderCustomAttributesLink } from './lender-custom-attributes-link';

@Entity({ name: 'OPTION_CUSTOM_ATTRIBUTES' })
export class OptionCustomAttributes extends BaseEntity {

    @PrimaryGeneratedColumn({ name: 'ID' })
    id: number;

    @ManyToOne(type => CatCustomAttributes, catCustomattribute => catCustomattribute.optionsCustomAttributes)
    @JoinColumn({
        name: 'ATTRIBUTE_ID'
    })
    customAttribute: CatCustomAttributes;

    @Column({
        name: 'VALUE'
    })
    value: string;

    @OneToMany(type => AnswerCustomAttributes, answerCustomAttributes => answerCustomAttributes.optionCustomAttribute)
    answersCustomAttributes: AnswerCustomAttributes[];

    @OneToMany(type => AnswerOptions, answerOptions => answerOptions.optionCustomAttributes)
    answersOption: AnswerOptions;

    static getById(optionId: number) {
        return this.createQueryBuilder('optionCustomAttributes')
            .leftJoinAndSelect('optionCustomAttributes.customAttribute', 'customAttribute')
            .where('optionCustomAttributes.id = :optionId', { optionId })
            .getOne();
    }

    static getOptionsByAttributeId(attributeId: number): Promise<OptionCustomAttributes[]> {
        return this.createQueryBuilder('optionCustomAttributes')
            .where(qb => {
                const subQuery = qb.subQuery()
                    .select("customAttributes.id")
                    .from(CatCustomAttributes, 'customAttributes')
                    .where(qb => {
                        const subQuery = qb.subQuery()
                            .select('lenderCustomAttributes.customAttribute')
                            .from(LenderCustomAttributes, 'lenderCustomAttributes')
                            .where('lenderCustomAttributes.id = :attributeId', { attributeId })
                            .getQuery();
                        return `customAttributes.id IN ${subQuery}`;
                    }).getQuery();
                return `optionCustomAttributes.customAttribute IN ${subQuery}`;
            }).getMany();
    }

    static getOptionsByLenderCustomAttributesId(lenderCustomAttributesLinkId: number) {
        return this.createQueryBuilder('optionCustomAttributes')
            .where(qb => {
                const subQuery = qb.subQuery()
                    .select("customAttributes.id")
                    .from(CatCustomAttributes, 'customAttributes')
                    .where(qb => {
                        const subQuery = qb.subQuery()
                            .select('lenderCustomAttributesLink.catCustomAttribute')
                            .from(LenderCustomAttributesLink, 'lenderCustomAttributesLink')
                            .where('lenderCustomAttributesLink.id = :attributeId', { attributeId: lenderCustomAttributesLinkId })
                            .getQuery();
                        return `customAttributes.id IN ${subQuery}`;
                    }).getQuery();
                return `optionCustomAttributes.customAttribute IN ${subQuery}`;
            }).getMany();
    }
}