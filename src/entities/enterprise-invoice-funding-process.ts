import { Entity, BaseEntity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToOne, Column, OneToMany } from "typeorm";
import { EnterpriseInvoice } from "./enterprise-invoice";
import { Enterprise } from "./enterprise";
import { User } from "./user";
import { EnterpriseInvoiceFundingProcessStatus } from "commons/enums/enterprise-invoice-funding-process-status";
import { EnterpriseInvoiceFiles } from "./enterprise-invoice-files";
import { FilterFundingRequestEnum } from "commons/enums/filter-by.enum";
import moment = require("moment");
import { IQueryFilters, IFilterFundingRequest } from "commons/interfaces/query-filters.interface";

@Entity({ name: 'ENTERPRISE_INVOICE_FUNDING_PROCESS' })
export class EnterpriseInvoiceFundingProcess extends BaseEntity {

    @PrimaryGeneratedColumn({
        name: 'FUNDING_PROCESS_ID'
    })
    fundingProcess: number;

    @ManyToOne(type => EnterpriseInvoice, enterpriseInvoice => enterpriseInvoice.invoiceFundingProcess)
    @JoinColumn({ 
        name: 'ENTERPRISE_INVOICE_ID' 
    })
    enterpriseInvoice: EnterpriseInvoice;

    @OneToOne(type => Enterprise, enterprise => enterprise.invoiceFundingProcess)
    @JoinColumn({
        name: 'LENDER_ID'
    })
    lender: Enterprise;

    @Column({ 
        name: 'CREATION_DATE',
        type: 'datetime'
    })
    creationDate: Date;

    @ManyToOne(type => User, user => user.invoiceFundingProcess)
    @JoinColumn({ 
        name: 'CREATION_USER' 
    })
    creationUser: User;

    @Column({
        name: 'FINISHED_DATE',
        type: 'datetime'
    })
    finishedDate: Date;

    @Column({
        name: 'STATUS',
        type: 'enum',
        enum: EnterpriseInvoiceFundingProcessStatus
    })
    status: EnterpriseInvoiceFundingProcessStatus;

    @Column({ 
        name: 'BPM_PROCESS_INSTANCE_ID', 
        type: 'bigint' 
    })
    bpmProcessInstance: number;

    @Column({
        name: 'LENDER_REJECTION_COMMENTS'
    })
    lenderRejectionComments: string;

    @Column({
        name: 'LENDER_REJECTION_DATE',
        type: 'datetime'
    })
    lenderRejectionDate: Date;

    @Column({
        name: 'LENDER_PAYMENT_CONFIRM_COMMENTS'
    })
    lenderPaymentConfirmComments: string;

    @Column({
        name: 'LENDER_CONFIRMATION_DATE',
        type: 'datetime'
    })
    lenderConfirmationDate: Date;
    
    @Column({
        name: 'LENDER_EFFECTIVE_PAYMENT_DATE',
        type: 'datetime'
    })
    lenderEffectivePaymentDate: Date;

    @Column({ 
        name: 'LENDER_EFFECTIVE_PAYMENT_AMOUNT', 
        type: 'bigint' 
    })
    lenderEffectivePaymentAmount: number;

    @Column({
        name: 'PROVIDER_PAYMENT_CONFIRM_COMMENTS'
    })
    providerPaymentConfimComments: string;

    @Column({
        name: 'PROVIDER_CONFIRMATION_DATE',
        type: 'datetime'
    })
    providerConfirmationDate: Date;

    @Column({
        name: 'PROVIDER_EFFECTIVE_PAYMENT_DATE',
        type: 'datetime'
    })
    providerEffectivePaymentDate: Date;

    @Column({ 
        name: 'PROVIDER_EFFECTIVE_PAYMENT_AMOUNT', 
        type: 'bigint' 
    })
    providerEffectivePaymentAmount: number;

    @OneToMany(type => EnterpriseInvoiceFiles, invoiceFiles => invoiceFiles.invoiceFundingProcess)
    invoiceFiles: EnterpriseInvoiceFiles[];

    static getProcessByIdAndEnterpriseId(processId: number, enterpriseId: number) {
        return this.createQueryBuilder('invoiceFundingProcess')
            .leftJoinAndSelect('invoiceFundingProcess.enterpriseInvoice','enterpriseInvoice')
            .leftJoinAndSelect('invoiceFundingProcess.lender', 'lender')
            .leftJoinAndSelect('lender.owner', 'owner')
            .leftJoinAndSelect('invoiceFundingProcess.invoiceFiles', 'invoiceFiles')
            .leftJoinAndSelect('invoiceFiles.s3Metadata', 's3Metadata')
            .where('invoiceFundingProcess.fundingProcess = :processId', {processId})
            .andWhere('lender.id = :enterpriseId', {enterpriseId})
            .andWhere('invoiceFundingProcess.status = :status', { status: EnterpriseInvoiceFundingProcessStatus.PENDING_LENDER_PAYMENT_CONFIRMATION })
            .getOne();
    }

    static getInvoiceFundingProcessByEnterpriseId(enterpriseId: number, params: IFilterFundingRequest){
        const queryBuilder = this.createQueryBuilder('invoiceFunding')
            .leftJoinAndSelect('invoiceFunding.lender','lender')
            .leftJoinAndSelect('invoiceFunding.creationUser','creationUser')
            .leftJoinAndSelect('invoiceFunding.enterpriseInvoice','enterpriseInvoice')
            .leftJoinAndSelect('enterpriseInvoice.enterprise','payer')
            .leftJoinAndSelect('enterpriseInvoice.currencyCode','currencyCode')
            .leftJoinAndSelect('enterpriseInvoice.invoiceNegotiationProcess','negotiationProcess')
            .where('lender.id = :enterpriseId', {enterpriseId})

            if (params.filterBy) {
                let date = '';
                switch (params.filterBy) {
                    case FilterFundingRequestEnum.PAYER:
                        queryBuilder.andWhere('payer.enterpriseName LIKE :payer', { payer: `%${params.q.replace(/ /g,'%')}%` });
                        break;
                    case FilterFundingRequestEnum.STATUS:
                        queryBuilder.andWhere('invoiceFunding.status = :status', { status : params.q });
                        break;
                    case FilterFundingRequestEnum.EFFECTIVEPAYMENTDATE:
                        date = moment(params.q, moment.ISO_8601).toISOString();
                        queryBuilder.andWhere(`DATE_FORMAT(enterpriseInvoice.effectivePaymentDate, '%y-%M-%d') = DATE_FORMAT(:date, '%y-%M-%d')`, { date });
                        break;
                    case FilterFundingRequestEnum.EXPECTEDPAYMENTDATE:
                        date = moment(params.q, moment.ISO_8601).toISOString();
                        queryBuilder.andWhere(`DATE_FORMAT(negotiationProcess.currentExpectedPaymentDate, '%y-%M-%d') = DATE_FORMAT(:date, '%y-%M-%d')`, { date });
                        break;
                }
            }
            return queryBuilder.skip(((params.page - 1) * params.perPage)).take(params.perPage).getManyAndCount();
    }
    
    static getByEnterpriseIdAndInvoiceId(enterpriseId: number, invoiceId: number, params: IQueryFilters) {
        const queryBuilder = this.createQueryBuilder('invoiceFundingProcess')
            .leftJoinAndSelect('invoiceFundingProcess.enterpriseInvoice', 'enterpriseInvoice')
            .leftJoinAndSelect('enterpriseInvoice.enterprise', 'enterprise')
            .leftJoinAndSelect('invoiceFundingProcess.lender', 'lender')
            .where('enterpriseInvoice.id = :invoiceId', { invoiceId })
            .andWhere('enterprise.id = :enterpriseId', { enterpriseId })
            .orderBy('invoiceFundingProcess.creationDate', params.orderBy);
            if (params.size) queryBuilder.limit(params.size);
            return queryBuilder.getManyAndCount();
    }

    static getProcessById(fundingProcessId: number) {
        return this.createQueryBuilder('invoiceFundingProcess')
            .leftJoinAndSelect('invoiceFundingProcess.enterpriseInvoice', 'enterpriseInvoice')
            .leftJoinAndSelect('enterpriseInvoice.lender', 'lender')
            .leftJoinAndSelect('enterpriseInvoice.enterprise', 'enterprise')
            .leftJoinAndSelect('enterpriseInvoice.provider', 'provider')
            .leftJoinAndSelect('enterprise.owner', 'eOwner')
            .leftJoinAndSelect('eOwner.userProperties', 'eOwnerProps')
            .leftJoinAndSelect('lender.owner', 'lOwner')
            .leftJoinAndSelect('lOwner.userProperties', 'lOwnerProps')
            .leftJoinAndSelect('provider.owner', 'pOwner')
            .leftJoinAndSelect('pOwner.userProperties', 'pOwnerProps')
            .leftJoinAndSelect('invoiceFundingProcess.creationUser', 'creationUser')
            .andWhere('invoiceFundingProcess.fundingProcess = :fundingProcessId', {fundingProcessId})
            .getOne();
    }

    static async getPaymentDetail(invoiceId: number) {
        return this.createQueryBuilder('invoiceFundingProcess')
        .leftJoinAndSelect('invoiceFundingProcess.enterpriseInvoice','enterpriseInvoice')
        .leftJoinAndSelect('invoiceFundingProcess.lender','lender')
        .leftJoinAndSelect('invoiceFundingProcess.invoiceFiles','files')
        .leftJoinAndSelect('files.s3Metadata','s3Metadata')
        .where('invoiceFundingProcess.enterpriseInvoice = :invoiceId', {invoiceId})
        .getOne();
    }

    static getProcessByInvoiceIdAndFundingProcessId(invoiceId: number, fundingProcessId: number) {
        return this.createQueryBuilder('invoiceFundingProcess')
            .leftJoinAndSelect('invoiceFundingProcess.enterpriseInvoice', 'enterpriseInvoice')
            .leftJoinAndSelect('enterpriseInvoice.enterprise', 'enterprise')
            .leftJoinAndSelect('invoiceFundingProcess.lender', 'lender')
            .where('invoiceFundingProcess.enterpriseInvoice = :invoiceId', { invoiceId })
            .andWhere('invoiceFundingProcess.fundingProcess = :fundingProcessId', { fundingProcessId })
            .getOne();
    }

    static getSimpleProccessById(processId: number, enterpriseId: number) {
        return this.createQueryBuilder('invoiceFundingProcess')
            .leftJoinAndSelect('invoiceFundingProcess.enterpriseInvoice','enterpriseInvoice')
            .leftJoinAndSelect('invoiceFundingProcess.lender', 'lender')
            .where('invoiceFundingProcess.fundingProcess = :processId', {processId})
            .andWhere('lender.id = :enterpriseId', {enterpriseId})
            .andWhere('invoiceFundingProcess.status = :status', { status: EnterpriseInvoiceFundingProcessStatus.PENDING_LENDER_PAYMENT_CONFIRMATION })
            .getOne();
    }
}