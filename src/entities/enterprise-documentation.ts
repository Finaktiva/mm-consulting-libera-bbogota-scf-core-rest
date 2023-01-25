import { Entity, BaseEntity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToOne } from 'typeorm';
import { CatDocumentType } from './cat-document-type';
import { S3Metadata } from './s3-metadata';
import { Enterprise } from './enterprise';
import { EnterpriseDocumentationStatusEnum } from 'commons/enums/enterprise-documentation-status.enum';

@Entity({ name: 'ENTERPRISE_DOCUMENTATION' })
export class EnterpriseDocumentation extends BaseEntity {

    @PrimaryGeneratedColumn({
        name: 'ID'
    })
    id: number;

    @Column({
        name: 'CREATION_DATE'
    })
    creationDate: Date;

    @Column({
        name: 'MODIFICATION_DATE'
    })
    modificationDate: Date;

    @ManyToOne(type => CatDocumentType, catDocumentType => catDocumentType.enterpriseDocumentations)
    @JoinColumn({ name: 'TYPE' })
    documentType: CatDocumentType;

    @OneToOne(type => S3Metadata, s3Metadata => s3Metadata.enterpriseDocumetation)
    @JoinColumn({ name: 'S3_METADATA_ID'})
    s3Metadata: S3Metadata;

    @Column({
        name: 'STATUS',
        type: 'enum',
        enum: EnterpriseDocumentationStatusEnum
    })
    status: EnterpriseDocumentationStatusEnum;

    @ManyToOne(type => Enterprise, enterprise => enterprise.enterpriseDocumentations)
    @JoinColumn({ name: 'ENTERPRISE_ID'})
    enterprise: Enterprise;

    @Column({
        name: 'COMMENT',
        nullable: true
    })
    comment: string;

    @Column({ name: 'DOCUMENT_TYPE_DESCRIPTION' })
    documentTypeDescription: string;
    
    @Column({ name: 'EXPEDITION_DATE' })
    expeditionDate: Date;

    @Column({ name: 'MONTHS_EFFECTIVENESS' })
    effectiveness: number;

    @Column({ name: 'EFFECTIVENESS_DATE' })
    effectivenessDate: Date;

    @Column({
        name: 'REQUIRED',
        type: 'bit',
        nullable: true,
        transformer: { from: (v: Buffer) => v ? !!v.readInt8(0): null, to: (v) => v }
    })
    required: boolean;

    @Column({ name: 'CREATION_USER_ID' })
    userId: number;
 
    static getEnterpriseDocumentationByEnterpriseId(enterpriseId: number, param?: boolean) {
            const queryBuilder = this.createQueryBuilder('enterpriseDocumentation')
            .leftJoinAndSelect('enterpriseDocumentation.enterprise', 'enterprise')
            .leftJoinAndSelect('enterpriseDocumentation.s3Metadata', 's3Metadata')
            .leftJoinAndSelect('enterpriseDocumentation.documentType', 'documentType')
            .where('enterprise.id = :enterpriseId', { enterpriseId })

            if(!param){
                queryBuilder.andWhere('enterpriseDocumentation.status NOT IN (:status)',
                 {status: [EnterpriseDocumentationStatusEnum.DISABLED]});
            }

            return queryBuilder.getMany();
    }

    static getById(enterpriseDocumentationId: number) {
        return this.createQueryBuilder('enterpriseDocumentation')
            .where('enterpriseDocumentation.id = :enterpriseDocumentationId', { enterpriseDocumentationId})
            .getOne();
    }

    static getEnterpriseDocumentationsByEnterpriseIdAndStatus(enterpriseId: number){
        return this.createQueryBuilder('enterpriseDocumentation')
            .leftJoinAndSelect('enterpriseDocumentation.enterprise', 'enterprise')
            .where('enterprise.id = :enterpriseId', { enterpriseId })
            .andWhere('enterpriseDocumentation.status = :status', { status: EnterpriseDocumentationStatusEnum.LOADED })
            .getMany();
    }
    
    static getEnterpriseDocumentationByIdAndEnterpriseId(enterpriseId:number, eDocumentationId: number) {
        return this.createQueryBuilder('enterpriseDocumentation')
            .leftJoinAndSelect('enterpriseDocumentation.enterprise', 'enterprise')
            .where('enterpriseDocumentation.id = :eDocumentationId', {eDocumentationId})
            .andWhere('enterprise.id = :enterpriseId', { enterpriseId })
            .getOne();
    }

    static getEnterpriseDocumentation(enterpriseId: number, documentationId: number): Promise<EnterpriseDocumentation>{
        return this.createQueryBuilder('enterpriseDocumentation')
            .leftJoinAndSelect('enterpriseDocumentation.documentType', 'documentType')
            .leftJoinAndSelect('enterpriseDocumentation.s3Metadata', 's3Metadata')
            .leftJoinAndSelect('enterpriseDocumentation.enterprise', 'enterprise')
            .leftJoinAndSelect('enterprise.owner', 'owner')
            .where('enterpriseDocumentation.id = :documentationId', { documentationId })
            .andWhere('enterpriseDocumentation.enterprise.id = :enterpriseId', { enterpriseId })
            .getOne();
    }

    static deleteEnterpriseDocumentationById(enterpriseId: number){
        return this.createQueryBuilder('enterpriseDocumentation')
            .delete()
            .where('ENTERPRISE_ID = :enterpriseId', { enterpriseId })
            .execute();
    }

    static getEnterpriseDocumentationCountEnabledByEnterpriseId(enterpriseId: number) {
        const queryBuilder = this.createQueryBuilder('enterpriseDocumentation')
        .leftJoinAndSelect('enterpriseDocumentation.enterprise', 'enterprise')
        .where('enterprise.id = :enterpriseId', {enterpriseId})
        .andWhere('enterpriseDocumentation.status = :status', {status: EnterpriseDocumentationStatusEnum.ACCEPTED})
        .getCount();

        return queryBuilder;
    }
    
    static getTotalCount(enterpriseId: number) {
        return this.createQueryBuilder('enterpriseDocumentation')
        .leftJoinAndSelect('enterpriseDocumentation.enterprise', 'enterprise')
        .where('enterprise.id = :enterpriseId', {enterpriseId})
        .andWhere('enterpriseDocumentation.status NOT IN (:status)', {status: [EnterpriseDocumentationStatusEnum.REJECTED]})
        .getCount();
    }

    static getByEnterpriseId(enterpriseId) {
        return this.createQueryBuilder('enterpriseDocumentation')
            .leftJoinAndSelect('enterpriseDocumentation.enterprise', 'enterprise')
            .leftJoinAndSelect('enterpriseDocumentation.documentType', 'documentType')
            .where('enterprise.id = :enterpriseId', {enterpriseId})
            .getMany();
    }
    
    static getLasDocByEnterpriseId(enterpriseId: number, status: string) {
        return this.createQueryBuilder('enterpriseDocumentation')
            .leftJoinAndSelect('enterpriseDocumentation.documentType', 'documentType')
            .leftJoinAndSelect('enterpriseDocumentation.enterprise', 'enterprise')
            .leftJoinAndSelect('enterpriseDocumentation.s3Metadata', 's3Metadata')
            .where('enterprise.id = :enterpriseId', {enterpriseId})
            .andWhere('enterpriseDocumentation.status = :status', {status})
            .orderBy('enterpriseDocumentation.modificationDate', 'DESC')
            .getOne();
    }

    static  getDocumentsAboutToExpire(todayDate: Date) {
        const query =  this.createQueryBuilder('enterpriseDocumentation')
            .leftJoinAndSelect('enterpriseDocumentation.enterprise', 'enterprise')
            .leftJoinAndSelect('enterprise.owner', 'owner')
            .leftJoinAndSelect('enterpriseDocumentation.documentType', 'documentType')
            .where('enterpriseDocumentation.status IN (:...status)', { status: ['CURRENT', 'ABOUT_TO_EXPIRE'] })
            .andWhere('enterpriseDocumentation.EFFECTIVENESS_DATE is not null')
            .andWhere('enterpriseDocumentation.EFFECTIVENESS_DATE < :todayDate', { todayDate })
            .orderBy('enterpriseDocumentation.ENTERPRISE_ID', 'ASC')

        return query.getMany();
    }

    static getBasicEnterpriseDocumentation(enterpriseId: number) {
        return this.createQueryBuilder('enterpriseDocumentation')
            .select(['enterpriseDocumentation.documentType'])
            .where('enterpriseDocumentation.enterprise.id = :enterpriseId', {enterpriseId})
            .getRawMany();
    }
    
    static getEnterpriseDocumentationByStatus(enterpriseId: number, status: string) {
        const query =  this.createQueryBuilder('enterpriseDocumentation')
        .leftJoinAndSelect('enterpriseDocumentation.enterprise', 'enterprise')
        .leftJoinAndSelect('enterpriseDocumentation.documentType', 'documentType')
            .where('enterprise.id = :enterpriseId', {enterpriseId})
            .andWhere('enterpriseDocumentation.status = :status', {status})
        
            // console.log('===> Query: ', query.getQueryAndParameters());
        return query.getMany();
    }

    static getEnterpriseDocumentsByEnterpriseIdAndStatus(enterpriseId: number, status?:string[]) {
        const queryBuilder = this.createQueryBuilder('enterpriseDocumentation')
            .select(['enterpriseDocumentation.status'])
            .addSelect(['enterpriseDocumentation.comment'])
            .leftJoin('enterpriseDocumentation.documentType', 'documentType')
            .addSelect(['documentType.description'])
            .where('enterpriseDocumentation.enterprise.id = :enterpriseId', {enterpriseId});

            if (status) {
                queryBuilder.andWhere('enterpriseDocumentation.status IN (:status)', { status });
            }
            
        return queryBuilder.getMany();
    }

    static getGeneralDocumentationByDocumentationId(enterpriseDocumentationId: number) {
        return this.createQueryBuilder('enterpriseDocumentation')
            .leftJoinAndSelect('enterpriseDocumentation.documentType', 'documentType')
            .leftJoinAndSelect('enterpriseDocumentation.s3Metadata', 's3Metadata')
            .where('enterpriseDocumentation.id = :enterpriseDocumentationId', { enterpriseDocumentationId})
            .getOne();
    }
}
