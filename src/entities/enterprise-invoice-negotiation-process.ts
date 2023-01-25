import { Entity, BaseEntity, ManyToOne, JoinColumn, PrimaryGeneratedColumn, Column, OneToOne } from 'typeorm';
import { EnterpriseInvoice } from './enterprise-invoice';
import { EnterpriseInvoiceNegotiationProcessStatus } from 'commons/enums/enterprise-invoice-negotiation-process-status.enum';
import { NPDiscountTypeEnum } from 'commons/enums/negotiation-process-discount-type.enum';
import { FilterLastInvoiceNegotiationEnum } from 'commons/enums/filter-by.enum';
import moment from 'moment';
import { EnterpriseInvoiceStatusEnum } from 'commons/enums/enterprise-invoice-status.enum';
import { EnterpriseInvoiceBulkNegotiation } from './enterprise-invoice-bulk-negotiation';
import { UpdateNegotiationById } from 'commons/interfaces/invoice-negotiation-process.interface';

@Entity({ name: 'ENTERPRISE_INVOICE_NEGOTIATION_PROCESS'})
export class InvoiceNegotiationProcess extends BaseEntity {

    @PrimaryGeneratedColumn({
        name: 'NEGOTIATION_PROCESS_ID'
    })
    negotiationProcess: number;
    
    @ManyToOne(type => EnterpriseInvoice, eInvoice => eInvoice.invoiceNegotiationProcess)
    @JoinColumn({ name: 'ENTERPRISE_INVOICE_ID' })
    enterpriseInvoice: EnterpriseInvoice;

    @Column({
        name: 'CREATION_DATE',
        type: 'datetime'
    })
    creationDate: Date;

    @Column({
        name: 'FINISHED_DATE',
        type: 'datetime'
    })
    finishedDate: Date;

    @Column({
        name: 'STATUS',
        type: 'enum',
        enum: EnterpriseInvoiceNegotiationProcessStatus
    })
    status: EnterpriseInvoiceNegotiationProcessStatus;

    @Column({ 
        name: 'BPM_PROCESS_INSTANCE_ID', 
        type: 'bigint' 
    })
    bpmProcessInstance: number;

    @Column({ 
        name: 'PAYER_REQUESTED_DISCOUNT_PERCENTAGE'
    })
    payerDiscountPorcentage: number;
    
    @Column({ 
        name: 'PAYER_REQUESTED_DISCOUNT_DUE_DATE',
        type: 'datetime'
    })
    payerRequestedDiscountDueDate: Date;
    
    @Column({ 
        name: 'PAYER_REQUESTED_PAYMENT_DATE',
        type: 'datetime'
    })
    payerRequestedPaymentDate: Date;

    @Column({ 
        name: 'PROVIDER_REQUESTED_DISCOUNT_PERCENTAGE'
    })
    providerDiscountPorcentage: number;
  
    @Column({ 
        name: 'PROVIDER_REQUESTED_DISCOUNT_DUE_DATE',
        type: 'datetime'
    })
    providerRequestedDiscountDueDate: Date;

    @Column({ 
        name: 'PROVIDER_REQUESTED_PAYMENT_DATE',
        type: 'datetime'
    })
    providerRequestedPaymentDate: Date;

    @Column({ 
        name: 'CURRENT_DISCOUNT_PERCENTAGE'
    })
    currentDiscountPercentage: number;
    
    @Column({ 
        name: 'CURRENT_EXPECTED_PAYMENT_DATE',
        type: 'datetime'
    })
    currentExpectedPaymentDate: Date;
    
    @Column({ 
        name: 'CURRENT_DISCOUNT_DUE_DATE',
        type: 'datetime'
    })
    currentDiscountDueDate: Date;

    @Column({ name: 'CURRENT_DISCOUNT_TYPE', type: 'enum', enum: NPDiscountTypeEnum })
    discountType: NPDiscountTypeEnum;

    @Column({ name: 'PAYER_REQUESTED_DISCOUNT_TYPE', type: 'enum', enum: NPDiscountTypeEnum })
    payerRequestedDiscountType: NPDiscountTypeEnum;

    @Column({ name: 'PROVIDER_REQUESTED_DISCOUNT_TYPE', type: 'enum', enum: NPDiscountTypeEnum })
    providerRequestedDiscountType	: NPDiscountTypeEnum;

    @OneToOne(type => EnterpriseInvoiceBulkNegotiation, invoiceBulkNegotiationProcess => invoiceBulkNegotiationProcess.invoiceNegotiationProcess)
    invoiceBulkNegotiationProcess: EnterpriseInvoiceBulkNegotiation;
    
    static removeNegotiationProcessByInvoiceId(invoiceId: number) {
        return this.createQueryBuilder('negotiationProcess')
            .leftJoinAndSelect('negotiationProcess.enterpriseInvoice', 'enterpriseInvoice')
            .delete()
            .where('enterpriseInvoice.id = :invoiceId', {invoiceId})
            .execute();
    }

    static removeNegotiationProcess(negotiationProcessId: number) {
        return this.createQueryBuilder('invoiceNegotiationProcess')
            .delete()
            .andWhere('invoiceNegotiationProcess.negotiationProcess = :negotiationProcessId', {negotiationProcessId})
            .execute();
    }

    static getInvoiceNegotiation(invoiceId: number) {
        return this.createQueryBuilder('invoiceNegotiation')
            .leftJoinAndSelect('invoiceNegotiation.enterpriseInvoice', 'enterpriseInvoice')
            .where('enterpriseInvoice.id = :invoiceId', {invoiceId})
            .andWhere('enterpriseInvoice.status IN (:status)', { status: [EnterpriseInvoiceStatusEnum.AVAILABLE, EnterpriseInvoiceStatusEnum.LOADED]})
            .getOne();
    }
    
    static getInvoiceNegotiations(enterpriseId: number, invoiceId: number, params: any) {
        const queryBuilder = this.createQueryBuilder('eInvoiceNegotiationProcess')
            .leftJoinAndSelect('eInvoiceNegotiationProcess.enterpriseInvoice', 'enterpriseInvoice')
            .leftJoinAndSelect('enterpriseInvoice.enterprise', 'enterprise')
            .where('enterpriseInvoice.id = :invoiceId', {invoiceId})
            .andWhere('enterprise.id = :enterpriseId', {enterpriseId})
            .orderBy('eInvoiceNegotiationProcess.creationDate', params.orderBy);
            if (params.size) queryBuilder.limit(params.size);
            return queryBuilder.getMany();
    }

    static getInvoiceNegotiationsByProviderId(enterpriseId: number, params: any) {
        const queryBuilder = this.createQueryBuilder('eInvoiceNegotiation')
            .leftJoinAndSelect('eInvoiceNegotiation.enterpriseInvoice', 'enterpriseInvoice')
            .leftJoinAndSelect('enterpriseInvoice.provider', 'provider')
            .leftJoinAndSelect('enterpriseInvoice.enterprise', 'enterprise')
            .leftJoinAndSelect('enterprise.owner', 'owner')
            .leftJoinAndSelect('owner.userProperties', 'userProperties')
            .leftJoinAndSelect('enterpriseInvoice.lender', 'lender')
            .leftJoinAndSelect('lender.owner', 'lenderOwner')
            .leftJoinAndSelect('lenderOwner.userProperties', 'lenderUserProperties')
            .leftJoinAndSelect('enterpriseInvoice.currencyCode', 'catCurrency')
            .where('provider.id = :providerId', { providerId: enterpriseId })
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
        return queryBuilder.skip(((params.page - 1) * params.perPage)).take(params.perPage).getMany();
    }

    static getByNegotiationIdAndInvoiceId(negotiationId: number, invoiceId: number) {
        return this.createQueryBuilder('invoiceNegotiationProcess')
            .leftJoinAndSelect('invoiceNegotiationProcess.enterpriseInvoice','enterpriseInvoice')
            .where('invoiceNegotiationProcess.enterpriseInvoice.id = :invoiceId', {invoiceId})
            .andWhere('invoiceNegotiationProcess.negotiationProcess = :negotiationId', {negotiationId})
            .getOne();
    }

    static deleteNegotiationProcessByNegotiationId(negotiationProcessId: number) {
        return this.createQueryBuilder('invoiceNegotiationProcess')
            .delete()
            .andWhere('negotiationProcess = :negotiationProcessId', {negotiationProcessId})
            .execute();
    }

    static updateBpmProcessInstance(negotiationProcessId: number, instanceId: number) {
        return this.createQueryBuilder('invoiceNegotiation')
            .update(InvoiceNegotiationProcess)
            .set({bpmProcessInstance: instanceId})
            .where('negotiationProcess = :negotiationProcessId', {negotiationProcessId})
            .execute();
    }

    static getByInvoiceIdAndId(invoiceId: number, negotiationId: number) {
        return this.createQueryBuilder('invoiceNegotiationProcess')
            .leftJoinAndSelect('invoiceNegotiationProcess.enterpriseInvoice', 'enterpriseInvoice')
            .where('enterpriseInvoice.id = :invoiceId', {invoiceId})
            .andWhere('invoiceNegotiationProcess.negotiationProcess = :negotiationId', {negotiationId})
            .getOne();
    }

    static getByIdInvoiceAndStatus(negotiationId: number, invoiceId: number, status: EnterpriseInvoiceNegotiationProcessStatus) {
        return this.createQueryBuilder('invoiceNegotiation')
            .leftJoinAndSelect('invoiceNegotiation.enterpriseInvoice', 'enterpriseInvoice')
            .where('enterpriseInvoice.id = :invoiceId', {invoiceId})
            .andWhere('invoiceNegotiation.negotiationProcess = :negotiationId', {negotiationId})
            .andWhere('invoiceNegotiation.status = :status', {status})
            .getOne();
    }
    
    static getProviderInvoiceNegotiations(enterpriseId: number, invoiceId: number, params: any) {
        const queryBuilder = this.createQueryBuilder('eInvoiceNegotiationProcess')
            .leftJoinAndSelect('eInvoiceNegotiationProcess.enterpriseInvoice', 'enterpriseInvoice')
            .leftJoinAndSelect('enterpriseInvoice.provider', 'provider')
            .where('enterpriseInvoice.id = :invoiceId', { invoiceId })
            .andWhere('provider.id = :enterpriseId', { enterpriseId })
            .orderBy('eInvoiceNegotiationProcess.creationDate', params.orderBy);
            if (params.size) queryBuilder.limit(params.size);
            return queryBuilder.getMany();
    }

    static getInvoiceNegotiationByNegotiationProcessId(negotiationProcessId: number) {
        return this.createQueryBuilder('invoiceNegotiationProcess')
            .leftJoinAndSelect('invoiceNegotiationProcess.enterpriseInvoice', 'enterpriseInvoice')
            .leftJoinAndSelect('enterpriseInvoice.enterprise', 'enterprise')
            .leftJoinAndSelect('enterprise.owner', 'eOwner')
            .leftJoinAndSelect('eOwner.userProperties', 'eOwnerProperties')
            .leftJoinAndSelect('enterpriseInvoice.provider', 'provider')
            .leftJoinAndSelect('provider.owner', 'prOwner')
            .leftJoinAndSelect('prOwner.userProperties', 'prOwnerProperties')
            .where('invoiceNegotiationProcess.negotiationProcess = :negotiationProcessId', { negotiationProcessId })
            .getOne();
    }

    static getNegotiationAndInvoiceForCreateObjectMongoDB(negotiationProcessId: number) {
        return this.createQueryBuilder('invoiceNegotiationProcess')
            .leftJoinAndSelect('invoiceNegotiationProcess.enterpriseInvoice', 'enterpriseInvoice')
            .where('invoiceNegotiationProcess.negotiationProcess = :negotiationProcessId', { negotiationProcessId })
            .andWhere('enterpriseInvoice.status IN (:status)', { status: [EnterpriseInvoiceStatusEnum.AVAILABLE, EnterpriseInvoiceStatusEnum.LOADED] })
            .getOne();
    }

    static insertBulkNegotiations(negotiations: InvoiceNegotiationProcess[]){
        const queryBuilder = this.createQueryBuilder()
        .insert()
        .into(InvoiceNegotiationProcess)
        .values(negotiations)
        .execute();
    }

    static deteleteInvoicesProcesById(invoices: number[]){
        return this.createQueryBuilder('invoiceNegotiationProcess')
            .leftJoin('invoiceNegotiationProcess.enterpriseInvoice', 'enterpriseInvoice')
            .delete()
            .andWhere('enterpriseInvoice.id IN (:invoices)', {invoices})
            .execute();
    }


    static getNegotiationsId(status:EnterpriseInvoiceNegotiationProcessStatus, bulkNegotiationId: number) {
        return this.createQueryBuilder('invoiceNegotiations')
        .select('invoiceNegotiations.negotiationProcess')
        .leftJoin('invoiceNegotiations.enterpriseInvoice','enterpriseInvoice')
        .leftJoin('enterpriseInvoice.bulkNegotiation','bulkNegotiation')
        .where('bulkNegotiation.id = :bulkNegotiationId', {bulkNegotiationId})
        .andWhere('invoiceNegotiations.status = :status', {status})
        .getMany();
    }

    static updateInvoicesNegotiationProcess(data:UpdateNegotiationById, negotiationsId: number[], status: EnterpriseInvoiceNegotiationProcessStatus){
        return this.createQueryBuilder('invoiceNegotiation')
        .update(InvoiceNegotiationProcess)
        .set({
            discountType: data.newOffer.discountType,
            providerDiscountPorcentage: data.newOffer.percentage,
            providerRequestedDiscountDueDate: data.newOffer.discountDueDate,
            providerRequestedPaymentDate: data.newOffer.expectedPaymentDate,
            currentDiscountPercentage: data.newOffer.percentage,
            currentDiscountDueDate: data.newOffer.discountDueDate,
            currentExpectedPaymentDate: data.newOffer.expectedPaymentDate,
            providerRequestedDiscountType: data.newOffer.discountType,
            status: status
        }).where('negotiationProcess IN (:negotiationsId)', {negotiationsId})
        .execute();
    }
}