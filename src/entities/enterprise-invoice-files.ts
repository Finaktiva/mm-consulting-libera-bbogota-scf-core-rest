import { Entity, BaseEntity, ManyToOne, JoinColumn, OneToOne, Column } from "typeorm";
import { EnterpriseInvoice } from "./enterprise-invoice";
import { S3Metadata } from "./s3-metadata";
import { EnterpriseInvoiceFundingProcess } from "./enterprise-invoice-funding-process";
import { User } from "./user";
import { EnterpriseInvoiceFilesTypeEnum } from "commons/enums/enterprise-invoice-files-type.enum";

@Entity({ name: 'ENTERPRISE_INVOICE_FILES' })
export class EnterpriseInvoiceFiles extends BaseEntity {

    @ManyToOne(type => EnterpriseInvoice, enterpriseInvoice => enterpriseInvoice.invoiceFiles, { primary: true })
    @JoinColumn({ 
        name: 'ENTERPRISE_INVOICE_ID' 
    })
    enterpriseInvoice: EnterpriseInvoice;

    @OneToOne(type => S3Metadata, s3Metadata => s3Metadata.invoiceFiles)
    @JoinColumn({ 
        name: 'S3_METADATA_ID'
    })
    s3Metadata: S3Metadata;

    @ManyToOne(type => EnterpriseInvoiceFundingProcess, enterpriseInvoiceFundingProcess => enterpriseInvoiceFundingProcess.invoiceFiles)
    @JoinColumn({ 
        name: 'FUNDING_PROCESS_ID' 
    })
    invoiceFundingProcess: EnterpriseInvoiceFundingProcess;

    @Column({
        name: 'TYPE',
        type: 'enum',
        enum: EnterpriseInvoiceFilesTypeEnum
    })
    type: EnterpriseInvoiceFilesTypeEnum;
    
    @Column({ 
        name: 'CREATION_DATE' 
    })
    creationDate: Date;

    @ManyToOne(type => User, user => user.invoiceFiles)
    @JoinColumn({ 
        name: 'CREATION_USER_ID' 
    })
    creationUser: User;

    static getInvoiceFilesByInvoiceId(invoiceId: number) {
        return this.createQueryBuilder('invoiceFiles')
            .leftJoinAndSelect('invoiceFiles.s3Metadata', 's3Metadata')
            .where('invoiceFiles.enterpriseInvoice = :invoiceId', {invoiceId})
            .getMany();
    }

    static getInvoiceFileByFundingProcessId(fundingProcessId: number) {
        return this.createQueryBuilder('invoiceFiles')
            .leftJoinAndSelect('invoiceFiles.s3Metadata', 's3Metadata')
            .leftJoinAndSelect('invoiceFiles.invoiceFundingProcess', 'invoiceFundingProcess')
            .andWhere('invoiceFundingProcess.fundingProcess = :fundingProcessId', {fundingProcessId})
            .getOne();
    }
}