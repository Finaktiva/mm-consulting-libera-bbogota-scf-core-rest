import { Entity, Column, BaseEntity, OneToOne, PrimaryColumn, OneToMany, JoinColumn } from 'typeorm';
import { S3Metadata } from './s3-metadata';
import { RelEnterpriseTerms } from './rel-enterprise-terms';

@Entity({name: 'TERMS_AND_CONDITIONS'})
export class Terms extends BaseEntity {
    @PrimaryColumn({
        name: 'ID',
        type: 'bigint'
    })
    id: number;

    @Column({
        name: 'VERSION',
        type: 'varchar'
    })
    version: string;

    @OneToOne(type => S3Metadata, s3Metadata => s3Metadata.terms)
    @JoinColumn({ name: 'S3_METADATA_ID'})
    s3Metadata: S3Metadata;

    @OneToMany(type => RelEnterpriseTerms, relEnterpriseTerms => relEnterpriseTerms.terms)
    @JoinColumn({ name: 'TERMS_ID'})
    relEnterpriseTerms: RelEnterpriseTerms[];

    static async getLatestTerms() {
        return this.createQueryBuilder('terms')
            .leftJoinAndSelect('terms.s3Metadata', 's3Metadata')
            .orderBy('terms.version', 'DESC')
            .getOne();
    }

    static async getTermsById(termsId: number) {
        return this.createQueryBuilder('terms')
            .leftJoinAndSelect('terms.s3Metadata', 's3Metadata')
            .where('terms.id = :termsId', { termsId })
            .getOne();
    }
}