import { CustomAttributesTypeEnum } from 'commons/enums/custom-attributes-type.enum';
import { LenderCustomAttributesOrderBy } from 'commons/filter';
import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { CatCustomAttributes } from './cat-custom-attributes';
import { Enterprise } from './enterprise';
import { User } from './user';

@Entity({ name: 'LENDER_CUSTOM_ATTRIBUTES' })
export class LenderCustomAttributes extends BaseEntity {

    @PrimaryGeneratedColumn({ name: 'ID' })
    id: number;

    @ManyToOne(type => Enterprise, enterprise => enterprise.lenderCustomAttributes)
    @JoinColumn({
        name: 'LENDER_ID'
    })
    lender: Enterprise;

    @ManyToOne(type => CatCustomAttributes, catCustomAttributes => catCustomAttributes.lenderCustomAttributes)
    @JoinColumn({
        name: 'ATTRIBUTE_ID'
    })
    customAttribute: CatCustomAttributes;

    @Column({
        name: 'CREATION_DATE',
        type: 'datetime'
    })
    creationDate: Date;

    @ManyToOne(type => User, user => user.lenderCustomAttributes)
    @JoinColumn({
        name: 'CREATION_USER'
    })
    creationUser: User;

    static getByLenderId(lenderId: number, orderBy: LenderCustomAttributesOrderBy) {
        const queryBuilder = this.createQueryBuilder('lenderCustomAttributes')
            .leftJoinAndSelect('lenderCustomAttributes.customAttribute', 'customAtributes')
            .where('lenderCustomAttributes.lender = :lenderId', { lenderId });
        if (orderBy != 'INVALID')
            queryBuilder.orderBy('lenderCustomAttributes.creationDate', orderBy);

        return queryBuilder.getMany();

    }

    /*
    static getByLenderIdAndAttribute(lenderId: number, attributeId: number) {
        return this.createQueryBuilder('lenderCustomAttribute')
            .leftJoinAndSelect('lenderCustomAttribute.customAttribute', 'customAttribute')
            .leftJoinAndSelect('lenderCustomAttribute.lender', 'lender')
            .where('lender.id = :lenderId', { lenderId })
            .andWhere('customAttribute.id = :attributeId', { attributeId })
            .getOne();
    }
    */

    static getById(customAttributeId: number) {
        return this.createQueryBuilder('lenderCustomAttribute')
            .leftJoinAndSelect('lenderCustomAttribute.lender', 'lender')
            .leftJoinAndSelect('lenderCustomAttribute.customAttribute', 'customAttribute')
            .where('lenderCustomAttribute.id = :customAttributeId', { customAttributeId })
            .getOne();
    }

    static getOptionsByAttributeId(attributeId: number) {
        return this.createQueryBuilder('lenderCustomAttribute')
            .leftJoinAndSelect('lenderCustomAttribute.customAttribute', 'catCustomAttributes')
            .leftJoinAndSelect('catCustomAttributes.optionsCustomAttributes', 'options')
            .where('lenderCustomAttribute.id =: attributeId', { attributeId })
            .getMany();
    }

    /*
    static getAnswersByLinkId(lenderCustomAttributeLinkId: number) {
        return this.createQueryBuilder('lenderCustomAttribute')
            .select('lenderCustomAttribute.id', 'id')
            .addSelect('custom.name', 'name')
            .addSelect('answer.value', 'value')
            .addSelect('custom.type', 'type')
            .innerJoin('lenderCustomAttribute.lenderCustomAttributesLink', 'link')
            .innerJoin('lenderCustomAttribute.customAttribute', 'custom')
            .innerJoin('link.answersCustomAttributes', 'answer')
            .where('link.enterpriseFundingLink =:linkId', { linkId: lenderCustomAttributeLinkId })
            .getRawMany();
    }
    */

    static validateByNameAndType(lenderId: number, name: string, attributeType: CustomAttributesTypeEnum) {
        return this.createQueryBuilder('lenderCustomAttribute')
            .leftJoinAndSelect('lenderCustomAttribute.customAttribute', 'customAttribute')
            .leftJoinAndSelect('lenderCustomAttribute.lender', 'lender')
            .where('lower(customAttribute.name) = :name', { name: name.toLocaleLowerCase() })
            .andWhere('customAttribute.type = :attributeType', { attributeType })
            .andWhere('lender.id = :lenderId', { lenderId })
            .getOne();
    }

    static deleteByLenderIdAndAttributeId(lenderId: number, attributeId: number) {
        return this.createQueryBuilder('lenderCustomAttr')
            .leftJoinAndSelect('lenderCustomAttr.lender', 'lender')
            .delete()
            .where('lender.id = :lenderId', { lenderId })
            .andWhere('customAttribute.id = :attributeId', { attributeId })
            .execute();
    }

    static getByLenderIdAndCatCustomAttrId(lenderId: number, catCustomAttributeId: number): Promise<LenderCustomAttributes> {
        return this.createQueryBuilder('lenderCustomAttribute')
            .leftJoinAndSelect('lenderCustomAttribute.lender', 'lender')
            .leftJoinAndSelect('lenderCustomAttribute.customAttribute', 'customAttribute')
            .where('lender.id = :lenderId', { lenderId })
            .andWhere('customAttribute.id = :catCustomAttributeId', { catCustomAttributeId })
            .getOne();
    }
}