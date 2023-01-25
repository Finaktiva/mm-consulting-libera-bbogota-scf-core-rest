import { Entity, BaseEntity, PrimaryGeneratedColumn, OneToOne, JoinColumn, Column, ManyToOne, OneToMany } from "typeorm";
import { S3Metadata } from "./s3-metadata";
import { EnterpriseRequestBulkStatus } from "commons/enums/enterprise-request-bulk.enum";
import { Enterprise } from "./enterprise";
import { SimpleFilter } from "commons/filter";
import { EnterpriseRequest } from "./enterprise-request";

@Entity({ name: 'ENTERPRISE_REQUEST_BULK' })
export class EnterpriseRequestBulk extends BaseEntity {
    
    @PrimaryGeneratedColumn({ name: 'ID'})
    id: number;

    @OneToOne(type => S3Metadata, s3Metadata => s3Metadata.enterpriseRequestBulk)
    @JoinColumn({
        name: 'S3_METADATA_ID'
    })
    s3Metadata: S3Metadata;

    @Column({
        name: 'FOLIO_NUMBER'
    })
    folioNumber: string;

    @Column({
        name: 'STATUS',
        type: 'enum',
        enum: EnterpriseRequestBulkStatus
    })
    status: EnterpriseRequestBulkStatus;
    
    @ManyToOne(type => Enterprise, enterprise => enterprise.enterpriseRequestBulk)
    @JoinColumn({ 
        name: 'ENTERPRISE_ID'
    })
    enterprise: Enterprise;

    @Column({ 
        name: 'CREATION_DATE'
    })
    creationDate: Date; 

    @Column({ 
        name: 'TOTAL_COUNT'
    })
    totalCount: number; 

    @OneToMany(type => EnterpriseRequest, enterpriseRequest => enterpriseRequest.enterpriseRequestBulk)
    @JoinColumn({ 
        name: 'ID'
    })
    enterpriseRequest: EnterpriseRequest[];

    static getByEnterpriseId(enterpriseId: number){
        return this.createQueryBuilder('enterpriseRequestBulk')
            .leftJoinAndSelect('enterpriseRequestBulk.enterprise', 'enterprise')
            .leftJoinAndSelect('enterpriseRequestBulk.s3Metadata','s3Metadata')
            .where('enterprise.id = :enterpriseId', { enterpriseId })
            .getOne();
    }

    static getManyByEnterpriseId(enterpriseId: number, filter: SimpleFilter) {
        const queryBuilder = this.createQueryBuilder('enterpriseRequestBulk')
            .leftJoinAndSelect('enterpriseRequestBulk.enterprise', 'enterprise')
            .leftJoinAndSelect('enterpriseRequestBulk.enterpriseRequest', 'enterpriseRequest')
            .leftJoinAndSelect('enterpriseRequestBulk.s3Metadata', 's3Metadata')
            .where('enterprise.id = :enterpriseId', { enterpriseId });
        
        return queryBuilder.skip(((filter.page-1)*filter.per_page)).take(filter.per_page)
            .getManyAndCount();
    }

    static getById(enterpriseRequestBulkId: number) {
        return this.createQueryBuilder('enterpriseRequestBulk')
            .leftJoinAndSelect('enterpriseRequestBulk.enterprise', 'enterprise')
            .leftJoinAndSelect('enterprise.owner', 'owner')
            .where('enterpriseRequestBulk.id = :enterpriseRequestBulkId', { enterpriseRequestBulkId })
            .getOne();
    }

    static getByBulkId(enterpriseRequestBulkId: number) {
        return this.createQueryBuilder('enterpriseRequestBulk')
            .leftJoinAndSelect('enterpriseRequestBulk.s3Metadata', 's3Metadata')
            .leftJoinAndSelect('enterpriseRequestBulk.enterpriseRequest', 'enterpriseRequest')
            .where('enterpriseRequestBulk.id = :enterpriseRequestBulkId', { enterpriseRequestBulkId })
            .getOne();
    }

    
    static removeEnterpriseRequestBulk(enterpriseRequestBulk: number){
        return this.createQueryBuilder('enterpriseRequestBulk')
            .delete()    
            .where('id = :enterpriseRequestBulk', { enterpriseRequestBulk })
            .execute();
    }


}