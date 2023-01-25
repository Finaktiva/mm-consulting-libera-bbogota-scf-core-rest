import { Entity, BaseEntity, PrimaryGeneratedColumn, Column, JoinColumn, ManyToOne, OneToOne, Brackets } from "typeorm";
import { EnterpriseLinkTypeEnum } from "commons/enums/enterprise-link-type.enum";
import { EnterpriseLinkStatus } from "commons/enums/enterprise-link-status.enum";
import { Enterprise } from "./enterprise";
import { EnterpriseRequest } from "./enterprise-request";
import { FilterEnterprises } from "commons/filter";
import { FilterStatusEnum } from "commons/enums/filter-status.enum";
import { FilterEnterpriseEnum } from "commons/enums/filter-by.enum";
import { EnterpriseLinksDisbursementContract } from "./enterprise-links-disbursement-contract";

@Entity({ name: 'ENTERPRISE_LINKS' })
export class EnterpriseLinks extends BaseEntity{
    
    @PrimaryGeneratedColumn({ name: 'ID'})
    id: number;

    @Column({
        name: 'LINK_TYPE',
        type: 'enum',
        enum: EnterpriseLinkTypeEnum
    })
    linkType: EnterpriseLinkTypeEnum;
    
    @Column({
        name: 'STATUS',
        type: 'enum',
        enum: EnterpriseLinkStatus
    })
    status: EnterpriseLinkStatus;

    @ManyToOne(type => Enterprise, enterprise => enterprise.enterprises)
    @JoinColumn({ name: 'ENTERPRISE_ID'})
    enterprise: Enterprise;
    
    @ManyToOne(type => Enterprise, enterprise => enterprise.enterprisesLinks)
    @JoinColumn({ name: 'ENTERPRISE_LINK_ID'})
    enterpriseLink: Enterprise;    

    @Column({
        name: 'LINK_DATE'
    })
    linkDate: Date;

    @OneToOne(type => EnterpriseRequest, enterpriseRequest => enterpriseRequest.enterpriseLink)
    enterpriseRequest: EnterpriseRequest;

    @OneToOne(type => EnterpriseLinksDisbursementContract, disbursementContract => disbursementContract.enterpriseLink)
    disbursementContract: EnterpriseLinksDisbursementContract;

    static getProviders(filter: FilterEnterprises, enterpriseId: number) {
        const queryBuilder = this.createQueryBuilder('enterpriseLinks')
            .leftJoinAndSelect('enterpriseLinks.enterprise', 'enterprise')
            .leftJoinAndSelect('enterpriseLinks.enterpriseLink', 'enterpriseLink')
            .leftJoinAndSelect('enterpriseLink.owner', 'owner')
            .leftJoinAndSelect('owner.userProperties', 'userProperties')
            .leftJoinAndSelect('enterpriseLink.enterpriseModules', 'enterpriseModules')
            .leftJoinAndSelect('enterpriseModules.catModule', 'catModule')
            .where('enterprise.id = :enterpriseId', { enterpriseId })
            .andWhere('enterpriseLinks.linkType = :type', { type: EnterpriseLinkTypeEnum.PROVIDER })
            .orderBy('enterpriseLinks.linkDate', 'DESC');

        if(filter.status && filter.status ===  FilterStatusEnum.ENABLED)
            queryBuilder.andWhere('enterpriseLinks.status = :status', { status: EnterpriseLinkStatus.ENABLED });
        if(filter.status && filter.status === FilterStatusEnum.DISABLED)
            queryBuilder.andWhere('enterpriseLinks.status = :status', { status: EnterpriseLinkStatus.DISABLED });
        if(filter.status && filter.status === FilterStatusEnum.REJECTED)
            queryBuilder.andWhere('enterpriseLinks.status = :status', { status: EnterpriseLinkStatus.REJECTED });
        if(filter.status && filter.status === FilterStatusEnum.PENDING)
            queryBuilder.andWhere('enterpriseLinks.status IN (:status)', { status: [EnterpriseLinkStatus.PENDING_AUTHORIZATION, EnterpriseLinkStatus.PENDING_CONFIRMATION, EnterpriseLinkStatus.PENDING_VALIDATION, EnterpriseLinkStatus.PENDING_LINK_CREATION] });

        if(filter.filter_by && filter.filter_by === FilterEnterpriseEnum.ENTERPRISE_NAME)
            queryBuilder.andWhere('enterpriseLink.enterpriseName LIKE :enterpriseName', { enterpriseName: `%${filter.q.replace(/ /g,'')}%` })
                .orderBy('enterpriseLink.enterpriseName', 'ASC');
        if(filter.filter_by && filter.filter_by === FilterEnterpriseEnum.NIT)
            queryBuilder.andWhere('enterpriseLink.nit LIKE :nit', { nit: `%${filter.q.replace(/ /g, '')}%` });
        if (filter.documentType)
            queryBuilder.andWhere('enterpriseLink.enterpriseDocumentType LIKE :documentType', { documentType: `%${filter.documentType.replace(/ /g, '')}%` });

        return queryBuilder.skip(((filter.page-1)*filter.per_page)).take(filter.per_page)
            .getManyAndCount();
        
    }

    static getProvidersByEnterpriseId(enterpriseId: number) {
        return this.createQueryBuilder('enterpriseLinks')
            .leftJoinAndSelect('enterpriseLinks.enterprise', 'enterprise')
            .leftJoinAndSelect('enterpriseLinks.enterpriseLink', 'enterpriseLink')
            .where('enterprise.id = :enterpriseId', { enterpriseId })
            .getMany();
    }

    static removeLink(linkId: number){
        return this.createQueryBuilder('enterpriseLinks') 
            .delete()
            .where('id = :linkId', { linkId })
            .execute();
    }

    static getEnterpriseProvidersByHint(enterpriseId: number, hint:string, link_type: EnterpriseLinkTypeEnum, documentType?: string) {
        const queryBuilder = this.createQueryBuilder('enterpriseLinks')
            .leftJoinAndSelect('enterpriseLinks.enterprise', 'enterprise')
            .leftJoinAndSelect('enterpriseLinks.enterpriseLink', 'enterpriseLink')
            .where('enterprise.id = :enterpriseId', { enterpriseId })
            .andWhere('enterpriseLinks.linkType = :type', { type: link_type })
        
        if(hint)
            queryBuilder
            .andWhere(new Brackets(qb => {
                qb.where('enterpriseLink.enterpriseName LIKE :enterpriseName', { enterpriseName: `%${hint}%` })
                  .orWhere('enterpriseLink.nit LIKE :nit', { nit: `%${hint}%` })
            })).orderBy('enterpriseLink.enterpriseName', 'ASC');
        
        if (hint && documentType)
            queryBuilder.andWhere('enterpriseLink.nit LIKE :nit', { nit: `%${hint}%` })
                .andWhere('enterpriseLink.enterpriseDocumentType LIKE :documentType', { documentType: documentType })
        
        return queryBuilder
            .getMany();
    }

    static getProviderLinkedToEnterprise(enterpriseId: number, providerId: number) {
        return this.createQueryBuilder('enterpriseLinks')
            .leftJoinAndSelect('enterpriseLinks.enterprise', 'enterprise')
            .leftJoinAndSelect('enterpriseLinks.enterpriseLink', 'enterpriseLink')
            .andWhere('enterprise.id = :enterpriseId', {enterpriseId})
            .andWhere('enterpriseLink.id = :providerId', {providerId})
            .getOne();
    }
    
    static getByEnterpriseAndLinkId(enterpriseId: number, enterpriseLinkedId: number) {
        return this.createQueryBuilder('enterpriseLinks')
            .leftJoinAndSelect('enterpriseLinks.enterprise', 'enterprise')
            .leftJoinAndSelect('enterpriseLinks.enterpriseLink', 'enterpriseLink')
            .andWhere('enterprise.id = :enterpriseId', {enterpriseId})
            .andWhere('enterpriseLink.id = :enterpriseLinkedId', {enterpriseLinkedId})
            .getOne();
    }

    static getProviderLinkedToEnterpriseandStatus(enterpriseId: number, providerId: number) {
        return this.createQueryBuilder('enterpriseLinks')
            .leftJoinAndSelect('enterpriseLinks.enterprise', 'enterprise')
            .leftJoinAndSelect('enterpriseLinks.enterpriseLink', 'enterpriseLink')
            .andWhere('enterprise.id = :enterpriseId', {enterpriseId})
            .andWhere('enterpriseLink.id = :providerId', {providerId})
            .andWhere('enterpriseLink.status = :status', {status: EnterpriseLinkStatus.ENABLED})
            .getOne();
    }
}