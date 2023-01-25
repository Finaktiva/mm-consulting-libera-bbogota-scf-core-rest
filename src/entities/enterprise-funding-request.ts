import { Entity, BaseEntity, PrimaryGeneratedColumn, OneToOne, JoinColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { Enterprise } from './enterprise';
import { User } from './user';
import { EnterpriseFundingRequestRateType } from 'commons/enums/enterprise-funding-request-rate-type.enum';
import { EnterpriseFundingRequestStatus } from 'commons/enums/enterprise-funding-request-status.enum';
import { EnterpriseFundingRequestType } from 'commons/enums/enterprise-funding-request-type.enum';

@Entity({ name: 'ENTERPRISE_FUNDING_REQUEST' })
export class EnterpriseFundingRequest extends BaseEntity {

    @PrimaryGeneratedColumn({
        name: 'ID',
        type: 'bigint'
    })
    id: number;
    
    @ManyToOne(type => Enterprise, enterprise => enterprise.enterpriseFundingRequestPayer)
    @JoinColumn({
        name: 'PAYER_ENTERPRISE_ID'
    })
    payer: Enterprise;

    @ManyToOne(type => Enterprise, enterprise => enterprise.enterpriseFundingRequestLender)
    @JoinColumn({
        name: 'LENDER_ENTERPRISE_ID'
    })
    lender: Enterprise;

    @Column({ 
        name: 'CREATION_DATE'
    })
    creationDate: Date;

    @ManyToOne(type => User, user => user.enterpriseFundingLink)
    @JoinColumn({
        name: 'CREATION_USER'
    })
    creationUser: User;

    @Column({ 
        name: 'UPDATE_DATE'
    })
    updateDate: Date;

    @ManyToOne(type => User, user => user.enterpriseFundingRequestUpdateUser)
    @JoinColumn({
        name: 'UPDATE_USER'
    })
    updateUser: User;

    @Column({
        name: 'STATUS',
        type: 'enum',
        enum: EnterpriseFundingRequestStatus
    })
    status: EnterpriseFundingRequestStatus;

    @Column({
        name: 'TYPE',
        type: 'enum',
        enum: EnterpriseFundingRequestRateType
    })
    rateType: EnterpriseFundingRequestRateType;

    @Column({
        name: 'RATE_PERCENTAGE',
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
        name: 'TYPE',
        type: 'enum',
        enum: EnterpriseFundingRequestType
    })
    type: EnterpriseFundingRequestType;

    @ManyToOne(type => User, user => user.enterpriseFundingRequestApprovalUser)
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


    static getFundingRequestById(requestId: number, enterpriseId: number) {
        return this.createQueryBuilder('enterpriseFundingRequest')
            .leftJoinAndSelect('enterpriseFundingRequest.lender', 'lender')
            .where('enterpriseFundingRequest.id = :requestId', {requestId})
            .andWhere('lender.id = :enterpriseId', {enterpriseId})
            .getOne();
    }
}