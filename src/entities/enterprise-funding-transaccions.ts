import {Entity, BaseEntity, JoinColumn, OneToOne, ManyToOne, PrimaryGeneratedColumn, Column } from 'typeorm';
import { EnterpriseFundingLink } from './enterprise-funding-link';
import { EnterpriseQuotaRequest } from './enterprise-quota-request';
import { User } from './user';
import { EnterpriseFundingTransactionsTypeEnum } from 'commons/enums/enterprise-funding-transactions-type.enum';
import { EnterpriseFundingTransactionStatusEnum } from 'commons/enums/enterprise-funding-transactions-status.enum';
import { EnterpriseInvoice } from './enterprise-invoice';

@Entity({ name: 'ENTERPRISE_FUNDING_TRANSACTIONS'})
export class EnterpriseFundingTransactions extends BaseEntity {

  @PrimaryGeneratedColumn({ name: 'ID' })
  id: number;

  @ManyToOne(type => EnterpriseFundingLink, enterpriseFundingLink => enterpriseFundingLink.enterpriseFundingTransactions) 
  @JoinColumn({ name: 'ENTERPRISE_FUNDING_LINK_ID' })
  enterpriseFundingLink: EnterpriseFundingLink;

  @Column({ name: 'CREATION_DATE'})
  creationDate: Date; 

  @ManyToOne(type => User, user => user.fundingTransactionsCreationUser)
  @JoinColumn({
      name: 'CREATION_USER'
  })
  creationUser: User;

  @Column({
    name: 'TRANSACTION_TYPE',
    type: 'enum',
    enum: EnterpriseFundingTransactionsTypeEnum
  })
  transactionType: EnterpriseFundingTransactionsTypeEnum;

  @Column({
    name: 'STATUS',
    type: 'enum',
    enum: EnterpriseFundingTransactionStatusEnum
  })
  status: EnterpriseFundingTransactionStatusEnum;

  @Column({name: 'AMOUNT'})
  amount: number;

  @Column({name: 'LENDER_COMMENTS'})
  lenderComments: string;

  @ManyToOne(type => User, user => user.enterpriseFundingTransactionsApprovalUser)
    @JoinColumn({
        name: 'APPROVAL_USER'
    })
    approvalUser: User;

  @Column({name: 'APPROVAL_DATE'})
  aprovalDate: Date;

  @ManyToOne(type => EnterpriseInvoice, enterpriseInvoice => enterpriseInvoice.invoiceFundingTransaction)
    @JoinColumn({ 
        name: 'ENTERPRISE_INVOICE_ID' 
    })
    enterpriseInvoice: EnterpriseInvoice;

  @OneToOne(type => EnterpriseQuotaRequest, enterpriseQuotaRequest => enterpriseQuotaRequest.enterpriseFundingTransaction)
    enterpriseQuotaRequest: EnterpriseQuotaRequest;  

    static getById(transactionId: number) {
        return this.createQueryBuilder('enterpriseFundingTransactions')
          .leftJoinAndSelect('enterpriseFundingTransactions.enterpriseFundingLink', 'link')
          .where('enterpriseFundingTransactions.id = :transactionId', { transactionId })
          .getOne();
    }
    static getBasicById(transactionId: number) {
      return this.createQueryBuilder('enterpriseFundingTransactions')
        .where('enterpriseFundingTransactions.id = :transactionId', { transactionId })
        .getOne();
  }
}