import { Entity, ObjectID, ObjectIdColumn, Column } from 'typeorm';
import { DiscountNegotiationsLogBookStatusEnum } from 'commons/enums/discount-negotiations-log-book-status.enum';
import { ProviderEnterprise } from './provider-enterprise';
import { PayerEnterprise } from './payer-enterprise';
import { LogBook } from './log-book';

@Entity({ name: 'discountNegotiationsLogBook'})
export class DiscountNegotiationsLogBook {

    @ObjectIdColumn()
    id: ObjectID;

    @Column({
        name: 'invoiceId',
        type: 'bigint'
    })
    invoiceId: number;

    @Column({
        name: 'invoiceInt'
    })
    invoiceInt: string;

    @Column({
        name: 'invoiceAmount'
    })
    invoiceAmount: number;

    @Column({
        name: 'negotiationId',
        type: 'int'
    })
    negotiationId: number

    @Column({
        name: 'creationDate',
        type: 'timestamp'
    })
    creationDate: Date;

    @Column({
        name: 'finished',
        type: 'timestamp'
    })
    finished: Date;

    @Column({
        name: 'status',
        type: 'enum',
        enum: DiscountNegotiationsLogBookStatusEnum
    })
    status: string;

    @Column({
        name: 'bpmProcessInstance'
    })
    bpmProcessInstance: string;

    @Column(type => ProviderEnterprise)
    providerEnterprise: ProviderEnterprise;

    @Column(type => PayerEnterprise)
    payerEnterprise: PayerEnterprise;

    @Column(type => LogBook)
    logBook: LogBook[];
    
}