import { Entity, BaseEntity, PrimaryGeneratedColumn, OneToOne, JoinColumn, ManyToOne, Column, OneToMany } from "typeorm";
import { S3Metadata } from "./s3-metadata";
import { Enterprise } from "./enterprise";
import { User } from "./user";
import { EnterpriseInvoiceBulkStatus } from "commons/enums/enterprise-invoice-bulk-status.enum";
import { EnterpriseInvoice } from "./enterprise-invoice";
import { SimpleFilter } from "commons/filter";

@Entity({ name: 'ENTERPRISE_INVOICE_BULK' })
export class EnterpriseInvoiceBulk extends BaseEntity {

    @PrimaryGeneratedColumn({
        name: 'ID'
    })
    id: number;
    
    @OneToOne(type => S3Metadata, s3Metadata => s3Metadata.enterpriseInvoiceBulk)
    @JoinColumn({
        name: 'S3_METADATA_ID'
    })
    s3Metadata: S3Metadata;

    @ManyToOne(type => Enterprise, enterprise => enterprise.enterpriseInvoiceBulk)
    @JoinColumn({ 
        name: 'ENTERPRISE_ID' 
    })
    enterprise: Enterprise;

    @Column({
        name: 'STATUS',
        type: 'enum',
        enum: EnterpriseInvoiceBulkStatus
    })
    status: EnterpriseInvoiceBulkStatus;

    @Column({
        name: 'FOLIO_NUMBER'
    })
    folioNumber: string;

    @Column({
        name: 'INITIAL_LOAD_COUNT',
    })
    initialLoadCount: number;

    @Column({
        name: 'SUCCESSFUL_LOADED_COUNT',
    })
    successfulLoadedCount: number;

    @Column({
        name: 'ERROR_LOADED_COUNT',
    })
    errorLoadedCount: number;

    @Column({ 
        name: 'CREATION_DATE',
        type: 'datetime'
    })
    creationDate: Date;

    @ManyToOne(type => User, user => user.enterpriseInvoiceBulk)
    @JoinColumn({ 
        name: 'CREATION_USER' 
    })
    creationUser: User;

    @OneToMany(type => EnterpriseInvoice, enterpriseInvoice => enterpriseInvoice.enterpriseInvoiceBulk)
    enterpriseInvoice: EnterpriseInvoice[];
    
    static getAllByEnterpriseAndFilter(enterpriseId: number, filter: SimpleFilter) {
        return this.createQueryBuilder('enterpriseInvoiceBulk')
            .leftJoinAndSelect('enterpriseInvoiceBulk.enterprise', 'enterprise')
            .leftJoinAndSelect('enterpriseInvoiceBulk.s3Metadata', 's3Metadata')
            .leftJoinAndSelect('enterpriseInvoiceBulk.creationUser', 'creationUser')
            .where('enterprise.id = :enterpriseId', { enterpriseId })
            .skip(((filter.page - 1) * filter.per_page)).take(filter.per_page)
            .getManyAndCount();
    }
    
    static getBulkById(invoiceBulkId: number) {
        return this.createQueryBuilder('enterpriseInvoiceBulk')
            .leftJoinAndSelect('enterpriseInvoiceBulk.enterprise', 'enterprise')
            .leftJoinAndSelect('enterpriseInvoiceBulk.creationUser', 'creationUser')
            .where('enterpriseInvoiceBulk.id = :invoiceBulkId', {invoiceBulkId})
            .getOne();
    }

    static getByInvoiceBulkId(invoiceBulkId: number, enterpriseId: number) {
        return this.createQueryBuilder('enterpriseInvoiceBulk')
            .leftJoinAndSelect('enterpriseInvoiceBulk.s3Metadata', 's3Metadata')
            .leftJoinAndSelect('enterpriseInvoiceBulk.enterprise', 'enterprise')
            .andWhere('enterpriseInvoiceBulk.id = :invoiceBulkId', {invoiceBulkId})
            .andWhere('enterpriseInvoiceBulk.enterprise.id = :enterpriseId', {enterpriseId})
            .getOne();
    }

    static saveSuccessfulLoadedCount (successfulLoadedCount: number, enterpriseInvoiceBulkId: number) {
        return this.createQueryBuilder('enterpriseInvoiceBulk')
            .update(EnterpriseInvoiceBulk)
            .set({successfulLoadedCount})
            .where('id = :enterpriseInvoiceBulkId', {enterpriseInvoiceBulkId})
            .execute();
    }

    static updateInvoiceBulkStatus (enterpriseInvoiceBulkId: number, status: EnterpriseInvoiceBulkStatus) {
        return this.createQueryBuilder('enterpriseInvoiceBulk')
            .update(EnterpriseInvoiceBulk)
            .set({status})
            .where('id = :enterpriseInvoiceBulkId', {enterpriseInvoiceBulkId})
            .execute();
    }
}