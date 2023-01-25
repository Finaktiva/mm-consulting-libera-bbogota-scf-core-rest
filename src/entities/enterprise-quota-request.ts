import { Entity, BaseEntity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToOne } from 'typeorm';
import { User } from './user';
import { EnterpriseQuotaRequestStatusEnum } from 'commons/enums/enterprise-quota-request-status.enum';
import { RateTypeEnum } from 'commons/enums/rate-type.enum';
import { EnterpriseQuotaRequestTypeEnum } from 'commons/enums/enterprise-quota-request-type.enum';
import { BasicFilter, QuotaRequestFilterBy } from 'commons/filter';
import { Enterprise } from './enterprise';
import { EnterpriseFundingTransactions } from './enterprise-funding-transaccions';

@Entity({ name: 'ENTERPRISE_QUOTA_REQUEST'})
export class EnterpriseQuotaRequest extends BaseEntity {

    @PrimaryGeneratedColumn({ name: 'ID'})
    id: number;
    
    @ManyToOne(type => Enterprise, enterprise => enterprise.payerEnterpriseQuotaRequests)
    @JoinColumn({ name: 'PAYER_ENTERPRISE_ID' })
    payer: Enterprise;

    @ManyToOne(type => Enterprise, enterprise => enterprise.lenderEnterpriseQuotaRequests)
    @JoinColumn({ name: 'LENDER_ENTERPRISE_ID' })
    lender: Enterprise;

    @Column({
        name: 'CREATION_DATE'
    })
    creationDate: Date;

    @ManyToOne(type => User, user => user.createEntepriseQuotaRequests)
    @JoinColumn({
        name: 'CREATION_USER'
    })
    creationUser: User;

    @Column({
        name: 'UPDATE_DATE'
    })
    updateDate: Date;

    @ManyToOne(type => User, user => user.updateEntepriseQuotaRequests)
    @JoinColumn({
        name: 'UPDATE_USER'
    })
    updateUser: User;

    @Column({
        name: 'STATUS',
        type: 'enum',
        enum: EnterpriseQuotaRequestStatusEnum
    })
    status: EnterpriseQuotaRequestStatusEnum;

    @Column({
        name: 'RATE_TYPE',
        type: 'enum',
        enum: RateTypeEnum 
    })
    rateType: RateTypeEnum; 

    @Column({
        name:  'RATE_PERCENTAGE'
    })
    ratePercentage: number;

    @Column({
        name: 'PAYER_COMMENTS'
    })
    payerComments: string;

    @Column({
        name: 'LENDER_COMMENTS'
    })
    lenderComments: string;
    
    @Column({
        name: 'QUOTA_REQUEST_TYPE',
        type: 'enum',
        enum: EnterpriseQuotaRequestTypeEnum
    })
    quotaRequestType: EnterpriseQuotaRequestTypeEnum;

    @ManyToOne(type => User, user => user.approvalEnterpriseQuotaRequests)
    @JoinColumn({
        name: 'APPROVAL_USER'
    })
    approvalUser: User;

    @Column({
        name: 'APPROVAL_DATE'
    })
    approvalDate: Date;

    @Column({
        name: 'PAYER_REQUEST_AMOUNT'
    })
    payerRequestAmount: number;

    @Column({
        name: 'LENDER_GRANTED_AMOUNT'
    })
    lenderGrantedAmount: number;

    @OneToOne(type => EnterpriseFundingTransactions, enterpriseFundingTransactions => enterpriseFundingTransactions.enterpriseQuotaRequest)
    @JoinColumn({ name: 'ENTERPRISE_FUNDING_TRANSACTION_ID' })
    enterpriseFundingTransaction: EnterpriseFundingTransactions;

    static getQuotaRequests(enterpriseId: number, filter: BasicFilter<QuotaRequestFilterBy, string>) {
        const queryBuilder =  this.createQueryBuilder('enterpriseQuotaRequest')
            .leftJoinAndSelect('enterpriseQuotaRequest.payer', 'payer')
            .leftJoinAndSelect('enterpriseQuotaRequest.lender', 'lender')
            .where('payer.id = :enterpriseId', { enterpriseId })

            if(filter.filterBy == 'ENTERPRISE_NAME' && filter.q)
                queryBuilder.andWhere('lower(lender.enterpriseName) LIKE :q' , { q: `%${filter.q.replace(/ /g, '').toLowerCase()}%` })

            if(filter.filterBy == 'STATUS' && filter.q)
                queryBuilder.andWhere('enterpriseQuotaRequest.status = :status', { status: filter.q });

            return queryBuilder
                .skip(((filter.page - 1) * filter.perPage))
                .take(filter.perPage)
                .getManyAndCount();
    }

    static getLenderQuotaRequests(enterpriseId: number, filter: BasicFilter<QuotaRequestFilterBy, string>){
        const queryBuilder =  this.createQueryBuilder('enterpriseQuotaRequest')
            .leftJoinAndSelect('enterpriseQuotaRequest.payer', 'payer')
            .leftJoinAndSelect('enterpriseQuotaRequest.lender', 'lender')
            .where('lender.id = :enterpriseId', { enterpriseId })

            if(filter.filterBy == 'ENTERPRISE_NAME' && filter.q)
                queryBuilder.andWhere('lower(payer.enterpriseName) LIKE :q' , { q: `%${filter.q.replace(/ /g, '').toLowerCase()}%` })

            if(filter.filterBy == 'STATUS' && filter.q)
                queryBuilder.andWhere('enterpriseQuotaRequest.status = :status', { status: filter.q });

            return queryBuilder
                .skip(((filter.page - 1) * filter.perPage))
                .take(filter.perPage)
                .getManyAndCount();
    }
    
    static getById(quotaRequestId: number) {
        return  this.createQueryBuilder('enterpriseQuotaRequest')
            .leftJoinAndSelect('enterpriseQuotaRequest.payer', 'payer')
            .leftJoinAndSelect('payer.owner', 'owner')
            .leftJoinAndSelect('enterpriseQuotaRequest.lender', 'lender')
            .leftJoinAndSelect('enterpriseQuotaRequest.enterpriseFundingTransaction', 'enterpriseFundingTransaction')
            .where('enterpriseQuotaRequest.id = :quotaRequestId', { quotaRequestId })
            .getOne();
    }


    static removeQuotaRequest(quotaRequestId:number){
        return this.createQueryBuilder('enterpriseQuotaRequest')
            .where('id = :quotaRequestId', {quotaRequestId})
            .execute();
    }

    static getQuotaRequestExist(enterpriseId:number, lenderId:number){
        return this.createQueryBuilder('enterpriseQuotaRequest')
            .leftJoinAndSelect('enterpriseQuotaRequest.payer','payer')
            .leftJoinAndSelect('enterpriseQuotaRequest.lender','lender')
            .where('payer.id = :enterpriseId', { enterpriseId })
            .andWhere('lender.id = :lenderId', { lenderId })
            .getOne();
    }

    static getByLenderId(lenderId: number, requestId:number){
        return this.createQueryBuilder('enterpriseQuotaRequest')
            .leftJoinAndSelect('enterpriseQuotaRequest.lender', 'lender')
            .leftJoinAndSelect('lender.owner', 'lenderOwner')
            .leftJoinAndSelect('enterpriseQuotaRequest.payer', 'payer')
            .leftJoinAndSelect('payer.owner', 'payerOwner')
            .leftJoinAndSelect('enterpriseQuotaRequest.enterpriseFundingTransaction', 'quotaTransaction')
            .where('lender.id = :lenderId', {lenderId})
            .andWhere('enterpriseQuotaRequest.id = :requestId',{requestId})
            .getOne();
    }
}