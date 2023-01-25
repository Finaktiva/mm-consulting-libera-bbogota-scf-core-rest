import { BaseEntity, Entity, Column, OneToMany, PrimaryColumn } from 'typeorm';
import { EnterpriseInvoice } from './enterprise-invoice';
import { EnterpriseInvoiceBulkNegotiation } from './enterprise-invoice-bulk-negotiation';

@Entity({ name: 'CAT_CURRENCY'})
export class CatCurrency extends BaseEntity{

    @PrimaryColumn({
        name: 'CODE',
        type: 'varchar'
    })
    code: string;

    @Column({
        name: 'DESCRIPTION',
        type: 'varchar'
    })
    description: string;

    @OneToMany(type => EnterpriseInvoice, enterpriseInvoice => enterpriseInvoice.currencyCode)
    enterpriseInvoice: EnterpriseInvoice[];

    @OneToMany(type => EnterpriseInvoiceBulkNegotiation, enterpriseInvoiceBulkNegotiation => enterpriseInvoiceBulkNegotiation.currencyCode)
    enterpriseInvoiceBulkNegotiation: EnterpriseInvoiceBulkNegotiation[];

    static getAllCurrencyCodes() {
        return this.createQueryBuilder('catCurrency')
            .orderBy("catCurrency.description", "ASC")
            .getMany();
    }

    static getByCode(code: string) {
        return this.createQueryBuilder('catCurrency')
            .where('catCurrency.code = :code', {code})
            .getOne()
    }

    static getCurrencyCode(invoiceId: number) {
        return this.createQueryBuilder('catCurrency')
        .leftJoin('catCurrency.enterpriseInvoice','enterpriseInvoice')
        .where('enterpriseInvoice.id = :invoiceId', {invoiceId})
        .getOne();
    }
}