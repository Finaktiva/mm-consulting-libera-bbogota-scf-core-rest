import { Column, Entity, BaseEntity, OneToOne, ManyToOne, JoinColumn } from 'typeorm';
import { Enterprise } from './enterprise';
import { S3Metadata } from './s3-metadata';


@Entity({name: 'ENTERPRISE_BRANDING'})
export class EnterpriseBranding extends BaseEntity {
    @OneToOne(type => Enterprise, enterprise => enterprise.enterpriseBranding, { primary: true })
    @JoinColumn({
        name: 'ENTERPRISE_ID'
    })
    enterprise: Enterprise;

    @Column({
        name: 'PRIMARY_COLOR',
        type: 'varchar'
    })
    primaryColor: string;

    @Column({
        name: 'ACCENT_COLOR',
        type: 'varchar'
    })
    accentColor: string;

    @OneToOne(type => S3Metadata, s3Metadata => s3Metadata.enterpriseBrandingLogo)
    @JoinColumn({
        name: 'BRANDING_LOGO'
    })
    brandingLogo: S3Metadata;

    @OneToOne(type => S3Metadata, s3Metadata => s3Metadata.enterpriseBrandingFavicon)
    @JoinColumn({
        name: 'BRANDING_FAVICON'
    })
    brandingFavicon: S3Metadata;

    static getByEnterpriseId(enterpriseId: number, brandingLogo?: string, brandingFavicon?: string){

        const querybuilder = this.createQueryBuilder('enterpriseBranding')
            .leftJoinAndSelect('enterpriseBranding.enterprise', 'enterprise')
            .where('enterprise.id = :enterpriseId', { enterpriseId })
            
        if(brandingLogo && !brandingFavicon)
            querybuilder.leftJoinAndSelect('enterpriseBranding.brandingLogo', 'brandingLogo');
        if(brandingFavicon && !brandingLogo)
            querybuilder.leftJoinAndSelect('enterpriseBranding.brandingFavicon', 'brandingFavicon');
        if(brandingFavicon && brandingLogo){
            querybuilder
                .leftJoinAndSelect('enterpriseBranding.brandingFavicon', 'brandingFavicon')
                .leftJoinAndSelect('enterpriseBranding.brandingLogo', 'brandingLogo');
        }
        const query = querybuilder.getQuery();
        console.log(query);
        return querybuilder.getOne();
    }

    static getEnterpriseBrandingById(enterpriseId: number){
        return this.createQueryBuilder('enterpriseBranding')
            .leftJoinAndSelect('enterpriseBranding.enterprise', 'enterprise')
            .leftJoinAndSelect('enterpriseBranding.brandingLogo', 'brandingLogo')
            .leftJoinAndSelect('enterpriseBranding.brandingFavicon', 'brandingFavicon')
            .where('enterprise.id = :enterpriseId', { enterpriseId })
            .getOne();
    }
}