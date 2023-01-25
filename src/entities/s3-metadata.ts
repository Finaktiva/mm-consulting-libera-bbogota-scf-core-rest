import { Entity, BaseEntity, PrimaryGeneratedColumn, Column, OneToOne, OneToMany } from 'typeorm';
import { EnterpriseDocumentation } from './enterprise-documentation';
import { EnterpriseBranding } from './enterprise-branding';
import { EnterpriseRequestBulk } from './enterprise-request-bulk';
import { EnterpriseInvoiceBulk } from './enterprise-invoice-bulk';
import { EnterpriseInvoiceFiles } from './enterprise-invoice-files';
import { EnterpriseLinksDisbursementContract } from './enterprise-links-disbursement-contract';
import { EnterpriseFinancingPlan } from './enterprise-financing-plan';
import { Terms } from './terms';

@Entity({ name: 'S3_METADATA'})
export class S3Metadata extends BaseEntity {

    @PrimaryGeneratedColumn({ name: 'ID'})
    id: number;

    @Column({ name: 'BUCKET_NAME'})
    bucket: string;

    @Column({ name: 'FILENAME'})
    filename: string;

    @Column({ name: 'FILE_KEY'})
    fileKey: string;

    @Column({ name: 'CREATION_DATE'})
    creationDate: Date;

    @OneToOne(type => EnterpriseDocumentation, enterpriseDocumentation => enterpriseDocumentation.s3Metadata)
    enterpriseDocumetation: EnterpriseDocumentation;

    @OneToOne(type => EnterpriseBranding, enterpriseBranding => enterpriseBranding.brandingLogo)
    enterpriseBrandingLogo: EnterpriseBranding;

    @OneToOne(type => EnterpriseBranding, enterpriseBranding => enterpriseBranding.brandingFavicon)
    enterpriseBrandingFavicon: EnterpriseBranding;
    
    @OneToOne(type => EnterpriseRequestBulk, enterpriseRequestBulk => enterpriseRequestBulk.s3Metadata)
    enterpriseRequestBulk: EnterpriseRequestBulk;

    @OneToOne(type => EnterpriseInvoiceBulk, enterpriseInvoiceBulk => enterpriseInvoiceBulk.s3Metadata)
    enterpriseInvoiceBulk: EnterpriseInvoiceBulk;

    @OneToOne(type => EnterpriseInvoiceFiles, invoiceFiles => invoiceFiles.s3Metadata)
    invoiceFiles: EnterpriseInvoiceFiles;

    @OneToOne(type => EnterpriseLinksDisbursementContract, disbursementContract => disbursementContract.bankCertificationFile)
    disbursementContract: EnterpriseLinksDisbursementContract;
    
    @OneToOne(type => EnterpriseFinancingPlan, enterpriseFinancingPlan => enterpriseFinancingPlan.evidenceFile)
    evidenceFilePlan: EnterpriseFinancingPlan;

    @OneToOne(type => Terms, terms => terms.s3Metadata)
    terms: Terms;

    static getById(s3MetadataId: number) {
        return this.createQueryBuilder('s3Metadata')
            .where('s3Metadata.id = :s3MetadataId', {s3MetadataId})
            .getOne();
    }

    static getByBranding(s3MetadataId: number){
        return this.createQueryBuilder('s3Metadata')
            .leftJoinAndSelect('s3Metadata.enterpriseBrandingLogo', 'enterpriseBrandingLogo')
            .leftJoinAndSelect('s3Metadata.enterpriseBrandingFavicon', 'enterpriseBrandingFavicon')
            .where('s3Metadata.id = :s3MetadataId',{s3MetadataId})
            .getOne();
    }

    static removeS3Metadata(s3Metadata: number){
        return this.createQueryBuilder('removeS3Metadata')
            .delete()    
            .where('id = :s3Metadata', { s3Metadata })
            .execute();
    }


}