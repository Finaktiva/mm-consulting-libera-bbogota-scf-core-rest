import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { AnswerOptions } from './answer-options';
import { LenderCustomAttributesLink } from './lender-custom-attributes-link';
import { OptionCustomAttributes } from './option-custom-attributes';
import { User } from './user';

@Entity({ name: 'ANSWER_CUSTOM_ATTRIBUTES' })
export class AnswerCustomAttributes extends BaseEntity {

    @PrimaryGeneratedColumn({ name: 'ID' })
    id: number;

    @OneToOne(type => LenderCustomAttributesLink, lenderCustomAttributesService => lenderCustomAttributesService.answersCustomAttributes)
    @JoinColumn({
        name: 'ATTRIBUTE_LINK_ID'
    })
    lenderCustomAttributeLink: LenderCustomAttributesLink;

    @ManyToOne(type => OptionCustomAttributes, optionCustomAttributes => optionCustomAttributes.answersCustomAttributes)
    @JoinColumn({
        name: 'OPTION_ID'
    })
    optionCustomAttribute: OptionCustomAttributes;

    @Column({
        name: 'VALUE'
    })
    value: string;

    @Column({
        name: 'CREATION_DATE',
        type: 'date'
    })
    creationDate: Date;

    @ManyToOne(type => User, user => user.creationAnswersCustomAttributes)
    @JoinColumn({
        name: 'CREATION_USER'
    })
    creationUser: User;

    @Column({
        name: 'MODIFICATION_DATE',
        type: 'date'
    })
    modificationDate: Date;

    @ManyToOne(type => User, user => user.modificationAnswersCustomAttributes)
    @JoinColumn({
        name: 'MODIFICATION_USER'
    })
    modificationUser: User;

    @OneToMany(type => AnswerOptions, answerOptions => answerOptions.answerCustomAttribute)
    answersCustomAttribute: AnswerOptions[];

    static getByLenderCustomAttributeLinkId(lenderCustomAttributeLinkId: number) {
        return this.createQueryBuilder('answerCustomAttributes')
            .leftJoinAndSelect('answerCustomAttributes.lenderCustomAttributeLink', 'lenderCustomAttributeLink')
            .where('lenderCustomAttributeLink.id = :lenderCustomAttributeLinkId', { lenderCustomAttributeLinkId })
            .getOne();
    }

    /*
    static getAnswerByAttributeLinkAndAttributeLenderId(lenderAttributeLinkId: number, lenderAttributeId: number) {
        return this.createQueryBuilder('answerCustomAttributes')
            .leftJoinAndSelect('answerCustomAttributes.lenderCustomAttributeLink', 'lenderCustomAttributeLink')
            .leftJoinAndSelect('lenderCustomAttributeLink.lenderCustomAttribute', 'lenderCustomAttribute')
            .leftJoinAndSelect('lenderCustomAttributeLink.enterpriseFundingLink', 'enterpriseFundingLink')
            .where('lenderCustomAttribute.id = :lenderAttributeId', { lenderAttributeId })
            .andWhere('enterpriseFundingLink.id = :lenderAttributeLinkId', { lenderAttributeLinkId })
            .getOne();
    }
    */

    static deleteByLenderCustomAttrLinkIds(lenderCustomAttrLinkIds: number[]) {
        return this.createQueryBuilder('answerCustomAttr')
            .leftJoinAndSelect('answerCustomAttr.lenderCustomAttributeLink', 'lenderCustomAttributeLink')
            .delete()
            .where('lenderCustomAttributeLink.id IN (:lenderCustomAttrLinkIds)', { lenderCustomAttrLinkIds })
            .execute();
    }
}