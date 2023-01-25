import { Column, ObjectIdColumn, ObjectID, Entity, } from 'typeorm';
import { InvoiceFundingLogBookStatusEnum } from 'commons/enums/invoice-funding-log-book-status.enum';
import { ProviderEnterprise } from './provider-enterprise';
import { PayerEnterprise } from './payer-enterprise';
import { LenderEnterprise } from './lender-enterprise';
import { FundingLogBook } from './funding-log-book';

@Entity({ name: 'invoiceFundingLogBook' })
export class InvoiceFundingLogBook {

    @ObjectIdColumn()
    id: ObjectID;

    @Column({ 
        name: 'invoiceId',
        type: 'bigint'
    })
    invoiceId: number;

    @Column({
        name: 'fundingRequestId',
        type: 'bigint'
    })
    fundingRequestId: number;

    @Column({ name: 'invoiceInt' })
    invoiceInt: string;

    @Column({ name: 'invoiceAmount' })
    invoiceAmount: number;

    @Column({ name: 'amountToPay' })
    amountToPay: number;

    @Column({ name: 'expectedPaymentDate' })
    expectedPaymentDate: Date;

    @Column({ name: 'effectivePaymentDate' })
    effectivePaymentDate: Date;

    @Column({ name: 'creationDate' })
    creationDate: Date;

    @Column({ name: 'creationUser' })
    creationUser: number;

    @Column({ name: 'finishedDate' })
    finishedDate: Date;

    @Column({ name: 'status', type: 'enum', enum: InvoiceFundingLogBookStatusEnum })
    status: InvoiceFundingLogBookStatusEnum;

    @Column({ name: 'bpmProcessInstance' })
    bpmProcessInstance: string;

    @Column(type => ProviderEnterprise)
    providerEnterprise: ProviderEnterprise;

    @Column(type => PayerEnterprise)
    payerEnterprise: PayerEnterprise;

    @Column(type => LenderEnterprise)
    lenderEnterprise: LenderEnterprise;

    @Column(type => FundingLogBook)
    logBook: FundingLogBook[];
    
}