import { Entity, BaseEntity, Column, PrimaryGeneratedColumn, OneToOne, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { UserStatus } from 'commons/enums/user-status.enum';
import { Enterprise } from './enterprise';
import { UserTypeEnum } from 'commons/enums/user-type.enum';
import { UserProperties } from './user-properties';
import { UserEnterprise } from './user-enterprise';
import { RoleEnum } from 'commons/enums/role.enum';
import { UserRole } from './user-role';
import { UserToken } from './user-token';
import { UserModule } from './user-module';
import { Notification } from './notification';
import { EnterpriseRequest } from './enterprise-request';
import { FilterUsers } from 'commons/filter';
import { FilterUsersEnum } from 'commons/enums/filter-by.enum';
import { FilterUserStatusEnum } from 'commons/enums/filter-status.enum';
import { EnterpriseInvoice } from './enterprise-invoice';
import { EnterpriseInvoiceBulk } from './enterprise-invoice-bulk';
import { EnterpriseInvoiceFundingProcess } from './enterprise-invoice-funding-process';
import { EnterpriseInvoiceFiles } from './enterprise-invoice-files';
import { EnterpriseFundingLink } from './enterprise-funding-link';
import { EnterpriseFundingRequest } from './enterprise-funding-request';
import { EnterpriseFundingTransactions } from './enterprise-funding-transaccions';
import { EnterpriseQuotaRequest } from './enterprise-quota-request';
import { CatLanguage } from './cat-language';
import { LenderCustomAttributes } from './lender-custom-attributes';
import { AnswerCustomAttributes } from './answer-custom-attributes';
import { EnterpriseInvoiceBulkNegotiation } from './enterprise-invoice-bulk-negotiation';
import { EnterpriseFinancingPlan } from './enterprise-financing-plan';
import { EnterpriseEconomicGroup } from './enterprise-economic-group';
import { Role } from './role';
import { RelUserBankRegion } from './rel-user-bank-region';
import { RelEnterpriseTerms } from './rel-enterprise-terms';

@Entity({name: 'USER'})
export class User extends BaseEntity {

    @PrimaryGeneratedColumn({name: 'ID'})
    id: number;

    @Column({name: 'EMAIL'})
    email: string;

    @Column({
        name: 'STATUS',
        type: 'enum',
        enum: UserStatus
    })
    status: UserStatus;

    @Column({name: 'CREATION_DATE'})
    creationDate: Date;

    @Column({name: 'MODIFICATION_DATE'})
    modificationDate: Date;

    @Column({
        name: 'TYPE',
        type: 'enum',
        enum: UserTypeEnum
    })
    type: UserTypeEnum;

    @Column({
        name: 'AFFILIATION_ACCEPTANCE_DATE',
        type: 'datetime'
    })
    affiliationAcceptanceDate: Date;

    @ManyToOne(type => CatLanguage, catLanguage => catLanguage.userCatLanguage)
    @JoinColumn({
        name: 'PREFERRED_LANGUAGE'
    })
    preferredLanguage: CatLanguage;

    @OneToMany(type => UserEnterprise, userEnterprise => userEnterprise.user)
    userEnterprises: UserEnterprise[];

    @OneToOne(type => Enterprise, enterprise => enterprise.owner)
    ownerEnterprise: Enterprise;

    @OneToMany(type => Enterprise, enterprise => enterprise.creationUser)
    createdEnterprises: Enterprise[];

    @OneToMany(type => Enterprise, enterprise => enterprise.invitationUser)
    invitationUser: Enterprise[];

    @OneToOne(type => UserProperties, userProperties => userProperties.user)
    userProperties: UserProperties;

    @OneToMany(type => UserRole, userRole => userRole.user)
    userRoles: UserRole[];
    
    @OneToMany(type => UserToken, userToken => userToken.user)
    userTokens: UserToken[];

    @OneToMany(type => UserModule, userModule => userModule.user)
    userModules: UserModule[];
    
    @OneToMany(type => Notification, notification => notification.user)
    notifications: Notification[];
    
    @OneToOne(type => EnterpriseRequest, enterpriseRequest => enterpriseRequest.creationUser)
    enterpriseRequest: EnterpriseRequest;
    
    @OneToMany(type => EnterpriseInvoice, eInvoice => eInvoice.creationUser)
    invoiceCreator: EnterpriseInvoice[];

    @OneToMany(type => EnterpriseInvoiceBulk, enterpriseInvoiceBulk => enterpriseInvoiceBulk.creationUser)
    enterpriseInvoiceBulk: EnterpriseInvoiceBulk[];
    
    @OneToMany(type => EnterpriseInvoiceFundingProcess, invoiceFundingProcess => invoiceFundingProcess.creationUser)
    invoiceFundingProcess: EnterpriseInvoiceFundingProcess[];

    @OneToMany(type => EnterpriseInvoiceFiles, invoiceFiles => invoiceFiles.creationUser)
    invoiceFiles: EnterpriseInvoiceFiles[];

    @OneToMany(type => EnterpriseFundingLink, enterpriseFundingLink => enterpriseFundingLink.updateUser)
    fundingLinkUpdateUser: EnterpriseFundingLink[];
    
    @OneToMany(type => EnterpriseFundingLink, enterpriseFundingLink => enterpriseFundingLink.creationUser)
    enterpriseFundingLink: EnterpriseFundingLink[];

    @OneToMany(type => EnterpriseFundingRequest, enterpriseFundingRequest => enterpriseFundingRequest.creationUser)
    enterpriseFundingRequestCreationUser: EnterpriseFundingRequest[];

    @OneToMany(type => EnterpriseFundingRequest, enterpriseFundingRequest => enterpriseFundingRequest.updateUser)
    enterpriseFundingRequestUpdateUser: EnterpriseFundingRequest[];

    @OneToMany(type => EnterpriseFundingRequest, enterpriseFundingRequest => enterpriseFundingRequest.approvalUser)
    enterpriseFundingRequestApprovalUser: EnterpriseFundingRequest[];

    @OneToMany(type => EnterpriseFundingTransactions, enterpriseFundingTransactions => enterpriseFundingTransactions.creationUser)
    enterpriseFundingTransactions: EnterpriseFundingTransactions[];

    @OneToMany(type => EnterpriseFundingTransactions, enterpriseFundingTransactions => enterpriseFundingTransactions.approvalUser)
    enterpriseFundingTransactionsApprovalUser: EnterpriseFundingTransactions[];

    @OneToMany(type => EnterpriseQuotaRequest, enterpriseQuotaRequest => enterpriseQuotaRequest.creationUser)
    createEntepriseQuotaRequests: EnterpriseQuotaRequest[];

    @OneToMany(type => EnterpriseQuotaRequest, enterpriseQuotaRequest => enterpriseQuotaRequest.updateUser)
    updateEntepriseQuotaRequests: EnterpriseQuotaRequest[];

    @OneToMany(type => EnterpriseQuotaRequest, enterpriseQuotaRequest => enterpriseQuotaRequest.approvalUser)
    approvalEnterpriseQuotaRequests: EnterpriseQuotaRequest[];

    @OneToMany(type => EnterpriseFundingLink, enterpriseFundingLink => enterpriseFundingLink.creationUser)
    fundingLinkCreationUser: EnterpriseFundingLink[];

    @OneToMany(type => EnterpriseFundingTransactions, enterpriseTransactions => enterpriseTransactions.creationUser)
    fundingTransactionCreationUser: EnterpriseFundingTransactions[];

    @OneToMany(type => EnterpriseFundingTransactions, enterpriseTransactions => enterpriseTransactions.approvalUser)
    fundingTransactionApprovalUser: EnterpriseFundingTransactions[];

    @OneToMany(type => LenderCustomAttributes, lenderCustomAttribute => lenderCustomAttribute.creationUser)
    lenderCustomAttributes: LenderCustomAttributes[];

    @OneToMany(type => AnswerCustomAttributes, answerCustomAttributes => answerCustomAttributes.creationUser)
    creationAnswersCustomAttributes: AnswerCustomAttributes[]
    
    @OneToMany(type => AnswerCustomAttributes, answerCustomAttributes => answerCustomAttributes.modificationUser)
    modificationAnswersCustomAttributes: AnswerCustomAttributes[]

    @OneToMany(type => EnterpriseFundingTransactions, enterpriseFundingTransactions => enterpriseFundingTransactions.creationUser)
    fundingTransactionsCreationUser: EnterpriseFundingTransactions;

    @OneToMany(type => EnterpriseInvoiceBulkNegotiation, bulkNegotiation => bulkNegotiation.creationUser)
    bulkNegociationCreator: EnterpriseInvoiceBulkNegotiation[];

    @OneToMany(type => EnterpriseFinancingPlan, enterpriseFinancingPlan => enterpriseFinancingPlan.creationUser)
    creationUserPlan: EnterpriseFinancingPlan[];

    @OneToMany(type => EnterpriseFinancingPlan, enterpriseFinancingPlan => enterpriseFinancingPlan.modificationUser)
    modificationUserPlan: EnterpriseFinancingPlan[];

    @OneToMany(type => EnterpriseFinancingPlan, enterpriseFinancingPlan => enterpriseFinancingPlan.approvalUser)
    approvalUserPlan: EnterpriseFinancingPlan[];

    @OneToMany(type => EnterpriseFinancingPlan, enterpriseFinancingPlan => enterpriseFinancingPlan.acceptanceUser)
    acceptanceUserPlan: EnterpriseFinancingPlan[];

    @OneToMany(type => EnterpriseEconomicGroup, enterpriseEconomicGroup => enterpriseEconomicGroup.creationUser)
    creationUserEconGroup: EnterpriseEconomicGroup[];

    @OneToMany(type => Role, role => role.creationUser)
    creationUserRoles: Role[];
    
    @OneToMany(type => Role, role => role.modificationUser)
    modificationUserRoles: Role[];

    @OneToMany(type => RelUserBankRegion, relUserBankRegion => relUserBankRegion.user)
    relUserBankRegion: RelUserBankRegion[];

    @OneToMany(type => RelEnterpriseTerms, relEnterpriseTerms => relEnterpriseTerms.user)
    relEnterpriseTerms: RelEnterpriseTerms[];

    static getBasicUserByEmail(email: string) {
        return this.createQueryBuilder('user')
            .where('user.email = :email', { email })
            .getOne();
    }

    static getUserByEmail(email:string): Promise<User>{
        return this.createQueryBuilder('user')
            .leftJoinAndSelect('user.ownerEnterprise', 'ownerEnterprise')
            .leftJoinAndSelect('ownerEnterprise.enterpriseModules', 'enterpriseModules')
            .leftJoinAndSelect('enterpriseModules.catModule', 'enterpriseCatModule')
            .leftJoinAndSelect('user.userModules', 'userModules')
            .leftJoinAndSelect('userModules.catModule', 'usersModulesCatModule')
            .leftJoinAndSelect('user.userRoles','userRoles')
            .leftJoinAndSelect('userRoles.role', 'userRolesRole')
            .where('user.email = :email',{email})
            .getOne();
    }

    static getUserByIdAndRoles(userId: number, roles: RoleEnum[]) {
        return this.createQueryBuilder('user')
            .leftJoinAndSelect('user.userRoles', 'userRoles')
            .leftJoinAndSelect('userRoles.role', 'role')
            .where('user.id = :userId', { userId })
            .andWhere('role.name IN (:roles)', {roles})
            .andWhere('user.status != :status', { status: UserStatus.DISABLED })
            .getOne();
    }

    static getUserById(userId: number): Promise<User>{
        return this.createQueryBuilder('user')
            .leftJoinAndSelect('user.ownerEnterprise', 'ownerEnterprise')
            .leftJoinAndSelect('user.userProperties','userProperties')
            .leftJoinAndSelect('user.userRoles','userRoles')
            .where('user.id = :userId', {userId})
            .getOne();
    }

    static deleteUserById(userId: number){
        return this.createQueryBuilder('user')
            .delete()
            .where('id = :userId', {userId})
            .execute();
    }

    static getBasicUserById(userId: number){
        return this.createQueryBuilder('user')
            .leftJoinAndSelect('user.userProperties', 'userProperties')
            .where('user.id = :userId',{userId})
            .getOne();
    }

    static getUsersCountByEmailAndStatus(email: string){
        return this.createQueryBuilder('user')
            .where('user.email = :email',{email})
            .andWhere('user.status != :status', { status: UserStatus.DELETED })
            .getCount();
    }

    static updateUserStatusById(userId: number, status: UserStatus){
        return this.createQueryBuilder('user')
            .update(User)
            .set({status})
            .where('id = :userId', {userId})
            .execute();
    }

    static getUsersByRole(roleName: RoleEnum){
        return this.createQueryBuilder('user')
        .leftJoinAndSelect('user.userRoles', 'userRoles')
        .leftJoinAndSelect('userRoles.role', 'role')
        .where('role.name = :roleName', { roleName })
        .getMany();
    }
  
    static getFullInformationByUserId(userId:number){
        return this.createQueryBuilder('user')
            .leftJoinAndSelect('user.userRoles', 'userRoles')
            .leftJoinAndSelect('userRoles.role', 'role')
            .leftJoinAndSelect('user.userModules', 'userModules')
            .leftJoinAndSelect('userModules.catModule', 'catModule')
            .where('user.id = :userId', { userId })
            .getOne();
    }
    
    static getLiberaUsers(filter: FilterUsers) {
        const queryBuilder = this.createQueryBuilder('user')
            .leftJoinAndSelect('user.userRoles', 'userRoles')
            .leftJoinAndSelect('userRoles.role', 'role')
            .leftJoinAndSelect('user.userProperties', 'userProperties')
            .leftJoinAndSelect('user.relUserBankRegion', 'relUserBankRegion')
            .leftJoinAndSelect('relUserBankRegion.bankRegion', 'bankRegion')
            .andWhere('user.type = :type', { type: UserTypeEnum.LIBERA_USER })
            .orderBy('user.affiliationAcceptanceDate', 'DESC')

        if (filter.q === FilterUserStatusEnum.PENDING) 
            filter.q = FilterUserStatusEnum.PENDING_ACCOUNT_CONFIRMATION;

        if (filter.filter_by && filter.filter_by === FilterUsersEnum.STATUS)
            queryBuilder.andWhere('user.status = :status', { status: filter.q });

        if (filter.filter_by && filter.filter_by === FilterUsersEnum.ROLE) {
            queryBuilder
                .andWhere('role.name = :role', { role: filter.q })
                .andWhere('user.status != :status', { status: UserStatus.DELETED });
        }

        if (filter.filter_by && filter.filter_by === FilterUsersEnum.FULL_NAME ) {
            queryBuilder
                .andWhere('lower(concat(userProperties.name, userProperties.firstSurname)) LIKE :name',
                    { name: `%${filter.q.replace(/ /g, '').toLowerCase()}%` })
                .andWhere('user.status != :status', { status: UserStatus.DELETED });
        }

        if (filter.filter_by && filter.filter_by === FilterUsersEnum.EMAIL)
            queryBuilder.andWhere('user.email LIKE :email', { email: `%${filter.q.replace(/ /g,'')}%` })
                        .andWhere('user.status != :status', { status: UserStatus.DELETED });

        if (filter.filter_by && filter.filter_by === FilterUsersEnum.VINCULATION_DATE)
            queryBuilder.andWhere(`DATE_FORMAT(user.affiliationAcceptanceDate, '%y-%M-%d') = DATE_FORMAT(:date, '%y-%M-%d')`, { date: filter.q })
                        .andWhere('user.status != :status', { status: UserStatus.DELETED });

        if(filter.filter_by && filter.filter_by === FilterUsersEnum.REGION)
            queryBuilder.andWhere('bankRegion.id = :regionId', { regionId: filter.q })
            
        if (!filter.q) 
            queryBuilder.andWhere('user.status != :status', { status: UserStatus.DELETED })

        return queryBuilder.skip(((filter.page - 1) * filter.per_page)).take(filter.per_page)
            .getManyAndCount();
    }

    static getByEnterpriseId(enterpriseId: number) {
        return this.createQueryBuilder('user')
            .leftJoinAndSelect('user.ownerEnterprise', 'enterprise')
            .leftJoinAndSelect('user.userProperties', 'userProperties')
            .where('enterprise.id = :enterpriseId', {enterpriseId})
            .getOne();
    }

    static getBasicUserByIdToUpdate(userId: number) {
        return this.createQueryBuilder('user')
            .leftJoinAndSelect('user.ownerEnterprise', 'enterprise')
            .where('user.id = :userId',{userId})
            .getOne();
    }

    static getUserDetail(userId: number): Promise<User>{
        return this.createQueryBuilder('user')
            .leftJoinAndSelect('user.userProperties', 'userProperties')
            .leftJoinAndSelect('user.userModules', 'userModules')
            .leftJoinAndSelect('userModules.catModule', 'usersModulesCatModule')
            .leftJoinAndSelect('user.relUserBankRegion', 'relUserBankRegion')
            .leftJoinAndSelect('relUserBankRegion.bankRegion', 'bankRegion')
            .where('user.id = :userId', { userId })
            .getOne();
    }

    static getMeById(userId: number) {
        return this.createQueryBuilder('user')
            .where('user.id = :userId', {userId})
            .getOne();
    }

    static getUserAndModules(userId: number) {
        return this.createQueryBuilder('user')
            .leftJoinAndSelect('user.userModules', 'userModules')
            .leftJoinAndSelect('user.userRoles', 'userRoles')
            .leftJoinAndSelect('userRoles.role', 'role')
            .leftJoinAndSelect('userModules.catModule', 'catModule')
            .andWhere('user.id = :userId', {userId})
            .getOne();
    }

    static getUserByuserId(userId: number) {
        return this.createQueryBuilder('user')
            .where('user.id = :userId', {userId})
            .getOne();
    }
    
    static removeUser(userId: number){
        return this.createQueryBuilder('user') 
            .delete()
            .where('id = :userId', { userId })
            .execute();
    }
    static getBasicUserRoleById(userId: number){
        return this.createQueryBuilder('user')
            .leftJoinAndSelect('user.userRoles', 'userRoles')
            .where('user.id = :userId',{userId})
            .getOne();
    }

    static getBasicUserAndLanguage(userId: number) {
        return this.createQueryBuilder('user')
            .leftJoinAndSelect('user.preferredLanguage', 'preferredLanguage')
            .andWhere('user.id = :userId', {userId})
            .getOne();
    }

    static getUserRolesAndVinculationEnterpriseByUserId(userId: number) {
        return this.createQueryBuilder('user')
            .leftJoinAndSelect('user.userRoles', 'userRoles')
            .leftJoinAndSelect('userRoles.role', 'role')
            .leftJoinAndSelect('user.userEnterprises', 'userEnterprise')
            .leftJoinAndSelect('userEnterprise.enterprise', 'enterprise')
            .where('user.id = :userId', { userId })
            .getOne();
    }

}