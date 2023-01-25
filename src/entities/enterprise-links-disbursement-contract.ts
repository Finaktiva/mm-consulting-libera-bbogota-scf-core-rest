import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne } from "typeorm";
import { Banks } from "./banks";
import { DisbursementContractAccountTypeEnum, DisbursementContractTypeEnum } from "commons/enums/entities/disbursement-contract.enum";
import { S3Metadata } from "./s3-metadata";
import { EnterpriseLinks } from "./enterprise-links";
import { EnterpriseLinkTypeEnum } from "commons/enums/enterprise-link-type.enum";

@Entity({name: 'ENTERPRISE_LINKS_DISBURSEMENT_CONTRACT'})
export class EnterpriseLinksDisbursementContract extends BaseEntity {

    @OneToOne(type => EnterpriseLinks, link => link.disbursementContract, { primary: true})
    @JoinColumn({ name: 'ENTERPRISE_LINK_ID' })
    enterpriseLink: EnterpriseLinks;

    @Column({ 
        name: 'DISBURSEMENT_TYPE',
        type: 'enum',
        enum: DisbursementContractTypeEnum
    })
    type: DisbursementContractTypeEnum;

    @Column({ 
        name: 'ACCOUNT_TYPE',
        type: 'enum',
        enum: DisbursementContractAccountTypeEnum
    })
    accountType: DisbursementContractAccountTypeEnum;

    @Column({ 
        name: 'ACCOUNT_NUMBER'
    })
    accountNumber: string;

    @ManyToOne(type => Banks, bank => bank.disbursementContracts)
    @JoinColumn({
        name: 'BANK_ID'
    })
    bank: Banks;
    
    @OneToOne(type => S3Metadata, s3Metadata => s3Metadata.disbursementContract)
    @JoinColumn({ name: 'BANK_CERTIFICATION_FILE_ID'})
    bankCertificationFile: S3Metadata;

    static getById(id: number) {
        return this.createQueryBuilder('enterpriseLinksDisbursementContract')
            .leftJoinAndSelect('enterpriseLinksDisbursementContract.bank', 'bank')
            .leftJoinAndSelect('enterpriseLinksDisbursementContract.bankCertificationFile', 'bankCertificationFile')
            .where('enterpriseLinksDisbursementContract.enterpriseLink.id = :id', { id })
            .getOne();
    }

    static getByEnterpriseIdAndProviderId(enterpriseId: number, providerId:number) {
        return this.createQueryBuilder('enterpriseLinksDisbursementContract')
            .leftJoinAndSelect('enterpriseLinksDisbursementContract.bank', 'bank')
            .leftJoinAndSelect('enterpriseLinksDisbursementContract.bankCertificationFile', 'bankCertificationFile')
            .leftJoinAndSelect('enterpriseLinksDisbursementContract.enterpriseLink', 'enterpriseLinks')
            .leftJoinAndSelect('enterpriseLinks.enterpriseLink', 'enterpriseLink')
            .leftJoinAndSelect('enterpriseLinks.enterprise', 'enterprise')
            .where('enterpriseLink.id = :providerId', { providerId })
            .andWhere('enterprise.id = :enterpriseId', { enterpriseId })
            .getOne();
    }

    static getByRequestLinkKeys(requestingEnterpriseId: number, requestedEnterpriseId: number,
            linkType: EnterpriseLinkTypeEnum): Promise<EnterpriseLinksDisbursementContract> {
        return this.createQueryBuilder('enterpriseLinksDisbursementContract')
            .leftJoinAndSelect('enterpriseLinksDisbursementContract.bank', 'bank')
            .leftJoinAndSelect('enterpriseLinksDisbursementContract.bankCertificationFile', 'bankCertificationFile')
            .innerJoin('enterpriseLinksDisbursementContract.enterpriseLink','enterpriseLink')
            .innerJoin('enterpriseLink.enterprise', 'requestingEnterprise')
            .innerJoin('enterpriseLink.enterpriseLink', 'requestedEnterprise')
            .where('requestingEnterprise.id = :requestingEnterpriseId', { requestingEnterpriseId })
            .andWhere('requestedEnterprise.id = :requestedEnterpriseId', { requestedEnterpriseId })
            .andWhere('enterpriseLink.linkType = :linkType', { linkType })
            .getOne();
    }

}