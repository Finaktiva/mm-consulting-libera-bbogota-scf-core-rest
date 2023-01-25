import { Entity, BaseEntity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { EnterpriseRequestTypeEnum } from "commons/enums/enterprise-request-type.enum";
import { EnterpriseRequestStatus } from "commons/enums/enterprise-request-status.enum";
import { EnterpriseLinks } from "./enterprise-links";
import { Enterprise } from "./enterprise";
import { User } from "./user";
import { FilterEnterpriseRequests } from "commons/filter";
import { CatModuleEnum } from "commons/enums/cat-module.enum";
import { EnterpriseRequestBulk } from "./enterprise-request-bulk";
import { TemporalTokens } from "./temporal-tokens";
import { FilterEnterpriseRequestEnum } from "commons/enums/filter-by.enum";
import moment = require("moment");

@Entity({ name: 'ENTERPRISE_REQUEST' })
export class EnterpriseRequest extends BaseEntity{
    
    @PrimaryGeneratedColumn({ name: 'ID'})
    id: number;

    @Column({
        name: 'COMMENTS',
        nullable: true
    })
    comments: string;
    
    @Column({
        name: 'STATUS',
        type: 'enum',
        enum: EnterpriseRequestStatus
    })
    status: EnterpriseRequestStatus;

    @Column({
        name: 'REQUEST_TYPE',
        type: 'enum',
        enum: EnterpriseRequestTypeEnum
    })
    requestType: EnterpriseRequestTypeEnum;

    @Column({
        name:'REQUESTED_MODULE',
        type: 'enum',
        enum: CatModuleEnum
    })
    requestedModule: CatModuleEnum;

    @Column({ name: 'CREATION_DATE'})
    creationDate: Date; 

    @Column({ name: 'BPM_PROCESS_INSTANCE_ID'})
    bpmProccesInstanceId: number;

    @ManyToOne(type => Enterprise, enterprise => enterprise.enterprisesRequest)
    @JoinColumn({ name: 'ENTERPRISE_ID'})
    enterprise: Enterprise;

    @ManyToOne(type => EnterpriseRequest, enterpriseRequest => enterpriseRequest.requestChildren)
    @JoinColumn({ name: 'REQUEST_PARENT_ID'})
    requestParent: EnterpriseRequest;

    @OneToMany(type => EnterpriseRequest, enterpriseRequest => enterpriseRequest.requestParent)
    requestChildren: EnterpriseRequest[];
    
    @OneToOne(type => User, user => user.enterpriseRequest)
    @JoinColumn({
        name: 'CREATION_USER'
    })
    creationUser: User;

    @OneToOne(type => EnterpriseLinks, enterpriseLinks => enterpriseLinks.enterpriseRequest)
    @JoinColumn({
        name: 'ENTERPRISE_LINK_ID'
    })
    enterpriseLink: EnterpriseLinks;

    @ManyToOne(type => EnterpriseRequestBulk, enterpiseRequestBulk => enterpiseRequestBulk.enterpriseRequest)
    @JoinColumn({
        name: 'ENTERPRISE_REQUEST_BULK_ID'
    })
    enterpriseRequestBulk: EnterpriseRequestBulk;

    @OneToOne(type => TemporalTokens, temporalTokens => temporalTokens.enterpriseRequest)
    temporalToken: TemporalTokens;


    static getOneByEnterpriseId(enterpriseId: number) {
        return this.createQueryBuilder('enterpriseRequest')
            .leftJoinAndSelect('enterpriseRequest.enterprise', 'enterprise')
            .where('enterprise.id = :enterpriseId', {enterpriseId})
            .getOne();
    }

    static getByEnterpriseId(enterpriseId){
        return this.createQueryBuilder('enterpriseRequest')
            .leftJoinAndSelect('enterpriseRequest.enterprise', 'enterprise')
            .leftJoinAndSelect('enterpriseRequest.enterpriseLink', 'enterpriseLink')
            .leftJoinAndSelect('enterpriseLink.enterprise','enterpriseToLink')
            .leftJoinAndSelect('enterpriseToLink.owner','ownerRequested')
            .leftJoinAndSelect('ownerRequested.userProperties', 'userProperties')
            .where('enterpriseRequest.enterprise = :enterpriseId', { enterpriseId })
            .getOne();
    }

    static getEnterpriseRequests(filter: FilterEnterpriseRequests) {
        const queryBuilder = this.createQueryBuilder('enterpriseRequest')
            .leftJoinAndSelect('enterpriseRequest.enterprise', 'enterprise')
            .leftJoinAndSelect('enterpriseRequest.enterpriseLink', 'enterpriseLink')
            .leftJoinAndSelect('enterpriseLink.enterpriseLink','enterpriseToLink')
            .leftJoinAndSelect('enterpriseToLink.owner','ownerRequested')
            .leftJoinAndSelect('ownerRequested.userProperties','ownerProperties')
            .leftJoinAndSelect('enterprise.owner', 'owner')
            .leftJoinAndSelect('enterprise.enterpriseModules', 'enterpriseModules')
            .leftJoinAndSelect('enterpriseModules.catModule', 'catModule')
            .leftJoinAndSelect('owner.userProperties','userProperties')
            .orderBy('enterpriseRequest.creationDate', 'DESC')

        if(filter.request && filter.request == EnterpriseRequestTypeEnum.ENTERPRISE_LINKING){
            queryBuilder.andWhere('enterpriseRequest.requestType = :type', { type: filter.request })
        }
        if(filter.request && filter.request == EnterpriseRequestTypeEnum.ENTERPRISE_MODULE_ACTIVATION)
            queryBuilder.andWhere('enterpriseRequest.requestType = :type', { type: filter.request })

        if(filter.link_type)
            queryBuilder.andWhere('enterpriseRequest.requestedModule = :linkType', {linkType: filter.link_type});
            
        if(filter.filter_by && filter.filter_by == FilterEnterpriseRequestEnum.DATE) {
            const date = moment(filter.q, moment.ISO_8601).toISOString();
            console.log(`date = ${ date }`);
            queryBuilder.andWhere(`DATE_FORMAT(enterpriseRequest.creationDate, '%y-%M-%d') = DATE_FORMAT(:date, '%y-%M-%d')`, { date });
        }

        if(filter.filter_by && filter.filter_by == FilterEnterpriseRequestEnum.NIT)
            queryBuilder.andWhere('enterprise.nit LIKE :nit', {nit : `%${filter.q.replace(/ /g,'')}%`})

        if(filter.filter_by && filter.filter_by == FilterEnterpriseRequestEnum.ENTERPRISE_NAME)
            queryBuilder.andWhere('enterprise.enterpriseName LIKE :enterpriseName', { enterpriseName: `%${filter.q.replace(/ /g,'')}%` });
        
        if(filter.status)
            queryBuilder.andWhere('enterpriseRequest.status = :status', { status: filter.status })

        return queryBuilder.skip(((filter.page-1)*filter.per_page)).take(filter.per_page)
            .getManyAndCount();
    }

    static getBasicEnterpriseRequest(requireId: number){
        return this.createQueryBuilder('enterpriseRequest')
            .leftJoinAndSelect('enterpriseRequest.creationUser', 'creationUser')
            .leftJoinAndSelect('enterpriseRequest.enterprise', 'enterprise')
            .leftJoinAndSelect('enterprise.creationUser','enterprisecreationUser')
            .leftJoinAndSelect('creationUser.userProperties', 'creationUserProperties')
            .leftJoinAndSelect('enterprise.enterpriseModules', 'modules')
            .leftJoinAndSelect('modules.catModule', 'catModule')
            .leftJoinAndSelect('enterprise.owner', 'owner')
            .leftJoinAndSelect('enterprise.economicActivity', 'economicActivity')
            .leftJoinAndSelect('economicActivity.economicSector', 'economicSector')
            .leftJoinAndSelect('owner.userProperties', 'userProperties')
            .leftJoinAndSelect('enterpriseRequest.enterpriseLink', 'enterpriseLink')
            .leftJoinAndSelect('enterpriseLink.enterpriseLink',  'enterpriseToLink')
            .leftJoinAndSelect('enterpriseToLink.economicActivity','enterpriseToLinkEconomicActivity')      
            .leftJoinAndSelect('enterpriseToLinkEconomicActivity.economicSector','enterpriseToLinkEconomicSector')      
            .leftJoinAndSelect('enterpriseToLink.creationUser','enterpriseToLinkCreationUser')
            .leftJoinAndSelect('enterpriseToLinkCreationUser.userProperties', 'enterpriseToLinkCreationUserProperties')
            .leftJoinAndSelect('enterpriseToLink.enterpriseModules', 'modulesEnterpriseToLink')
            .leftJoinAndSelect('modulesEnterpriseToLink.catModule', 'catModuleEnterpriseToLink')
            .leftJoinAndSelect('enterpriseToLink.owner', 'ownerEnterpriseToLink')
            .leftJoinAndSelect('ownerEnterpriseToLink.userProperties', 'userPropertiesEnterpriseToLink')
            .leftJoinAndSelect('enterpriseRequest.requestParent','requestParent')
            .where('enterpriseRequest.id = :requireId', {requireId})
            .getOne();
    }

    static removeRequest(requestId: number){
        return this.createQueryBuilder('enterpriseRequest')
            .delete()    
            .where('id = :requestId', { requestId })
            .execute();
    }

    static getRequestForChanges(requestId: number) {
        return this.createQueryBuilder('enterpriseRequest')
            .where('enterpriseRequest.id = :requestId', {requestId})
            .getOne();
    }

    static getEnterpriseRequestForRecodByEnterpriseId(enterpriseId: number, status: EnterpriseRequestStatus) {
        return this.createQueryBuilder('enterpriseRequest')
            .leftJoinAndSelect('enterpriseRequest.enterprise', 'enterprise')
            .where('enterprise.id = :enterpriseId', {enterpriseId})
            .andWhere('enterpriseRequest.status = :status',{status})
            .orderBy('enterpriseRequest.creationDate', 'DESC')
            .getOne();
    }

}
