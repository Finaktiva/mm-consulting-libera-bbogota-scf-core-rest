import { BaseEntity, Entity, ManyToOne, JoinColumn, Column } from 'typeorm';
import { Enterprise } from './enterprise';
import { CatCustomAttributes } from './cat-custom-attributes';
import { CreateEnterpriseCustomAttributes } from 'commons/interfaces/enterprise.interface';

@Entity({ name: 'ENTERPRISE_CUSTOM_ATTRIBUTES' })
export class EnterpriseCustomAttributes extends BaseEntity {

    @ManyToOne(type => Enterprise, enterprise => enterprise.enterpriseCustomAttributes, { primary: true })
    @JoinColumn({ name: 'ENTERPRISE_ID' })
    enterprise: Enterprise;

    @ManyToOne(type => CatCustomAttributes, customAttributes => customAttributes.enterpriseCustomAttributes, { primary: true })
    @JoinColumn({ name: 'ATTRIBUTE_ID' })
    customAttributes: CatCustomAttributes;

    @Column({
        name: 'CREATION_DATE',
        type: 'datetime'
    })
    creationDate: Date;
    
    static deleteEnterpriseCustomAttribute(enterpriseId: number, attributeId: number) {
        return this.createQueryBuilder('eCustomAttributes')
            .leftJoinAndSelect('eCustomAttributes.enterprise', 'enterprise')
            .delete()
            .where('enterprise = :enterpriseId', { enterpriseId })
            .andWhere('customAttributes = :attributeId', { attributeId })
            .execute();
    }
    
    static getManyByEnterpriseId(enterpriseId: number) {
        return this.createQueryBuilder('eCustomAttributes')
            .leftJoinAndSelect('eCustomAttributes.enterprise', 'enterprise')
            .leftJoinAndSelect('eCustomAttributes.customAttributes', 'customAttributes')
            .andWhere('enterprise.id = :enterpriseId', {enterpriseId})
            .getMany();
    }

    static getByAttributeId(attributeId: number) {
        return this.createQueryBuilder('eCustomAttributes')
            .leftJoinAndSelect('eCustomAttributes.enterprise', 'enterprise')
            .leftJoinAndSelect('eCustomAttributes.customAttributes','customAttributes')
            .where('customAttributes.id = :attributeId', { attributeId })
            .getOne(); 
    }

    static getByEnterpriseId(enterpriseId: number) {
        return this.createQueryBuilder('eCustomAttributes')
            .leftJoinAndSelect('eCustomAttributes.enterprise', 'enterprise')
            .leftJoinAndSelect('eCustomAttributes.customAttributes', 'customAttributes')
            .andWhere('enterprise.id = :enterpriseId', {enterpriseId})
            .getOne();
    }

    static getByEnterpriseIdTypeAndName(enterpriseId: number, cAttributeObj: CreateEnterpriseCustomAttributes){
        return this.createQueryBuilder('eCustomAttributes')
            .leftJoinAndSelect('eCustomAttributes.enterprise', 'enterprise')
            .leftJoinAndSelect('eCustomAttributes.customAttributes','customAttributes')
            .andWhere('enterprise.id = :enterpriseId', {enterpriseId})
            .andWhere('customAttributes.type = :type', { type: cAttributeObj.type })
            .andWhere('customAttributes.name = :name', { name: cAttributeObj.name })
            .getOne();
    }
}