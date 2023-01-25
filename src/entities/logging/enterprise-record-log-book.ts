import { Entity, ObjectID, ObjectIdColumn, Column } from 'typeorm';
import { DiscountNegotiationsLogBookStatusEnum } from 'commons/enums/discount-negotiations-log-book-status.enum';
import { ProviderEnterprise } from './provider-enterprise';
import { PayerEnterprise } from './payer-enterprise';
import { LogBook } from './log-book';
import { EnterpriseLogBook } from './enterprise-log-book';

@Entity({ name: 'EnterpriseRecodLogBook'})
export class EnterpriseRecodLogBook {

    @ObjectIdColumn()
    id: ObjectID;

    @Column({
        name: 'enterpriseId',
        type: 'bigint'
    })
    enterpriseId: number;

    @Column({
        name: 'enterpriseName'
    })
    enterpriseName: string;

    @Column({
        name: 'nit'
    })
    nit: string;

    @Column(type => EnterpriseLogBook)
    logBook: EnterpriseLogBook[];
        
}