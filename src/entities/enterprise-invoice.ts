import moment from 'moment';
import { BaseEntity, Entity, Column, PrimaryGeneratedColumn, JoinColumn, OneToMany, ManyToOne, OneToOne } from 'typeorm';
import { Enterprise } from './enterprise';
import { EnterpriseInvoiceStatusEnum } from 'commons/enums/enterprise-invoice-status.enum';
import { EnterpriseInvoiceTypeEnum } from 'commons/enums/enterprise-invoice-type.enum';
import { EnterpriseInvoicePaymentTypeEnum } from 'commons/enums/enterprise-invoice-payment-type.enum';
import { EnterpriseInvoiceCustomAttributes } from './enterprise-invoice-custom-attributes';
import { FilterEnterprises } from 'commons/filter';
import { CatCurrency } from './cat-currency';
import { InvoiceNegotiationProcess } from './enterprise-invoice-negotiation-process';
import { FilterEnterpriseInvoiceEnum, FilterLastInvoiceNegotiationEnum } from 'commons/enums/filter-by.enum';
import { User } from './user';
import { EnterpriseInvoiceBulk } from './enterprise-invoice-bulk';
import { EnterpriseInvoiceFundingProcess } from './enterprise-invoice-funding-process';
import { EnterpriseInvoiceFiles } from './enterprise-invoice-files';
import { EnterpriseFundingTransactions } from './enterprise-funding-transaccions';
import { EnterpriseInvoiceBulkNegotiation } from './enterprise-invoice-bulk-negotiation';
import { RelationBulkNegotiation } from './rel-enterprise-invoice-bulk-negotiation-request';
import LiberaUtils from 'commons/libera.utils';
import { CreateNewNegotiationBulk } from 'commons/interfaces/payer-interfaces/create-new-negotiation-bulk';
import { UpdateNegotiationById } from 'commons/interfaces/invoice-negotiation-process.interface';

@Entity({ name: 'ENTERPRISE_INVOICE' })
export class EnterpriseInvoice extends BaseEntity {
    @PrimaryGeneratedColumn({ name: 'ID'})
    id: number;

    @ManyToOne(type => Enterprise, enterprise => enterprise.enterpriseInvoice)
    @JoinColumn({ name: 'ENTERPRISE_ID' })
    enterprise: Enterprise;

    @Column({ name: 'CREATION_DATE' })
    creationDate: Date;

    @ManyToOne(type => User, user => user.invoiceCreator)
    @JoinColumn({ name: 'CREATION_USER' })
    creationUser: User;

    @Column({ name: 'STATUS', type: 'enum', enum: EnterpriseInvoiceStatusEnum })
    status: EnterpriseInvoiceStatusEnum;

    @Column({ name: 'EMISSION_DATE' })
    emissionDate: Date;

    @Column({ name: 'DOCUMENT_TYPE', type: 'enum', enum: EnterpriseInvoiceTypeEnum })
    documentType: EnterpriseInvoiceTypeEnum;

    @Column({ name: 'INVOICE_NUMBER', type: 'varchar' })
    invoiceNumber: string;

    @Column({ name: 'EXPIRATION_DATE' })
    expirationDate: Date;

    @Column({ name: 'ALTERNATIVE_INVOICE_NUMBER' })
    alternativeInvoiceNumber: string;

    @Column({ name: 'PAYMENT_TYPE', type: 'enum', enum: EnterpriseInvoicePaymentTypeEnum })
    paymentType: EnterpriseInvoicePaymentTypeEnum;

    @Column({ name: 'AMOUNT' })
    amount: number;

    @ManyToOne(type => CatCurrency, catCurrency => catCurrency.enterpriseInvoice)
    @JoinColumn({ name: 'CURRENCY_CODE' })
    currencyCode: CatCurrency;

    @Column({ name: 'VAT' })
    vat: string;

    @Column({ name: 'ADVANCE_PAYMENT' })
    advancePayment: number;

    @Column({ name: 'RETENTIONS' })
    retentions: string;

    @Column({ name: 'CREDIT_NOTES_VALUE' })
    creditNotesValue: string;

    @OneToMany(type => EnterpriseInvoiceCustomAttributes, eInvoiceCustomAttributes => eInvoiceCustomAttributes.enterpriseInvoice)
    enterpriseInvoiceCustomAttributes: EnterpriseInvoiceCustomAttributes[];

    @ManyToOne(type => Enterprise, enterprise => enterprise.enterpriseInvoiceProvider)
    @JoinColumn({ name: 'PROVIDER_ID' })
    provider: Enterprise;

    @OneToMany(type => InvoiceNegotiationProcess, eInvoiceNegotiationProcess => eInvoiceNegotiationProcess.enterpriseInvoice)
    invoiceNegotiationProcess: InvoiceNegotiationProcess[];

    @Column({ name: 'PAYMENT_DATE', type: Date })
    paymentDate: Date;

    @ManyToOne(type => EnterpriseInvoiceBulk, enterpriseInvoiceBulk => enterpriseInvoiceBulk.enterpriseInvoice)
    @JoinColumn({ name: 'ENTERPRISE_INVOICE_BULK_ID' })
    enterpriseInvoiceBulk: EnterpriseInvoiceBulk;

    @Column({ name: 'PAYMENT_SPECIFICATIONS' })
    paymentSpecifications: string;

    @Column({ name: 'CURRENT_EXPECTED_PAYMENT_DATE', type: Date })
    currentExpectedPaymentDate: Date;

    @Column({ name: 'CURRENT_DISCOUNT_PERCENTAGE' })
    currentDiscountPercentage: number;

    @Column({ name: 'CURRENT_AMOUNT' })
    currentAmount: number;

    @Column({ 
        name: 'EFFECTIVE_PAYMENT_DATE', 
        type: 'datetime'
    })
    effectivePaymentDate: Date;

    @Column({ name: 'EFFECTIVE_PAYMENT_AMOUNT' })
    effectivePaymentAmount: number;

    @ManyToOne(type => Enterprise, enterprise => enterprise.enterpriseInvoiceLender)
    @JoinColumn({ name: 'LENDER_ID' })
    lender: Enterprise;

    @OneToMany(type => EnterpriseInvoiceFundingProcess, invoiceFundingProcess => invoiceFundingProcess.enterpriseInvoice)
    invoiceFundingProcess: EnterpriseInvoiceFundingProcess[];

    @OneToMany(type => EnterpriseInvoiceFiles, invoiceFiles => invoiceFiles.enterpriseInvoice)
    invoiceFiles: EnterpriseInvoiceFiles[];

    @OneToMany(type => EnterpriseFundingTransactions, enterpriseFundingTransactions => enterpriseFundingTransactions.enterpriseInvoice)
    enterpriseFundingTransactions: EnterpriseFundingTransactions[];
    
    @OneToMany(type => EnterpriseFundingTransactions, fundingTransactions => fundingTransactions.enterpriseInvoice)
    invoiceFundingTransaction: EnterpriseInvoiceFundingProcess[];

    @OneToOne(type => EnterpriseInvoiceBulkNegotiation, bulkNegotiation => bulkNegotiation.enterpriseInvoice)
    @JoinColumn({ name: 'CURRENT_INVOICE_BULK_NEGOTIATION_ID' })
    bulkNegotiation: EnterpriseInvoiceBulkNegotiation;

    @OneToMany(type => RelationBulkNegotiation, relationBulkNegotiation => relationBulkNegotiation.enterpriseInvoice)
    realtionBulkNegotiation: RelationBulkNegotiation[];
    
    static getByEnterpriseId(enterpriseId: number, filter: FilterEnterprises) {
        let date;
        const queryBuilder = this.createQueryBuilder('enterpriseInvoice')
            .leftJoinAndSelect('enterpriseInvoice.enterprise', 'enterprise')
            .leftJoinAndSelect('enterpriseInvoice.invoiceNegotiationProcess', 'NegotiationProcess')
            .leftJoinAndSelect('enterpriseInvoice.currencyCode', 'currencyCode')
            .leftJoinAndSelect('enterpriseInvoice.provider', 'provider')
            .leftJoinAndSelect('provider.owner', 'providerOwner')
            .leftJoinAndSelect('providerOwner.userProperties', 'providerUserProperties')
            .leftJoinAndSelect('enterpriseInvoice.lender', 'lender')
            .leftJoinAndSelect('lender.owner', 'lenderOwner')
            .leftJoinAndSelect('lenderOwner.userProperties', 'lenderUserProperties')   
            .leftJoinAndSelect('enterpriseInvoice.enterpriseInvoiceCustomAttributes', 'enterpriseInvoiceCustomAttributes')
            .leftJoinAndSelect('enterpriseInvoiceCustomAttributes.catCustomAttributes', 'catCustomAttributes')
            .leftJoinAndSelect('enterpriseInvoice.bulkNegotiation', 'bulkNegotiation')
            .andWhere('enterprise.id = :enterpriseId', {enterpriseId})
            .orderBy('enterpriseInvoice.creationDate', 'DESC');

        
        if (filter.status) {
            if (filter.status === EnterpriseInvoiceStatusEnum.PAID) {
                queryBuilder.andWhere('enterpriseInvoice.status = :status', { status: filter.status })
                    .andWhere('enterpriseInvoice.status = :status', { status: EnterpriseInvoiceStatusEnum.PAYMENT_CONFIRMED.toString() });
            } else {
                queryBuilder.andWhere('enterpriseInvoice.status = :status', { status: filter.status });
            }
        }

        if (filter.filter_by) {
            switch (filter.filter_by) {
                case FilterEnterpriseInvoiceEnum.invoiceNumber:
                    queryBuilder.andWhere('enterpriseInvoice.invoiceNumber = :iNumber', { iNumber: filter.q });
                    break;
                case FilterEnterpriseInvoiceEnum.paymentExpirationDate:
                    date = moment(filter.q, moment.ISO_8601).toISOString();
                    console.log('date ', date);
                    queryBuilder.andWhere(`DATE_FORMAT(enterpriseInvoice.expirationDate, '%y-%M-%d') = DATE_FORMAT(:date, '%y-%M-%d')`, { date });
                    break;
                case FilterEnterpriseInvoiceEnum.expirationDate:
                    date = moment(filter.q, moment.ISO_8601).toISOString();
                    console.log('date ', date);
                    queryBuilder.andWhere(`DATE_FORMAT(enterpriseInvoice.expirationDate, '%y-%M-%d') = DATE_FORMAT(:date, '%y-%M-%d')`, { date });
                    break;
                case FilterEnterpriseInvoiceEnum.provider:
                    queryBuilder.andWhere('provider.enterpriseName LIKE (:name)', { name: `%${filter.q.replace(/ /g,'%')}%` });
                    break;
            }
        }

        return queryBuilder.skip(((filter.page - 1) * filter.per_page))
            .take(filter.per_page).getManyAndCount();
    }

    static getInvoiceById(enterpriseId: number, invoiceId: number) {
        return this.createQueryBuilder('eInvoice')
            .leftJoinAndSelect('eInvoice.enterprise', 'enterprise')
            .leftJoinAndSelect('eInvoice.creationUser', 'creationUser')
            .leftJoinAndSelect('enterprise.owner', 'enterpriseOwner')
            .leftJoinAndSelect('enterpriseOwner.userProperties', 'userProperties')
            .leftJoinAndSelect('eInvoice.currencyCode', 'catCurrency')
            .leftJoinAndSelect('eInvoice.invoiceNegotiationProcess', 'negotiationProcess')
            .leftJoinAndSelect('eInvoice.provider', 'provider')
            .leftJoinAndSelect('provider.owner', 'providerOwner')
            .leftJoinAndSelect('providerOwner.userProperties', 'providerUserProperties')
            .leftJoinAndSelect('eInvoice.enterpriseInvoiceCustomAttributes', 'invoiceCustomAttributes')
            .leftJoinAndSelect('invoiceCustomAttributes.catCustomAttributes', 'catCustomAttributes')
            .leftJoinAndSelect('eInvoice.lender', 'lender')
            .leftJoinAndSelect('lender.owner', 'lenderOwner')
            .leftJoinAndSelect('lenderOwner.userProperties', 'lenderUserProperties')
            .leftJoinAndSelect('eInvoice.bulkNegotiation','bulkNegotiation')
            .leftJoinAndSelect('bulkNegotiation.invoiceNegotiationProcess','bulkProcess')
            .where('eInvoice.id =:invoiceId', {invoiceId})
            .andWhere('enterprise.id =:enterpriseId', {enterpriseId})
            .getOne();
    }

    static deleteEnterpriseInvoice(enterpriseId: number, invoiceId: number) {
        return this.createQueryBuilder('enterpriseInvoice')
            .leftJoinAndSelect('enterpriseInvoice.enterprise', 'enterprise')
            .delete()
            .andWhere('enterprise.id = :enterpriseId', {enterpriseId})
            .andWhere('id = :invoiceId', {invoiceId})
            .execute();
    }

    static getInvoiceByIdAndEnterpriseId(invoiceId: number, enterpriseId: number) {
        return this.createQueryBuilder('enterpriseInvoice')
            .leftJoinAndSelect('enterpriseInvoice.enterprise', 'enterprise')
            .leftJoinAndSelect('enterpriseInvoice.enterpriseInvoiceCustomAttributes', 'enterpriseInvoiceCustomAttributes')
            .leftJoinAndSelect('enterpriseInvoice.invoiceNegotiationProcess', 'invoiceNegotiationProcess')
            .where('enterpriseInvoice.id = :invoiceId', {invoiceId})
            .andWhere('enterprise.id = :enterpriseId', {enterpriseId})
            .getOne();
    }

    static getInvoiceByEnterpriseId(invoiceId: number, enterpriseId: number) {
        return this.createQueryBuilder('enterpriseInvoice')
            .leftJoinAndSelect('enterpriseInvoice.enterprise', 'enterprise')
            .leftJoinAndSelect('enterpriseInvoice.provider', 'provider')
            .leftJoinAndSelect('enterpriseInvoice.lender', 'lender')
            .where('enterpriseInvoice.id = :invoiceId', {invoiceId})
            .andWhere('enterprise.id = :enterpriseId', {enterpriseId})
            .getOne();
    }

    static getEnterpriseInvoiceById(invoiceId: number) {
        return this.createQueryBuilder('eInvoice')
            .leftJoinAndSelect('eInvoice.enterprise', 'enterprise')
            .leftJoinAndSelect('eInvoice.provider', 'provider')
            // .leftJoinAndSelect('eInvoice.lender', 'lender') pendiente de actualizacion para cargas masivas
            .where('eInvoice.id = :invoiceId', {invoiceId})
            .getOne();
    }
    
    static getBasicEnterpriseInvoice(enterpriseId: number, invoiceId: number) {
        return this.createQueryBuilder('enterpriseInvoice')
        .leftJoinAndSelect('enterpriseInvoice.enterprise', 'enterprise')
        .leftJoinAndSelect('enterpriseInvoice.invoiceNegotiationProcess', 'invoiceNegotiationProcess')
        .where('enterpriseInvoice.id = :invoiceId', {invoiceId})
        .andWhere('enterprise.id = :enterpriseId', {enterpriseId})
        .getOne();
    }

    static updateInvoiceStatus(invoiceId: number, status: EnterpriseInvoiceStatusEnum) {
        return this.createQueryBuilder('enterpriseInvoice')
            .update(EnterpriseInvoice)
            .set({status})
            .where('id = :invoiceId', {invoiceId})
            .execute();
    }
    
    static getInvoiceByPayerIdAndInvoiceId(enterpriseId: number, invoiceId: number) {
        return this.createQueryBuilder('eInvoice')
            .leftJoinAndSelect('eInvoice.provider', 'provider')
            .leftJoinAndSelect('eInvoice.enterprise', 'enterprise')
            .leftJoinAndSelect('eInvoice.invoiceNegotiationProcess', 'invoiceNegotiationProcess')
            .leftJoinAndSelect('eInvoice.lender', 'lender')
            .leftJoinAndSelect('lender.owner', 'lenderOwner')
            .leftJoinAndSelect('eInvoice.currencyCode', 'catCurrency')
            .where('eInvoice.id = :invoiceId', {invoiceId})
            .andWhere('enterprise.id = :enterpriseId', {enterpriseId})
            .getOne();
    }
    
    static getBasicEnterpriseInvoiceByIdAndProviderId(enterpriseId: number, invoiceId: number) {
        return this.createQueryBuilder('enterpriseInvoice')
        .leftJoinAndSelect('enterpriseInvoice.provider', 'provider')
        .leftJoinAndSelect('enterpriseInvoice.invoiceNegotiationProcess', 'invoiceNegotiationProcess')
        .where('enterpriseInvoice.id = :invoiceId', {invoiceId})
        .andWhere('provider.id = :enterpriseId', {enterpriseId})
        .getOne();
    }

    static getInvoiceProviderById(enterpriseId: number, invoiceId: number) {
        return this.createQueryBuilder('eInvoice')
            .leftJoinAndSelect('eInvoice.enterprise', 'enterprise')
            .leftJoinAndSelect('eInvoice.creationUser', 'creationUser')
            .leftJoinAndSelect('enterprise.owner', 'enterpriseOwner')
            .leftJoinAndSelect('enterpriseOwner.userProperties', 'userProperties')
            .leftJoinAndSelect('eInvoice.currencyCode', 'catCurrency')
            .leftJoinAndSelect('eInvoice.invoiceNegotiationProcess', 'negotiationProcess')
            .leftJoinAndSelect('eInvoice.provider', 'provider')
            .leftJoinAndSelect('provider.owner', 'providerOwner')
            .leftJoinAndSelect('providerOwner.userProperties', 'providerUserProperties')
            .leftJoinAndSelect('eInvoice.enterpriseInvoiceCustomAttributes', 'invoiceCustomAttributes')
            .leftJoinAndSelect('invoiceCustomAttributes.catCustomAttributes', 'catCustomAttributes')
            .leftJoinAndSelect('eInvoice.lender', 'lender')
            .leftJoinAndSelect('lender.owner', 'lenderOwner')
            .leftJoinAndSelect('lenderOwner.userProperties', 'lenderUserProperties')
            .leftJoinAndSelect('eInvoice.bulkNegotiation','bulkNegotiation')
            .leftJoinAndSelect('bulkNegotiation.invoiceNegotiationProcess','bulkProcess')
            .where('eInvoice.id = :invoiceId', {invoiceId})
            .andWhere('provider.id = :enterpriseId', {enterpriseId})
            .getOne();
    }
    
    static getInvoiceWithStatus(invoiceId: number) {
        return this.createQueryBuilder('enterpriseInvoice')
            .leftJoinAndSelect('enterpriseInvoice.enterprise','enterprise')
            .leftJoinAndSelect('enterpriseInvoice.provider', 'provider')
            .where('enterpriseInvoice.id = :invoiceId', {invoiceId})
            .andWhere('enterpriseInvoice.status IN (:status)', { status: [EnterpriseInvoiceStatusEnum.AVAILABLE, EnterpriseInvoiceStatusEnum.LOADED] })
            .getOne();
    }

    static deleteInvoiceOfBulk(invoiceId: number) {
        return this.createQueryBuilder('enterpriseInvoice')
            .delete()
            .andWhere('enterpriseInvoice.id = :invoiceId', {invoiceId})
            .execute();
    }

    static getByInvoiceNumber(enterpriseId: number, invoiceNumber: string) {
        return this.createQueryBuilder('enterpriseInvoice')
            .where('enterpriseInvoice.enterprise = :enterpriseId', { enterpriseId })
            .andWhere('enterpriseInvoice.invoiceNumber = :invoiceNumber', { invoiceNumber })
            .getOne();
    }
    
    static getProviderInvoicesByEnterpriseId(enterpriseId: number, params: any) {
        const queryBuilder = this.createQueryBuilder('enterpriseInvoice')
            .leftJoinAndSelect('enterpriseInvoice.enterprise', 'enterprise')
            .leftJoinAndSelect('enterpriseInvoice.creationUser', 'creationUser')
            .leftJoinAndSelect('enterprise.owner', 'owner')
            .leftJoinAndSelect('owner.userProperties', 'payerUserProperties')
            .leftJoinAndSelect('enterpriseInvoice.invoiceNegotiationProcess', 'eInvoiceNegotiation')
            .leftJoinAndSelect('enterpriseInvoice.currencyCode', 'currencyCode')
            .leftJoinAndSelect('enterpriseInvoice.provider', 'provider')
            .leftJoinAndSelect('provider.owner', 'providerOwner')
            .leftJoinAndSelect('providerOwner.userProperties', 'providerUserProperties')
            .leftJoinAndSelect('enterpriseInvoice.lender', 'lender')
            .leftJoinAndSelect('lender.owner', 'lenderOwner')
            .leftJoinAndSelect('lenderOwner.userProperties', 'lenderUserProperties')   
            .leftJoinAndSelect('enterpriseInvoice.enterpriseInvoiceCustomAttributes', 'enterpriseInvoiceCustomAttributes')
            .leftJoinAndSelect('enterpriseInvoiceCustomAttributes.catCustomAttributes', 'catCustomAttributes')
            .andWhere('provider.id = :enterpriseId', { enterpriseId })
            .orderBy('enterpriseInvoice.creationDate', 'DESC');

        if (params.filterBy) {
            let date = '';
            switch (params.filterBy) {
                case FilterLastInvoiceNegotiationEnum.invoiceNumber:
                    queryBuilder.andWhere('enterpriseInvoice.invoiceNumber = :invoiceNumber', { invoiceNumber: params.q });
                    break;
                case FilterLastInvoiceNegotiationEnum.payer:
                    queryBuilder.andWhere('enterprise.enterpriseName LIKE :payer', { payer: `%${params.q.replace(/ /g,'%')}%` });
                    break;
                case FilterLastInvoiceNegotiationEnum.nit:
                    queryBuilder.andWhere('enterprise.nit = :nit', { nit : params.q });
                    break;
                case FilterLastInvoiceNegotiationEnum.startingDate:
                    date = moment(params.q, moment.ISO_8601).toISOString();
                    queryBuilder.andWhere(`DATE_FORMAT(eInvoiceNegotiation.creationDate, '%y-%M-%d') = DATE_FORMAT(:date, '%y-%M-%d')`, { date });
                    break;
                case FilterLastInvoiceNegotiationEnum.effectivePaymentDate:
                    date = moment(params.q, moment.ISO_8601).toISOString();
                    queryBuilder.andWhere(`DATE_FORMAT(eInvoiceNegotiation.currentExpectedPaymentDate, '%y-%M-%d') = DATE_FORMAT(:date, '%y-%M-%d')`, { date });
                    break;
                case FilterLastInvoiceNegotiationEnum.discountDueDate:
                    date = moment(params.q, moment.ISO_8601).toISOString();
                    queryBuilder.andWhere(`DATE_FORMAT(eInvoiceNegotiation.currentDiscountDueDate, '%y-%M-%d') = DATE_FORMAT(:date, '%y-%M-%d')`, { date });
                    break;
                case FilterLastInvoiceNegotiationEnum.discountPercentage:
                    queryBuilder.andWhere('eInvoiceNegotiation.currentDiscountPercentage = :discountPercentage', { discountPercentage: +params.q });
                    break;
            }
        }
        return queryBuilder.skip(((params.page - 1) * params.perPage)).take(params.perPage)
            .getManyAndCount();
    }

    static getByFundingId(enterpriseId: number, invoiceId: number) {
        return this.createQueryBuilder('invoice')
            .leftJoinAndSelect('invoice.invoiceFundingProcess','invoiceFundingProcess')
            .leftJoinAndSelect('invoice.currencyCode','currencyCode')
            .leftJoinAndSelect('invoice.invoiceNegotiationProcess','invoiceNegotiationProcess')
            .leftJoinAndSelect('invoice.provider', 'provider')
            .leftJoinAndSelect('invoice.enterprise','enterprise')
            .where('invoice.lender = :enterpriseId ', {enterpriseId})
            .andWhere('invoice.id = :invoiceId', {invoiceId})
            .getOne();
    }

    static updateInvoiceCurrentAmount (invoiceId: number, currentAmount: number) {
        return this.createQueryBuilder('enterpriseInvoice')
            .update(EnterpriseInvoice)
            .set({currentAmount})
            .where('id = :invoiceId', {invoiceId})
            .execute();
    }
    
    static getInvoiceAvailableWithIdAndEnterpriseId(invoiceId: number, enterpriseId: number) {
        return this.createQueryBuilder('enterpriseInvoice')
            .leftJoinAndSelect('enterpriseInvoice.enterprise', 'enterprise')
            .where('enterprise.id = :enterpriseId', {enterpriseId})
            .andWhere('enterpriseInvoice.id = :invoiceId', {invoiceId})
            .andWhere('enterpriseInvoice.status NOT IN (:status)', { status: [EnterpriseInvoiceStatusEnum.DELETED] })
            .getOne();
    }

    static getTotalInvoicesLoadedByEnterpriseInvoiceBulkId(enterpriseInvoiceBulkId: number) {
        return this.createQueryBuilder('enterpriseInvoice')
        .leftJoin('enterpriseInvoice.enterpriseInvoiceBulk','enterpriseInvoiceBulk')
        .where('enterpriseInvoiceBulk.id = :enterpriseInvoiceBulkId', {enterpriseInvoiceBulkId})
        .getCount();
    }

    static getTotalAmount(invoicesId: number []) {
        return this.createQueryBuilder('enterpriseInvoice')
        .select('SUM(enterpriseInvoice.amount)', 'sum')
        .where('enterpriseInvoice.id IN (:invoicesId)', { invoicesId })
        .getRawOne()
    }

    static getNBulkInvoices(invoicesId: number[], enterpriseId: number) {
        return this.createQueryBuilder('enterpriseInvoice')
        .leftJoinAndSelect('enterpriseInvoice.provider', 'provider')
        .leftJoinAndSelect('enterpriseInvoice.currencyCode','currencyCode')
        .leftJoin('enterpriseInvoice.enterprise', 'enterprise')
        .where('enterprise.id = :enterpriseId', {enterpriseId})
        .andWhere('enterpriseInvoice.id IN (:invoicesId)', {invoicesId})
        .andWhere('enterpriseInvoice.status != :status ', {status: EnterpriseInvoiceStatusEnum.NEGOTIATION_IN_PROGRESS})
        .getMany();
    }
 
    static getDiffCurrencyCode(invoicesId: number[]) {
        return this.createQueryBuilder('enterpriseInvoice')
        .select('COUNT(DISTINCT CURRENCY_CODE)', 'count')
        .where('enterpriseInvoice.id IN (:invoicesId)', { invoicesId })
        .getRawOne();
    }

    static getCurrencyCode(invoicesId: number[]) {
        return this.createQueryBuilder('enterpriseInvoice')
        .leftJoinAndSelect('enterpriseInvoice.currencyCode','currencyCode')
        .where('enterpriseInvoice.id IN (:invoicesId)', { invoicesId })
        .limit(1)
        .getOne();
    }

    static updateInvoicesBulkNegotiations(data:CreateNewNegotiationBulk, invoices: EnterpriseInvoice[], saveNewBulkNegotiation: EnterpriseInvoiceBulkNegotiation) {
        const qb = this.createQueryBuilder('enterpriseInvoice')
        for (let invoice of invoices){
            qb.update(EnterpriseInvoice)
                .set({
                    status: EnterpriseInvoiceStatusEnum.NEGOTIATION_IN_PROGRESS,
                    bulkNegotiation: saveNewBulkNegotiation,
                    currentAmount: +LiberaUtils.calculateDiscountValueByTypeOfDiscount(
                        data.percentage, 
                        invoice.amount, 
                        data.discountType, 
                        invoice.expirationDate, 
                        invoice.emissionDate)
                })
                .where("id = :id", { id: invoice.id })
                .execute();
        }
    }

    static rollbackInvoiceBulkNegotiations(invoiceIds: number[]) {
        return this.createQueryBuilder('enterpriseInvoice')
        .update(EnterpriseInvoice)
        .set({
            status: EnterpriseInvoiceStatusEnum.AVAILABLE,
            bulkNegotiation: null,
            currentAmount: null
        })
        .where('id IN (:invoiceIds)', {invoiceIds})
        .execute();
    }

    static UpdateBulkInvoicesStatus(data:UpdateNegotiationById, invoices: EnterpriseInvoice[]) {
        const qb = this.createQueryBuilder('enterpriseInvoice')
        for (let invoice of invoices){
            qb.update(EnterpriseInvoice)
                .set({
                    currentAmount: +LiberaUtils.calculateDiscountValueByTypeOfDiscount(
                        data.newOffer.percentage, 
                        invoice.amount, 
                        data.newOffer.discountType, 
                        invoice.expirationDate, 
                        invoice.emissionDate)
                })
                .where("id = :id", { id: invoice.id })
                .execute();
        }
    }

    static getInvoicesByBulkId(bulkNegotiationId:number){
        return this.createQueryBuilder('invoices')
        .where('invoices.bulkNegotiation = :bulkNegotiationId', {bulkNegotiationId})
        .getMany();
    }

    static updateInvoiceCurrentExpectedPaymentDate(invoiceId: number, providerId: number, currentExpectedPaymentDate: Date) {
        return this.createQueryBuilder('enterpriseInvoice')
            .update(EnterpriseInvoice)
            .set({currentExpectedPaymentDate})
            .where('id = :invoiceId', {invoiceId})
            .andWhere('provider.id = :providerId', {providerId})
            .execute();
    }
}