import moment = require('moment');
import { BaseEntity, Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, OneToMany, ManyToOne, Brackets } from 'typeorm';
import { User } from './user';
import { EnterpriseStatusEnum } from 'commons/enums/enterprise-status.enum';
import { EnterpriseModule } from './enterprise-module';
import { EnterpriseDocumentation } from './enterprise-documentation';
import { UserEnterprise } from './user-enterprise';
import { FilterEnterprises } from 'commons/filter';
import { FilterEnterpriseEnum, FilterLendersAvaiableEnum } from 'commons/enums/filter-by.enum';
import { EnterpriseModuleStatusEnum } from 'commons/enums/enterprise-module-status.enum';
import { FilterStatusEnum } from 'commons/enums/filter-status.enum';
import { EnterpriseBranding } from './enterprise-branding';
import { EnterpriseLinks } from './enterprise-links';
import { EnterpriseRequest } from './enterprise-request';
import { CatSector } from './cat-sector';
import { EnterpriseTypeEnum } from 'commons/enums/enterprise-type-enum';
import { CatLada } from './cat-lada';
import { EnterpriseRequestBulk } from './enterprise-request-bulk';
import { EnterpriseCustomAttributes } from './enterprise-custom-attributes';
import { EnterpriseInvoice } from './enterprise-invoice';
import { EnterpriseInvoiceBulk } from './enterprise-invoice-bulk';
import { EnterpriseInvoiceFundingProcess } from './enterprise-invoice-funding-process';
import { EnterpriseFundingLink } from './enterprise-funding-link';
import { EnterpriseFundingRequest } from './enterprise-funding-request';
import { IFilterLenders } from 'commons/interfaces/query-filters.interface';
import { CatModuleEnum } from 'commons/enums/cat-module.enum';
import { EnterpriseFundingLinkStatusEnum } from 'commons/enums/enterprise-funding-link-status.enum';
import { EnterpriseQuotaRequest } from './enterprise-quota-request';
import { LenderCustomAttributes } from './lender-custom-attributes';
import { EnterpriseInvoiceBulkNegotiation } from './enterprise-invoice-bulk-negotiation';
import { CatEconomicActivity } from './cat-ciiu-economic-activity';
import { CatBankRegion } from './cat-bank-regions';
import { EnterpriseFinancingPlan } from './enterprise-financing-plan';
import { EnterpriseEconomicGroup } from './enterprise-economic-group';
import { RelEnterpriseTerms } from './rel-enterprise-terms';

@Entity({ name: 'ENTERPRISE' })
export class Enterprise extends BaseEntity {

    @PrimaryGeneratedColumn({ name: 'ID' })
    id: number;

    @Column({ name: 'ENTERPRISE_NAME' })
    enterpriseName: string;

    @Column({ name: 'NIT' })
    nit: string;

    @OneToOne(type => User, user => user.ownerEnterprise)
    @JoinColumn({ name: 'OWNER_ID' })
    owner: User;

    @Column({ name: 'CREATION_DATE' })
    creationDate: Date;

    @Column({
        name: 'STATUS',
        type: 'enum',
        enum: EnterpriseStatusEnum
    })
    status: EnterpriseStatusEnum;

    @Column({
        name: 'PHONE_NUMBER'
    })
    phoneNumber: string;

    @OneToOne(type => CatLada, catLada => catLada.enterprise)
    @JoinColumn({
        name: 'LADA_ID'
    })
    lada: CatLada;

    @Column({ name: 'COMMENT' })
    comment: string;

    @Column({ name: 'AFFILIATION_ACCEPTANCE_DATE' })
    affiliationAcceptanceDate: Date;

    @Column({ name: 'REFERENCE_REQUEST_ID', type: 'bigint' })
    referenceRequest: number;

    @ManyToOne(type => User, user => user.createdEnterprises)
    @JoinColumn({ name: 'CREATION_USER' })
    creationUser: User;

    @Column({ name: 'LADA_ID' })
    ladaId: string;

    @Column({ name: 'ENTERPRISE_DOCUMENT_TYPE' })
    enterpriseDocumentType: string;

    @Column({ name: 'PRODUCT_TYPE' })
    productType: string;

    @Column({ name: 'DEPARTMENT' })
    department: string;

    @Column({ name: 'CITY' })
    city: string;

    @Column({ name: 'RELATIONSHIP_MANAGER' })
    relationshipManager: string;

    @Column({ name: 'SALE' })
    sale: string;

    @Column({ name: 'SALES_CUT' })
    salesCut: string;

    @ManyToOne(type => User, user => user.invitationUser)
    @JoinColumn({ name: 'INVITATION_USER_ID' })
    invitationUser: User;

    @ManyToOne(type => CatEconomicActivity, catEconomicActivity => catEconomicActivity.enterprises)
    @JoinColumn({ name: 'CIIU_CODE' })
    economicActivity: CatEconomicActivity;

    @ManyToOne(type => CatBankRegion, bankRegion => bankRegion.enterpriseBankRegion)
    @JoinColumn({ name: 'BANK_REGION_ID' })
    bankRegion: CatBankRegion;

    @OneToMany(type => UserEnterprise, userEnterprise => userEnterprise.enterprise)
    userEnterprises: UserEnterprise[];

    @OneToMany(type => EnterpriseModule, enterpriseModule => enterpriseModule.enterprise)
    enterpriseModules: EnterpriseModule[];

    @OneToMany(type => EnterpriseDocumentation, enterpriseDocumentation => enterpriseDocumentation.enterprise)
    enterpriseDocumentations: EnterpriseDocumentation[];

    @OneToOne(type => EnterpriseBranding, enterpriseBranding => enterpriseBranding.enterprise)
    enterpriseBranding: EnterpriseBranding;

    @OneToMany(type => EnterpriseLinks, enterpriseLinks => enterpriseLinks.enterprise)
    enterprises: EnterpriseLinks[];

    @OneToMany(type => EnterpriseLinks, enterpriseLinks => enterpriseLinks.enterpriseLink)
    enterprisesLinks: EnterpriseLinks[];

    @OneToMany(type => EnterpriseRequest, enterpriseRequest => enterpriseRequest.enterprise)
    enterprisesRequest: EnterpriseRequest[];

    @OneToMany(type => EnterpriseRequestBulk, enterpriseRequestBulk => enterpriseRequestBulk.enterprise)
    enterpriseRequestBulk: EnterpriseRequestBulk[];

    @OneToOne(type => CatSector, catSector => catSector.enterprise)
    @JoinColumn({ name: 'SECTOR_ID' })
    sector: CatSector;

    @OneToMany(type => EnterpriseCustomAttributes, enterpriseCustomAttributes => enterpriseCustomAttributes.enterprise)
    enterpriseCustomAttributes: EnterpriseCustomAttributes[];

    @OneToMany(type => EnterpriseInvoice, enterpriseInvoice => enterpriseInvoice.enterprise)
    enterpriseInvoice: EnterpriseInvoice[];

    @OneToMany(type => EnterpriseInvoice, enterpriseInvoice => enterpriseInvoice.enterprise)
    enterpriseInvoiceProvider: EnterpriseInvoice[];

    @OneToMany(type => EnterpriseInvoice, enterpriseInvoice => enterpriseInvoice.enterprise)
    enterpriseInvoiceLender: EnterpriseInvoice[];

    @Column({
        name: 'TYPE',
        type: 'enum',
        enum: EnterpriseTypeEnum
    })
    type: EnterpriseTypeEnum;

    @OneToMany(type => EnterpriseInvoiceBulk, enterpriseInvoiceBulk => enterpriseInvoiceBulk.enterprise)
    enterpriseInvoiceBulk: EnterpriseInvoiceBulk[];
    
    @OneToOne(type => EnterpriseInvoiceFundingProcess, invoiceFundingProcess => invoiceFundingProcess.lender)
    invoiceFundingProcess: EnterpriseInvoiceFundingProcess;

    @OneToMany(type => EnterpriseFundingLink, enterpriseFundingLink => enterpriseFundingLink.payer)
    enterpriseFundingLinkPayer: EnterpriseFundingLink[];

    @OneToMany(type => EnterpriseFundingLink, enterpriseFundingLink => enterpriseFundingLink.lender)
    enterpriseFundingLinkLender: EnterpriseFundingLink[];

    @OneToMany(type => EnterpriseFundingRequest, enterpriseFundingRequest => enterpriseFundingRequest.payer)
    enterpriseFundingRequestPayer: EnterpriseFundingRequest[];

    @OneToMany(type => EnterpriseFundingRequest, enterpriseFundingRequest => enterpriseFundingRequest.lender)
    enterpriseFundingRequestLender: EnterpriseFundingRequest[];
    
    @OneToMany(type => EnterpriseQuotaRequest, enterpriseQuotaRequest => enterpriseQuotaRequest.payer)
    payerEnterpriseQuotaRequests: EnterpriseQuotaRequest[];
    
    @OneToMany(type => EnterpriseQuotaRequest, enterpriseQuotaRequest => enterpriseQuotaRequest.lender)
    lenderEnterpriseQuotaRequests: EnterpriseQuotaRequest[];

    @OneToMany(type => LenderCustomAttributes, lenderCustomAttributes => lenderCustomAttributes.lender)
    lenderCustomAttributes: LenderCustomAttributes[];

    @OneToMany(type => EnterpriseInvoiceBulkNegotiation, enterpriseInvoiceBulkNegotiation => enterpriseInvoiceBulkNegotiation.enterprise)
    enterpriseInvoiceBulkNegotiation: EnterpriseInvoiceBulkNegotiation[];

    @OneToMany(type => EnterpriseInvoiceBulkNegotiation, enterpriseInvoiceBulkNegotiation => enterpriseInvoiceBulkNegotiation.enterprise)
    enterpriseInvoiceBulkNegotiationProvider: EnterpriseInvoiceBulkNegotiation[];

    @OneToMany(type => EnterpriseInvoiceBulkNegotiation, enterpriseInvoiceBulkNegotiation => enterpriseInvoiceBulkNegotiation.enterprise)
    enterpriseInvoiceBulkNegotiationLender: EnterpriseInvoiceBulkNegotiation[];

    @OneToMany(type => EnterpriseFinancingPlan, EnterpriseFinancingPlan => EnterpriseFinancingPlan.payer)
    payerFinancingPlan: EnterpriseFinancingPlan[];

    @OneToMany(type => EnterpriseFinancingPlan, EnterpriseFinancingPlan => EnterpriseFinancingPlan.provider)
    providerFinancingPlan: EnterpriseFinancingPlan[];

    @OneToMany(type => EnterpriseEconomicGroup, economicGroup => economicGroup.enterprise)
    economicGroups: EnterpriseEconomicGroup[];

    @Column({
        name: 'COMES_FROM_API'
    })
    comesFromAPI: boolean;

    @OneToMany(type => RelEnterpriseTerms, relEnterpriseTerms => relEnterpriseTerms.enterprise)
    relEnterpriseTerms: RelEnterpriseTerms[];

    @Column({
        name: 'FINANCIAL_CONDITIONS',
        nullable: true
    })
    financialConditions: string;
    
    static getById(enterpriseId: number) {
        const queryB =  this.createQueryBuilder('enterprise')
            .leftJoinAndSelect('enterprise.owner', 'owner')
            .leftJoinAndSelect('enterprise.creationUser', 'creationUser')
            .leftJoinAndSelect('owner.userProperties', 'ownerUserProperties')
            .leftJoinAndSelect('owner.userModules', 'ownerUserModule')
            .leftJoinAndSelect('ownerUserModule.catModule', 'catModules')
            .leftJoinAndSelect('creationUser.userProperties', 'creationUserProperties')
            .leftJoinAndSelect('enterprise.enterpriseModules', 'enterpriseModules')
            .leftJoinAndSelect('enterpriseModules.catModule', 'catModule')
            .leftJoinAndSelect('enterprise.userEnterprises', 'userEnterprises')
            .leftJoinAndSelect('enterpriseModules.enterprise', 'enterpriseModule')
            .leftJoinAndSelect('enterprise.enterpriseDocumentations', 'enterpriseDocumentations')
            .leftJoinAndSelect('enterprise.lada', 'lada')
            .leftJoinAndSelect('enterprise.economicActivity', 'economicActivity')
            .leftJoinAndSelect('economicActivity.economicSector', 'economicSector')
            .leftJoinAndSelect('enterprise.bankRegion', 'bankRegion')
            .where('enterprise.id = :enterpriseId', { enterpriseId })
            // console.log('--->> QueryB: ', queryB.getQueryAndParameters());
        return    queryB.getOne();
    }

    static getEnterprise(filter: FilterEnterprises) {
        const queryBuilder = this.createQueryBuilder('enterprise')
            .leftJoinAndSelect('enterprise.owner', 'owner')
            .leftJoinAndSelect('enterprise.creationUser', 'creationUser')
            .leftJoinAndSelect('owner.userProperties', 'ownerProperties')
            .leftJoinAndSelect('enterprise.enterpriseModules', 'enterpriseModules')
            .leftJoinAndSelect('enterpriseModules.catModule', 'catModule')
            .leftJoinAndSelect('enterprise.bankRegion', 'bankRegion')
            .orderBy('enterprise.creationDate', 'DESC')

        console.log(`status: ${filter.status}`);

        if (filter.status) 
            queryBuilder.andWhere('enterprise.status LIKE :status', { status: `%${filter.status}%` });

        console.log(`filter.q = ${filter.q}`);

        if (filter.filter_by && filter.filter_by == FilterEnterpriseEnum.DATE) {
            const date = moment(filter.q, moment.ISO_8601).toISOString();
            console.log('date ', date);
            queryBuilder.andWhere(`DATE_FORMAT(enterprise.affiliationAcceptanceDate, '%y-%M-%d') = DATE_FORMAT(:date, '%y-%M-%d')`, { date });
        }
        if (filter.filter_by && filter.filter_by == FilterEnterpriseEnum.NIT)
            queryBuilder.andWhere('enterprise.nit LIKE :nit', { nit: `%${filter.q.replace(/ /g, '')}%` })
        if (filter.filter_by && filter.filter_by == FilterEnterpriseEnum.PROVIDER)
            queryBuilder.andWhere('catModule.name LIKE :provider', { provider: FilterEnterpriseEnum.PROVIDER });
        if (filter.filter_by && filter.filter_by == FilterEnterpriseEnum.PAYER)
            queryBuilder.andWhere('(catModule.name LIKE :payer)', { payer: FilterEnterpriseEnum.PAYER });
        if (filter.filter_by && filter.filter_by == FilterEnterpriseEnum.FUNDING)
            queryBuilder.andWhere('(catModule.name LIKE :funding)', { funding: FilterEnterpriseEnum.FUNDING });
        if (filter.filter_by && filter.filter_by == FilterEnterpriseEnum.ENTERPRISE_NAME)
            queryBuilder.andWhere('enterprise.enterpriseName LIKE :enterpriseName', { enterpriseName: `%${filter.q}%` });
        if (filter.filter_by && filter.filter_by == FilterEnterpriseEnum.REGION)
            queryBuilder.andWhere('enterprise.bankRegion LIKE :bankRegion', { bankRegion: `%${+filter.q}%` });
        if(filter.filter_by && filter.filter_by == FilterEnterpriseEnum.ACTIVE_PRODUCTS)
            queryBuilder.andWhere('enterprise.productType = :q', { q: filter.q });
        if(filter.filter_by && filter.filter_by == FilterEnterpriseEnum.FINANCIAL_CONDITIONS)
            queryBuilder.andWhere('enterprise.financialConditions = :q', { q: filter.q });

        if (filter.documentType)
            queryBuilder.andWhere('enterprise.enterpriseDocumentType LIKE :documentType', { documentType: `%${filter.documentType.replace(/ /g, '')}%` });
        if (filter.hint && filter.module)
            queryBuilder.andWhere(new Brackets(qb => {
                qb.where('enterprise.enterpriseName LIKE :enterpriseName', { enterpriseName: `%${filter.hint.replace(/ /g, '')}%` })
                    .orWhere('enterprise.nit LIKE :nit', { nit: `%${filter.hint.replace(/ /g, '')}%` })
                    .andWhere('catModule.name LIKE :module', { module: `%${filter.module.replace(/ /g, '')}%` } )
            }));

        return queryBuilder.skip(((filter.page - 1) * filter.per_page)).take(filter.per_page)
            .getManyAndCount();
    }

    static getEnterpriseByUserId(userId: number): Promise<Enterprise> {
        let query =  this.createQueryBuilder('enterprise')
            .leftJoinAndSelect('enterprise.owner', 'owner')
            .leftJoinAndSelect('enterprise.creationUser', 'creationUser')
            .leftJoinAndSelect('enterprise.invitationUser', 'invitationUser')
            .where('enterprise.owner.id = :userId', { userId })            
            // console.log('===> Query: ', query.getQueryAndParameters());
    
        return query.getOne();
    }

    static getEnterpriseByOwnerIdAndEnterpriseId(ownerId: number, enterpriseId: number) {
        return this.createQueryBuilder('enterprise')
            .leftJoinAndSelect('enterprise.owner', 'owner')
            .where('enterprise.owner.id = :ownerId', { ownerId })
            .andWhere('enterprise.id = :enterpriseId', { enterpriseId })
            .getOne();
    }

    static getEnterpriseByNit(nit: string) {
        return this.createQueryBuilder('enterprise')
            .where('enterprise.nit = :nit ', { nit })
            .getOne();
    }

    static getBasicEnterpriseById(enterpriseId: number) {
        return this.createQueryBuilder('enterprise')
            .leftJoinAndSelect('enterprise.owner', 'owner')
            .leftJoinAndSelect('enterprise.creationUser', 'creationUser')
            .leftJoinAndSelect('enterprise.invitationUser', 'invitationUser')
            .leftJoinAndSelect('enterprise.economicActivity', 'economicActivity')
            .leftJoinAndSelect('economicActivity.economicSector', 'economicSector')
            .where('enterprise.id = :enterpriseId', { enterpriseId })
            .getOne();
    }

    static deleteEnterpriseById(enterpriseId: number) {
        return this.createQueryBuilder('enterprise')
            .delete()
            .where('id = :enterpriseId', { enterpriseId })
            .execute();
    }

    static getEnterpriseByIdToUpdate(enterpriseId: number) {
        return this.createQueryBuilder('enterprise')
            .leftJoinAndSelect('enterprise.sector', 'sector')
            .leftJoinAndSelect('enterprise.lada', 'lada')
            .leftJoinAndSelect('enterprise.owner', 'owner')
            .leftJoinAndSelect('enterprise.bankRegion', 'bankRegion')
            .where('enterprise.id = :enterpriseId', { enterpriseId })
            .getOne();
    }

    static getEnterpriseByNIT(nit: string) {
        return this.createQueryBuilder('enterprise')
            .leftJoinAndSelect('enterprise.owner', 'owner')
            .leftJoinAndSelect('enterprise.creationUser', 'creationUser')
            .leftJoinAndSelect('owner.userProperties', 'ownerUserProperties')
            .leftJoinAndSelect('owner.userModules', 'ownerUserModule')
            .leftJoinAndSelect('ownerUserModule.catModule', 'catModules')
            .leftJoinAndSelect('creationUser.userProperties', 'creationUserProperties')
            .leftJoinAndSelect('enterprise.enterpriseModules', 'enterpriseModules')
            .leftJoinAndSelect('enterpriseModules.catModule', 'catModule')
            .leftJoinAndSelect('enterprise.userEnterprises', 'userEnterprises')
            .leftJoinAndSelect('enterpriseModules.enterprise', 'enterpriseModule')
            .leftJoinAndSelect('enterprise.enterpriseDocumentations', 'enterpriseDocumentations')
            .leftJoinAndSelect('enterprise.sector', 'sector')
            .leftJoinAndSelect('enterprise.lada', 'lada')
            .leftJoinAndSelect('enterprise.economicActivity', 'economicActivity')
            .leftJoinAndSelect('economicActivity.economicSector', 'economicSector')
            .where('enterprise.nit = :nit', { nit })
            .getOne();
    }

    static getEnterpriseToLinkByNIT(nit) {
        return this.createQueryBuilder('enterprise')
            .leftJoinAndSelect('enterprise.sector', 'sector')
            .leftJoinAndSelect('enterprise.creationUser', 'creationUser')
            .leftJoinAndSelect('enterprise.lada', 'lada')
            .leftJoinAndSelect('enterprise.owner', 'owner')
            .leftJoinAndSelect('owner.userProperties', 'userProperties')
            .leftJoinAndSelect('enterprise.enterpriseModules', 'enterpriseModules')
            .leftJoinAndSelect('enterpriseModules.catModule', 'catModule')
            // .leftJoinAndSelect('enterprise.enterprisesLinks', 'enterprisesLinks')
            .where('enterprise.nit = :nit ', { nit })
            .getOne();
    }

    static removeEnterprise(enterpriseId: number) {
        return this.createQueryBuilder('enterprise')
            .delete()
            .where('id = :enterpriseId', { enterpriseId })
            .execute();
    }

    static getEnterpriseForCustomAttributes(enterpriseId: number) {
        return this.createQueryBuilder('enterprise')
            .leftJoinAndSelect('enterprise.enterpriseCustomAttributes', 'enterpriseCustomAttributes')
            .leftJoinAndSelect('enterpriseCustomAttributes.customAttributes', 'customAttributes')
            .andWhere('enterprise.id = :enterpriseId', { enterpriseId })
            .getOne();
    }

    static getEnterpriseAndOwnerByDocumentTypeAndNumber(nit : string, enterpriseDocumentType: string){
        return this.createQueryBuilder('enterprise')
            .leftJoinAndSelect('enterprise.owner', 'owner')
            .leftJoinAndSelect('enterprise.economicActivity', 'economicActivity')
            .where('enterprise.nit = :nit ', {nit})
            .andWhere('enterprise.enterpriseDocumentType = :enterpriseDocumentType', {enterpriseDocumentType})
            .getOne();
    }

    static getEnterpriseByIdForDeleteCA(enterpriseId: number) {
        return this.createQueryBuilder('enterprise')
            .leftJoinAndSelect('enterprise.enterpriseCustomAttributes', 'enterpriseCustomAttributes')
            .andWhere('enterprise.id = :enterpriseId', {enterpriseId})
            .getOne();
    }
    
    static updateStatus(enterpriseId: number, status: EnterpriseStatusEnum) { 
        return this.createQueryBuilder('enterprise')
            .update(Enterprise)
            .set({status})
            .where('id =:enterpriseId', {enterpriseId})
            .execute();
    }

    static getEnterpriseWithModulesAndRoles(enterpriseId: number) {
        return this.createQueryBuilder('enterprise')
            .leftJoinAndSelect('enterprise.enterpriseModules', 'enterpriseModules')
            .leftJoinAndSelect('enterpriseModules.catModule', 'catModule')
            .leftJoinAndSelect('enterprise.owner', 'owner')
            .leftJoinAndSelect('owner.userProperties', 'userProperties')
            .leftJoinAndSelect('owner.userRoles', 'userRoles')
            .leftJoinAndSelect('userRoles.role', 'role')
            .where('enterprise.id = :enterpriseId', {enterpriseId})
            .getOne();
    }

    static getLenderById(lenderId: number) {
        return this.createQueryBuilder('enterprise')
            .leftJoinAndSelect('enterprise.owner', 'owner')
            .where('enterprise.id = :lenderId', {lenderId})
            .getOne();
    }

    static getLendersAvaiable (filter: IFilterLenders, payerId: number) {

        const queryBuilder = this.createQueryBuilder('enterprise')
        .leftJoinAndSelect('enterprise.owner','owner')
        .leftJoinAndSelect('owner.userProperties','ownerProperties')
        .leftJoinAndSelect('enterprise.enterpriseModules', 'enterpriseModules')
        .leftJoinAndSelect('enterpriseModules.catModule', 'catModule')
        .leftJoinAndSelect('enterprise.enterpriseFundingLinkPayer','payer')
        .leftJoinAndSelect('enterprise.enterpriseFundingLinkLender','lender')
        .where('enterprise.status = :enterpriseStatus', { enterpriseStatus: EnterpriseStatusEnum.ENABLED } )
        .andWhere('catModule.name = :catModule', {catModule: CatModuleEnum.FUNDING })
        .andWhere('enterpriseModules.status = :status ', {status: EnterpriseModuleStatusEnum.ENABLED})
        .andWhere('enterprise.id != :payerId', {payerId})
        .andWhere(qb => {
             const subQuery = qb.subQuery()
                 .select(['lender.id'])
                 .from(EnterpriseFundingLink, 'enterpriseFundingLink')
                 .leftJoin('enterpriseFundingLink.lender','lender')
                 .leftJoin('enterpriseFundingLink.payer','payer')
                 .where('payer.id = :payerId', { payerId })
                 .andWhere('enterpriseFundingLink.status = :enterpriseLinkStatus', { enterpriseLinkStatus: EnterpriseFundingLinkStatusEnum.ENABLED })
                 .getQuery();
                return `enterprise.id NOT IN ${subQuery}`;
        });

        console.log('filterBy -->> ', filter.filterBy);
        console.log('q -->> ', filter.q);
        
        if(filter.filterBy === FilterLendersAvaiableEnum.ENTERPRISE_NAME){
            console.log('enterpriseName --->>');
            queryBuilder.andWhere('enterprise.enterpriseName LIKE :enterpriseName' , { enterpriseName: `%${filter.q.replace(/ /g, '')}%`});
        } 
        if(filter.filterBy === FilterLendersAvaiableEnum.NIT)
            queryBuilder.andWhere('enterprise.nit LIKE :nit' , { nit: `%${filter.q.replace(/ /g, '')}%`});
        
        return queryBuilder
        .skip(((filter.page - 1) * filter.perPage))
        .take(filter.perPage)
        .getManyAndCount();
    }

    static getBasic(enterpriseId: number) {
        return this.createQueryBuilder('enterprise')
            .where('enterprise.id = :enterpriseId', {enterpriseId})
            .getOne();
    }

    static getEnterpriseByNitAndStatuses(nit: string, status: EnterpriseStatusEnum[]): Promise<Enterprise> {
        return this.createQueryBuilder('enterprise')
        .leftJoinAndSelect('enterprise.sector', 'sector')
        .leftJoinAndSelect('enterprise.creationUser', 'creationUser')
        .leftJoinAndSelect('enterprise.lada', 'lada')
        .leftJoinAndSelect('enterprise.owner', 'owner')
        .leftJoinAndSelect('owner.userProperties', 'userProperties')
        .leftJoinAndSelect('enterprise.enterpriseModules', 'enterpriseModules')
        .leftJoinAndSelect('enterpriseModules.catModule', 'catModule')
        .where('enterprise.nit = :nit', { nit })
        .andWhere('enterprise.status IN (:status)', { status })
        .getOne();
    }

    static getByDocumentNumber(nit: string, type: string, module?: string, product?: string) {
        const queryBuilder = this.createQueryBuilder('enterprise')
        .where('enterprise.nit = :nit', { nit })
        .andWhere('enterprise.enterpriseDocumentType = :type', { type })
        .leftJoinAndSelect('enterprise.enterpriseModules', 'enterpriseModules')
        .leftJoinAndSelect('enterpriseModules.catModule', 'catModule');

        if(product){
            queryBuilder.andWhere('enterprise.productType = :product', { product });
        }

        if(module){
            queryBuilder.andWhere('catModule.name = :module', { module });
        }

        // console.log('=====> Query: ', queryBuilder.getQueryAndParameters());
        
        return queryBuilder.getOne();
    }

    static getByOwnerId(ownerId: number) {
        return this.createQueryBuilder('enterprise')
            .leftJoinAndSelect('enterprise.owner', 'owner')
            .where('enterprise.owner.id = :ownerId', { ownerId })
            .getOne();
    }

    static getEnterpriseByStatus(status: string) {
        const Query = this.createQueryBuilder('enterprise')
            .where('enterprise.status = :status', { status })
            .andWhere('enterprise.comesFromAPI = :comesFromAPI', { comesFromAPI: true })
        // console.log('=======>>> QUERY: ', Query.getQueryAndParameters());
        return Query.getMany();
    }

    static getEnterprisePayers(enterprise_id: number): Promise<Enterprise[]> {
        const queryBuilder = this.createQueryBuilder('enterprise')
            .leftJoinAndSelect('enterprise.enterpriseModules', 'enterpriseModules')
            .leftJoinAndSelect('enterpriseModules.catModule', 'catModule')
            .andWhere('enterprise.status = :enterpriseStatus', { enterpriseStatus: EnterpriseStatusEnum.ENABLED })
            .andWhere('(catModule.name = :payer)', { payer: FilterEnterpriseEnum.PAYER })
            .andWhere('enterprise.id != :enterprise_id', {enterprise_id});
        
        return queryBuilder.getMany();
    }

    static getEnterprisesById(enterpriseIds: number[]) {
        const queryB =  this.createQueryBuilder('enterprise')
            .leftJoinAndSelect('enterprise.owner', 'owner')
            .leftJoinAndSelect('enterprise.creationUser', 'creationUser')
            .leftJoinAndSelect('owner.userProperties', 'ownerUserProperties')
            .leftJoinAndSelect('owner.userModules', 'ownerUserModule')
            .leftJoinAndSelect('ownerUserModule.catModule', 'catModules')
            .leftJoinAndSelect('creationUser.userProperties', 'creationUserProperties')
            .leftJoinAndSelect('enterprise.enterpriseModules', 'enterpriseModules')
            .leftJoinAndSelect('enterpriseModules.catModule', 'catModule')
            .leftJoinAndSelect('enterprise.userEnterprises', 'userEnterprises')
            .leftJoinAndSelect('enterpriseModules.enterprise', 'enterpriseModule')
            .leftJoinAndSelect('enterprise.enterpriseDocumentations', 'enterpriseDocumentations')
            .leftJoinAndSelect('enterprise.lada', 'lada')
            .leftJoinAndSelect('enterprise.economicActivity', 'economicActivity')
            .leftJoinAndSelect('economicActivity.economicSector', 'economicSector')
            .leftJoinAndSelect('enterprise.bankRegion', 'bankRegion')
            .where('enterprise.id IN (:enterpriseIds)', { enterpriseIds })
            
        return queryB.getMany();
    }

    static getOwnerDetail(enterpriseId: number) {
        return this.createQueryBuilder('enterprise')
            .leftJoinAndSelect('enterprise.owner', 'owner')
            .leftJoinAndSelect('owner.userProperties', 'userProperties')
            .leftJoinAndSelect('owner.userModules', 'userModules')
            .leftJoinAndSelect('userModules.catModule', 'catModule')
            .where('enterprise.id = :enterpriseId', { enterpriseId })
            .getOne();
    }
    
    static updateFinancialConditionsById(financialConditions, enterpriseId){
        this.createQueryBuilder('enterprise')
            .update(Enterprise)
            .set({ financialConditions })
            .where('id = :enterpriseId', { enterpriseId })
            .execute();
    }
}