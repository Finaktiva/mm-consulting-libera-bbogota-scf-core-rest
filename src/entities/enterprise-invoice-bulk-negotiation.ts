import { Entity, BaseEntity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany, OneToOne } from "typeorm";
import { User } from "./user";
import { EnterpriseInvoiceBulkNegotiationStatusEnum } from 'commons/enums/enterprise-invoice-bulk-negotiation-status.emun'
import { EnterpriseInvoice } from "./enterprise-invoice";
import { IFilterBasic } from "commons/interfaces/query-filters.interface";
import { FilterBulkNegotiationEnum } from "commons/enums/filter-by.enum";
import moment = require("moment");
import { Enterprise } from "./enterprise";
import { InvoiceNegotiationProcess } from "./enterprise-invoice-negotiation-process";
import { CatCurrency } from "./cat-currency";
import { RelationBulkNegotiation } from "./rel-enterprise-invoice-bulk-negotiation-request";

@Entity({ name: 'ENTERPRISE_INVOICE_BULK_NEGOTIATION_REQUEST' })
export class EnterpriseInvoiceBulkNegotiation extends BaseEntity {
    @PrimaryGeneratedColumn({
        name: 'ID'
    })
    id: number;

    @Column({
        name: 'FOLIO_NUMBER'
    })
    folioNumber: string;

    @Column({
        name: 'AMOUNT_INVOICES'
    })
    amountInvoices: number;

    @Column({
        name: 'AMOUNT'
    })
    amount: number

    @Column({
        name: 'CREATION_DATE',
        type: 'datetime'
    })
    creationDate: Date;

    @ManyToOne(type => User, user => user.bulkNegociationCreator)
    @JoinColumn({ name: 'CREATION_USER_ID' })
    creationUser: User

    @Column({
        name: 'FINISHED_DATE',
        type: 'datetime'
    })
    finishedDate: Date;

    @Column({
        name: 'STATUS',
        type: 'enum',
        enum: EnterpriseInvoiceBulkNegotiationStatusEnum
    })
    status: EnterpriseInvoiceBulkNegotiationStatusEnum;

    @Column({
        name: 'CURRENT_AMOUNT'
    })
    currentAmount: number;

    @ManyToOne(type => Enterprise, enterprise => enterprise.enterpriseInvoiceBulkNegotiation)
    @JoinColumn({ name: 'ENTERPRISE_ID' })
    enterprise: Enterprise;

    @ManyToOne(type => Enterprise, enterprise => enterprise.enterpriseInvoiceBulkNegotiationProvider)
    @JoinColumn({ name: 'PROVIDER_ID' })
    provider: Enterprise;

    @ManyToOne(type => Enterprise, enterprise => enterprise.enterpriseInvoiceBulkNegotiationLender)
    @JoinColumn({ name: 'LENDER_ID' })
    lender: Enterprise;

    @OneToOne(type => InvoiceNegotiationProcess, invoiceNegotiationProcess => invoiceNegotiationProcess.invoiceBulkNegotiationProcess)
    @JoinColumn({
        name: 'INVOICE_BULK_NEGOTIATION_PROCESS_ID'
    })
    invoiceNegotiationProcess: InvoiceNegotiationProcess;

    @OneToMany(type => EnterpriseInvoice, enterpriseInvoice => enterpriseInvoice.bulkNegotiation)
    enterpriseInvoice: EnterpriseInvoice[];

    @ManyToOne(type => CatCurrency, catCurrency => catCurrency.enterpriseInvoiceBulkNegotiation)
    @JoinColumn({ name: 'CURRENCY_CODE' })
    currencyCode: CatCurrency;

    @OneToMany(type => RelationBulkNegotiation, relationBulkNegotiation => relationBulkNegotiation.invoiceBulkNegotiation)
    realtionBulkNegotiation: RelationBulkNegotiation[];

    @Column({
        name: 'PAYER_CURRENT_AMOUNT_REQUESTED'
    })
    payerCurrentAmount: number

    @Column({
        name: 'PROVIDER_CURRENT_AMOUNT_REQUESTED'
    })
    providerCurrentAmount: number

    static getAllPayerBulkDiscountNegotiations(enterpriseId: number, params: IFilterBasic) {
        const queryBuilder = this.createQueryBuilder('bulkNegotiation')
            .leftJoinAndSelect('bulkNegotiation.creationUser','creationUser')
            .leftJoinAndSelect('bulkNegotiation.enterprise','payer')
            .leftJoinAndSelect('bulkNegotiation.provider','provider')
            .where('payer.id = :enterpriseId', {enterpriseId})

            if (params.filterBy) {
                let date = '';
                switch (params.filterBy) {
                    case FilterBulkNegotiationEnum.CREATION_DATE:
                        date = moment(params.q, moment.ISO_8601).toISOString();
                        queryBuilder.andWhere(`DATE_FORMAT(bulkNegotiation.creationDate, '%y-%M-%d') = DATE_FORMAT(:date, '%y-%M-%d')`, { date });
                        break;
                    case FilterBulkNegotiationEnum.ENTERPRISE_NAME:
                        queryBuilder.andWhere('provider.enterpriseName LIKE :enterpriseName', { enterpriseName: `%${params.q.replace(/ /g,'%')}%` });
                        break;
                    case FilterBulkNegotiationEnum.FOLIO:
                        queryBuilder.andWhere('bulkNegotiation.folioNumber LIKE :folioNumber', { folioNumber: `%${params.q.replace(/ /g,'%')}%` });
                        break;
                    case FilterBulkNegotiationEnum.STATUS:
                        queryBuilder.andWhere('bulkNegotiation.status = :status', { status: params.q });
                        break;
                }
            }
            return queryBuilder.skip(((params.page - 1) * params.perPage)).take(params.perPage).getManyAndCount();
    }

    static getInvoiceBulkNegotiationsById(enterpriseId: number, bulkNegotiationId: number) {
        const queryBuilder = this.createQueryBuilder('bulkNegotiation')
            .leftJoinAndSelect('bulkNegotiation.enterprise', 'enterprise')
            .leftJoinAndSelect('bulkNegotiation.provider', 'provider')
            .leftJoinAndSelect('bulkNegotiation.lender', 'lender')
            .leftJoinAndSelect('bulkNegotiation.invoiceNegotiationProcess', 'invoiceNegotiationProcess')
            .leftJoinAndSelect('bulkNegotiation.creationUser', 'creationUser')
            .leftJoinAndSelect('bulkNegotiation.realtionBulkNegotiation', 'realtionBulkNegotiation')
            .leftJoinAndSelect('realtionBulkNegotiation.enterpriseInvoice', 'enterpriseInvoice')
            .leftJoinAndSelect('enterpriseInvoice.provider', 'eIProvider')
            .leftJoinAndSelect('enterpriseInvoice.currencyCode', 'currencyCode')
            .where('bulkNegotiation.id = :bulkNegotiationId', { bulkNegotiationId })
            .andWhere('enterprise.id = :enterpriseId', { enterpriseId })
        return queryBuilder.getOne();
    }

    static getAllByProviderEnterpriseIdAndFilters(enterpriseId: number, params: IFilterBasic) {
        const queryBuilder = this.createQueryBuilder('bulkNegotiation')
            .leftJoinAndSelect('bulkNegotiation.creationUser','creationUser')
            .leftJoinAndSelect('bulkNegotiation.enterprise','payer')
            .leftJoinAndSelect('bulkNegotiation.provider','provider')
            .where('provider.id = :enterpriseId', {enterpriseId})

            if (params.filterBy) {
                let date = '';
                switch (params.filterBy) {
                    case FilterBulkNegotiationEnum.CREATION_DATE:
                        date = moment(params.q, moment.ISO_8601).toISOString();
                        queryBuilder.andWhere(`DATE_FORMAT(bulkNegotiation.creationDate, '%y-%M-%d') = DATE_FORMAT(:date, '%y-%M-%d')`, { date });
                        break;
                    case FilterBulkNegotiationEnum.ENTERPRISE_NAME:
                        queryBuilder.andWhere('payer.enterpriseName LIKE :enterpriseName', { enterpriseName: `%${params.q.replace(/ /g,'%')}%` });
                        break;
                    case FilterBulkNegotiationEnum.FOLIO:
                        queryBuilder.andWhere('bulkNegotiation.folioNumber LIKE :folioNumber', { folioNumber: `%${params.q.replace(/ /g,'%')}%` });
                        break;
                    case FilterBulkNegotiationEnum.STATUS:
                        queryBuilder.andWhere('bulkNegotiation.status = :status', { status: params.q });
                        break;
                }
            }

            return queryBuilder.skip(((params.page - 1) * params.perPage)).take(params.perPage).getManyAndCount();
    }

    static getByIdAndEnterpriseId(bulkNegotiationId: number, enterpriseId: number) {
        return this.createQueryBuilder('bulkNegotiation')
        .leftJoinAndSelect('bulkNegotiation.invoiceNegotiationProcess','invoiceNegotiationProcess')
        .leftJoinAndSelect('bulkNegotiation.enterprise','enterprise')
        .where('bulkNegotiation.id = :bulkNegotiationId',{bulkNegotiationId})
        .andWhere('enterprise.id = :enterpriseId', {enterpriseId})
        .getOne();
    }

    static async getById(bulkNegotiationId: number){
        const queryBuilder = this.createQueryBuilder('bulkNegotiation')
            .leftJoinAndSelect('bulkNegotiation.enterprise', 'enterprise')
            .leftJoinAndSelect('bulkNegotiation.invoiceNegotiationProcess', 'invoiceNegotiationProcess')
            .leftJoinAndSelect('bulkNegotiation.provider', 'provider')
            .leftJoinAndSelect('bulkNegotiation.lender', 'lender')
            .leftJoinAndSelect('bulkNegotiation.creationUser', 'creationUser')
            .leftJoinAndSelect('bulkNegotiation.realtionBulkNegotiation', 'realtionBulkNegotiation')
            .leftJoinAndSelect('realtionBulkNegotiation.enterpriseInvoice', 'invoice')
            .leftJoinAndSelect('invoice.provider', 'eIProvider')
            .leftJoinAndSelect('invoice.currencyCode', 'currencyCode')
            .where('bulkNegotiation.id = :bulkNegotiationId', { bulkNegotiationId });
            
        return queryBuilder.getOne();
    }

    static getBasicDataBulkNegotiationById(enterpriseId: number, bulkNegotiationId: number) {
        const queryBuilder = this.createQueryBuilder('bulkNegotiation')
            .leftJoinAndSelect('bulkNegotiation.enterprise', 'enterprise')
            .leftJoinAndSelect('bulkNegotiation.lender','lender')
            .leftJoinAndSelect('bulkNegotiation.invoiceNegotiationProcess', 'invoiceNegotiationProcess')
            .where('bulkNegotiation.id = :bulkNegotiationId', { bulkNegotiationId })
            .andWhere('bulkNegotiation.status = :status', {status: EnterpriseInvoiceBulkNegotiationStatusEnum.NEGOTIATION_IN_PROGRESS })
            .andWhere('enterprise.id = :enterpriseId', { enterpriseId })
        return queryBuilder.getOne();
    }

    static getBasicDataBulkNegotiationByProviderId(enterpriseId: number, bulkNegotiationId: number) {
        const queryBuilder = this.createQueryBuilder('bulkNegotiation')
            .leftJoinAndSelect('bulkNegotiation.provider', 'provider')
            .leftJoinAndSelect('bulkNegotiation.invoiceNegotiationProcess', 'invoiceNegotiationProcess')
            .where('bulkNegotiation.id = :bulkNegotiationId', { bulkNegotiationId })
            .andWhere('bulkNegotiation.status = :status', {status: EnterpriseInvoiceBulkNegotiationStatusEnum.NEGOTIATION_IN_PROGRESS})
            .andWhere('provider.id = :enterpriseId', { enterpriseId })
        return queryBuilder.getOne();
    }
}