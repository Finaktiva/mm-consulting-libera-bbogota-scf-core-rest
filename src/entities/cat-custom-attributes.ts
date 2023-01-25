import { CustomAttributesTypeEnum } from 'commons/enums/custom-attributes-type.enum';
import { CreateEnterpriseCustomAttributes } from 'commons/interfaces/enterprise.interface';
import { BaseEntity, Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { EnterpriseCustomAttributes } from './enterprise-custom-attributes';
import { EnterpriseInvoiceCustomAttributes } from './enterprise-invoice-custom-attributes';
import { LenderCustomAttributes } from './lender-custom-attributes';
import { LenderCustomAttributesLink } from './lender-custom-attributes-link';
import { OptionCustomAttributes } from './option-custom-attributes';

@Entity({ name: 'CAT_CUSTOM_ATTRIBUTES' })
export class CatCustomAttributes extends BaseEntity {

    @PrimaryGeneratedColumn({ name: 'ID', type: 'bigint' })
    id: number;

    @Column({
        name: 'TYPE',
        type: 'enum',
        enum: CustomAttributesTypeEnum
    })
    type: CustomAttributesTypeEnum;

    @Column({
        name: 'NAME',
        type: 'varchar'
    })
    name: string;

    @Column({
        name: 'CREATION_DATE',
        type: 'datetime'
    })
    creationDate: Date;

    @OneToMany(type => EnterpriseInvoiceCustomAttributes, eInvoiceCustomAttributes => eInvoiceCustomAttributes.catCustomAttributes)
    enterpriseInvoiceCustomAttributes: EnterpriseInvoiceCustomAttributes[];

    @OneToMany(type => EnterpriseCustomAttributes, enterpriseCustomAttributes => enterpriseCustomAttributes.customAttributes)
    enterpriseCustomAttributes: EnterpriseCustomAttributes[];

    @OneToMany(type => LenderCustomAttributes, lenderCustomAttribute => lenderCustomAttribute.customAttribute)
    lenderCustomAttributes: LenderCustomAttributes[]

    @OneToMany(type => OptionCustomAttributes, optionCustomattribute => optionCustomattribute.customAttribute)
    optionsCustomAttributes: OptionCustomAttributes[];

    @OneToMany(type => LenderCustomAttributesLink, lenderCustomAttributesLinks => lenderCustomAttributesLinks.catCustomAttribute)
    lenderCustomAttributesLinks: LenderCustomAttributesLink[];

    static getByTypeAndName(cAttributeObj: CreateEnterpriseCustomAttributes) {
        return this.createQueryBuilder('customAttributes')
            .where('customAttributes.type = :type', { type: cAttributeObj.type })
            .andWhere('customAttributes.name = :name', { name: cAttributeObj.name })
            .getOne();
    }

    static getByCustomAttribute(attributeId: number) {
        return this.createQueryBuilder('customAttributes')
            .where('customAttributes.id = :attributeId', { attributeId })
            .getOne();
    }

    static deleteAttribute(attributeId: number) {
        return this.createQueryBuilder('customAttributes')
            .delete()
            .where('id = :attributeId', { attributeId })
            .execute();
    }
    static getvalidateByTypeAndName(name, type) {
        return this.createQueryBuilder('customAttributes')
            .where('customAttributes.type = :type', { type })
            .andWhere('customAttributes.name = :name', { name })
            .getOne();
    }

}