import { BaseEntity, Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { EnterpriseInvoice } from './enterprise-invoice';
import { CatCustomAttributes } from './cat-custom-attributes';

@Entity({ name: 'ENTERPRISE_INVOICE_CUSTOM_ATTRIBUTES' })
export class EnterpriseInvoiceCustomAttributes extends BaseEntity {

    @ManyToOne(type => EnterpriseInvoice, enterpriseInvoice => enterpriseInvoice.enterpriseInvoiceCustomAttributes, { primary: true })
    @JoinColumn({ name: 'INVOICE_ID' })
    enterpriseInvoice: EnterpriseInvoice;

    @ManyToOne(type => CatCustomAttributes, cCustomAttributes => cCustomAttributes.enterpriseInvoiceCustomAttributes, { primary: true })
    @JoinColumn({ name: 'ATTRIBUTE_ID' })
    catCustomAttributes: CatCustomAttributes;

    @Column({ name: 'VALUE' })
    value: string;

    static getByAttributeId(attributeId: number) {
        return this.createQueryBuilder('eInvoiceCustomAttributes')
            .leftJoinAndSelect('eInvoiceCustomAttributes.catCustomAttributes', 'catCustomAttributes')
            .where('eInvoiceCustomAttributes.catCustomAttributes = :attributeId', { attributeId })
            .getOne();
    }

    static deleteInvoiceCA(invoiceId: number) {
        return this.createQueryBuilder('eInvoiceCustomAttributes')
            .leftJoinAndSelect('eInvoiceCustomAttributes.enterpriseInvoice', 'enterpriseInvoice')
            .delete()
            .where('enterpriseInvoice.id = :invoiceId', {invoiceId})
            .execute();
    }
}