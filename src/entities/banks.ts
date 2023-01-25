import { BaseEntity, Entity, Column, PrimaryColumn, ManyToOne } from 'typeorm';
import { EnterpriseLinksDisbursementContract } from './enterprise-links-disbursement-contract';

@Entity({ name: 'BANKS' })
export class Banks extends BaseEntity {

  @PrimaryColumn({ name: 'STR_CODIGO_BANCO' })
  code: string;

  @Column({ name: 'STR_RAZON_SOCIAL' })
  businessName: string;

  @Column({ name: 'NUM_CODIGO_ACH_CENIT' })
  codeAchCenit: string;

  @ManyToOne(type => EnterpriseLinksDisbursementContract, disbursementContract => disbursementContract.bank)
  disbursementContracts: EnterpriseLinksDisbursementContract[];

  static getAllBanks(){
    return this.createQueryBuilder('banks')
      .orderBy('banks.businessName', 'ASC')
      .getMany()
  }

}