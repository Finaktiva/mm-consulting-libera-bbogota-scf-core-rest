import { BaseEntity, Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, OneToMany, ManyToOne } from 'typeorm';
import { User } from './user';
import { Enterprise } from './enterprise';
import { CatBaseRateType } from './cat-base-rate-type';
import { CatRatePeriodicityType } from './cat_rate_periodicity_type';
import { S3Metadata } from './s3-metadata';
import { EnterpriseEconomicGroup } from './enterprise-economic-group';
import { FinancingPlanClientPermission } from './financing-plan-client-permission';
import { FilterByFinancingPlans, FilterRoleUserTypeEnum } from 'commons/enums/filter-by.enum';
import { EFinancingObservations, EinancingPlanStatus } from 'commons/enums/financing-plan-type.enum';
import { FilterFinancingPlans } from 'commons/filter';
import { FinancingPlanStatusEnum } from 'commons/enums/financing-plan-status-actions.enum';
import { BadRequestException } from 'commons/exceptions';

@Entity({ name: 'ENTERPRISE_FINANCING_PLAN' })
export class EnterpriseFinancingPlan extends BaseEntity {

    @PrimaryGeneratedColumn({ name: 'ID' })
    id: number;

    @Column({ name: 'FOLIO_NUMBER' })
    folioNumber: string;

    @Column({ name: 'TYPE' })
    type: string;

    @Column({ name: 'COMMENTS' })
    comments: string;
    
    @ManyToOne(type => Enterprise, enterprise => enterprise.payerFinancingPlan)
    @JoinColumn({ name: 'PAYER_ID' })
    payer: Enterprise;
    
    @ManyToOne(type => Enterprise, enterprise => enterprise.providerFinancingPlan)
    @JoinColumn({ name: 'PROVIDER_ID' })
    provider: Enterprise;
    
    @Column({
        name: 'AGREEMENT',
        type: 'bit',
        transformer: { from: (v: Buffer) => v ? !!v.readInt8(0): null, to: (v) => v }
    })
    agreement: boolean;
    
    @Column({
        name: 'REQUIRE_PROVIDER_AUTH_FOR_PERFORM_OPERATION',
        type: 'bit',
        transformer: { from: (v: Buffer) => v ? !!v.readInt8(0): null, to: (v) => v }
    })
    providerAuth: boolean;

    @Column({ name: 'PROVIDER_AUTH_AFTER_DAY' })
    authDays: number;

    @Column({ name: 'TOTAL_SALES' })
    sales: number;
    
    @Column({ name: 'SALES_CUT' })
    salesCut: Date;
    
    @ManyToOne(type => CatBaseRateType, catBaseRateType => catBaseRateType.minBaseRatePlans)
    @JoinColumn({ name: 'MINIMUM_BASE_RATE_TYPE' })
    minBaseRate: CatBaseRateType;

    @Column({ name: 'MINIMUM_BASE_RATE_VALUE' })
    minBaseRateValue: number;

    @Column({ name: 'MINIMUM_SPECIAL_RATE_VALUE' })
    minSpecialRateValue: number;
    
    @ManyToOne(type => CatRatePeriodicityType, catBaseRateType => catBaseRateType.minBasePeriodicityPlans)
    @JoinColumn({ name: 'MINIMUM_SPECIAL_RATE_PERIODICITY_TYPE' })
    minRatePeriodicity: CatRatePeriodicityType;

    @Column({ name: 'MINIMUM_EFFECTIVE_RATE_EA' })
    minEfectiveRateEA: number;

    @Column({ name: 'MINIMUM_EFFECTIVE_RATE_MV' })
    minEfectiveRateMV: number;
    
    @Column({
        name: 'SPECIAL_RATE',
        type: 'bit',
        transformer: { from: (v: Buffer) => v ? !!v.readInt8(0): null, to: (v) => v }
    })
    specialRate: boolean;
    
    @Column({ name: 'VALIDITY_DAYS' })
    validityDays: number;
    
    @Column({ name: 'VALIDITY_DATE' })
    validityDate: Date;
    
    @ManyToOne(type => CatBaseRateType, catBaseRateType => catBaseRateType.negociatedBaseRatePlans)
    @JoinColumn({ name: 'NEGOTIATED_BASE_RATE_TYPE' })
    negociatedBaseRate: CatBaseRateType;

    @Column({ name: 'NEGOTIATED_BASE_RATE_VALUE' })
    negociatedBaseRateValue: number;
    
    @Column({ name: 'NEGOTIATED_SPECIAL_RATE_VALUE' })
    negociatedSpecialRateValue: number;
    
    @ManyToOne(type => CatRatePeriodicityType, catBaseRateType => catBaseRateType.negociatedRatePeriodicityPlans)
    @JoinColumn({ name: 'NEGOTIATED_RATE_PERIODICITY_TYPE' })
    negociatedRatePeriodicity: CatRatePeriodicityType;

    @Column({ name: 'NEGOTIATED_EFFECTIVE_RATE_EA' })
    negociatedEfecRateEA: number;

    @Column({ name: 'NEGOTIATED_EFFECTIVE_RATE_MV' })
    negociatedEfecRateMV: number;

    @Column({ name: 'PAYDAY_INITIAL_RANGE' })
    payDayInitialRange: number;

    @Column({ name: 'PAYDAY_FINAL_RANGE' })
    payDayFinalRange: number;

    @Column({ name: 'OPERATION_TERM_DAYS' })
    operationTermDays: number;

    @Column({ name: 'PAYMENT_METHOD' })
    paymentMethod: string;

    @Column({
        name: 'PUNCTUAL_PLAN',
        type: 'bit',
        transformer: { from: (v: Buffer) => v ? !!v.readInt8(0): null, to: (v) => v }
    })
    punctualPlan: boolean;

    @OneToOne(type => S3Metadata, s3Metadata => s3Metadata.evidenceFilePlan)
    // @OneToOne(type => S3Metadata, s3Metadata => s3Metadata.evidenceFilePlan, { nullable: false})
    @JoinColumn({ name: 'EVIDENCE_FILE_ID'})
    evidenceFile: S3Metadata;

    @ManyToOne(type => User, user => user.creationUserPlan)
    @JoinColumn({ name: 'CREATION_USER_ID' })
    creationUser: User;

    @Column({ name: 'CREATION_DATE' })
    creationDate: Date;

    @ManyToOne(type => User, user => user.modificationUserPlan)
    @JoinColumn({ name: 'MODIFICATION_USER_ID' })
    modificationUser: User;

    @Column({ name: 'MODIFICATION_DATE' })
    modificationDate: Date;

    @ManyToOne(type => User, user => user.approvalUserPlan)
    @JoinColumn({ name: 'APPROVAL_USER_ID' })
    approvalUser: User;

    @Column({ name: 'APPROVAL_DATE' })
    approvalDate: Date;

    @ManyToOne(type => User, user => user.acceptanceUserPlan)
    @JoinColumn({ name: 'ACCEPTANCE_USER_ID' })
    acceptanceUser: User;

    @Column({ name: 'ACCEPTANCE_DATE' })
    acceptanceDate: Date;

    @Column({ name: 'STATUS' })
    status: string;

    @OneToMany(type => EnterpriseEconomicGroup, enterpriseEconomicGroup => enterpriseEconomicGroup.financingPlan)
    economicGroup: EnterpriseEconomicGroup[];

    @OneToMany(type => FinancingPlanClientPermission, clientPermission => clientPermission.financingPlan)
    clientePermission: FinancingPlanClientPermission[];

    static getFinancingPlansByEnterpriseId(enterpriseId: number, userType:string, filter_by?: string, q?: string, page?:string, per_page?:string): Promise<[EnterpriseFinancingPlan[], number]> {
        const queryBuilder =  this.createQueryBuilder('financingPlan')
            .where('financingPlan.payer = :enterpriseId', {enterpriseId})
            .leftJoinAndSelect('financingPlan.payer', 'payer')
            .leftJoinAndSelect('financingPlan.provider', 'provider')
            .leftJoinAndSelect('financingPlan.minBaseRate', 'minBaseRate')
            .leftJoinAndSelect('financingPlan.minRatePeriodicity', 'minRatePeriodicity')
            .leftJoinAndSelect('financingPlan.negociatedBaseRate', 'negociatedBaseRate')
            .leftJoinAndSelect('financingPlan.negociatedRatePeriodicity', 'negociatedRatePeriodicity')
            .leftJoinAndSelect('financingPlan.evidenceFile', 'evidenceFile')
            .leftJoinAndSelect('financingPlan.creationUser', 'creationUser')
            .leftJoinAndSelect('financingPlan.modificationUser', 'modificationUser')
            .leftJoinAndSelect('financingPlan.approvalUser', 'approvalUser')
            .leftJoinAndSelect('financingPlan.acceptanceUser', 'acceptanceUser')
            .leftJoinAndSelect('financingPlan.clientePermission', 'clientePermission')
            .orderBy('financingPlan.creationDate', 'DESC')

            if (userType === FilterRoleUserTypeEnum.ENTERPRISE_USER && filter_by != FilterByFinancingPlans.STATUS) 
                queryBuilder.andWhere('financingPlan.status NOT IN (:...status)', { status: [ EinancingPlanStatus.PENDING_APPROVAL, EinancingPlanStatus.REJECTED_BY_LIBERA, 
                    EinancingPlanStatus.TIMED_OUT, EinancingPlanStatus.EXPIRED ]})
            
            if (userType === FilterRoleUserTypeEnum.ENTERPRISE_USER && filter_by && filter_by == FilterByFinancingPlans.STATUS && [EinancingPlanStatus.PENDING_APPROVAL, 
                    EinancingPlanStatus.REJECTED_BY_LIBERA, EinancingPlanStatus.TIMED_OUT, EinancingPlanStatus.EXPIRED].includes( q as EinancingPlanStatus )) 
                    throw new BadRequestException('SCF.LIBERA.386', { q });

            if (filter_by && filter_by == FilterByFinancingPlans.OBSERVATION && q == EFinancingObservations.ECONOMIC_GROUP) {
                queryBuilder.innerJoinAndSelect('financingPlan.economicGroup', 'economicGroup') 
            } else {
                queryBuilder.leftJoinAndSelect('financingPlan.economicGroup', 'economicGroup')
            }
            if (filter_by && filter_by == FilterByFinancingPlans.OBSERVATION && q == EFinancingObservations.SPECIAL_RATE)
                queryBuilder.andWhere('financingPlan.specialRate = :specialRate', { specialRate: true })     
            if (filter_by && filter_by == FilterByFinancingPlans.OBSERVATION && q == EFinancingObservations.AGREEMENT)
                queryBuilder.andWhere('financingPlan.agreement = :agreement', { agreement: true })
            if (filter_by && filter_by == FilterByFinancingPlans.STATUS)
                queryBuilder.andWhere('financingPlan.status LIKE :status', { status: `%${q.replace(/ /g, '')}%` })
            if (filter_by && filter_by == FilterByFinancingPlans.TYPE)
                queryBuilder.andWhere('financingPlan.type LIKE :type', { type: `%${q.replace(/ /g, '')}%` })
            if (filter_by && filter_by == FilterByFinancingPlans.PROVIDER)
                queryBuilder.andWhere('provider.enterpriseName LIKE :provider', { provider: `%${q}%` })
            if (filter_by && filter_by == FilterByFinancingPlans.DOCUMENT_NUMBER)
                queryBuilder.andWhere('provider.nit LIKE :documentNumber', { documentNumber: `%${q}%` })
            
            if (page && per_page)
                queryBuilder.skip((Number(page) - 1) * Number(per_page)).take(Number(per_page))
            
            //console.log('---> queryBuilder: ', queryBuilder.getQueryAndParameters());
        return queryBuilder.getManyAndCount();
    }

    static getFinancingPlanDetail(financingPlanId: number) {
        return this.createQueryBuilder('enterpriseFinancingPlan')
            .leftJoinAndSelect('enterpriseFinancingPlan.payer', 'payer')
            .leftJoinAndSelect('enterpriseFinancingPlan.provider', 'provider')
            .leftJoinAndSelect('enterpriseFinancingPlan.minBaseRate', 'minBaseRate')
            .leftJoinAndSelect('enterpriseFinancingPlan.minRatePeriodicity', 'minRatePeriodicity')
            .leftJoinAndSelect('enterpriseFinancingPlan.negociatedBaseRate', 'negociatedBaseRate')
            .leftJoinAndSelect('enterpriseFinancingPlan.negociatedRatePeriodicity', 'negociatedRatePeriodicity')
            .leftJoinAndSelect('enterpriseFinancingPlan.evidenceFile', 'evidenceFile')
            .leftJoinAndSelect('enterpriseFinancingPlan.creationUser', 'creationUser')
            .leftJoinAndSelect('creationUser.userProperties', 'creationUserProperties')
            .leftJoinAndSelect('enterpriseFinancingPlan.modificationUser', 'modificationUser')
            .leftJoinAndSelect('modificationUser.userProperties', 'modificationUserProperties')
            .leftJoinAndSelect('enterpriseFinancingPlan.approvalUser', 'approvalUser')
            .leftJoinAndSelect('approvalUser.userProperties', 'approvalUserProperties')
            .leftJoinAndSelect('enterpriseFinancingPlan.acceptanceUser', 'acceptanceUser')
            .leftJoinAndSelect('acceptanceUser.userProperties', 'acceptanceUserProperties')
            .leftJoinAndSelect('enterpriseFinancingPlan.economicGroup', 'economicGroup')
            .leftJoinAndSelect('economicGroup.enterprise', 'enterprise')
            .leftJoinAndSelect('enterpriseFinancingPlan.clientePermission', 'clientePermission')
            .where('enterpriseFinancingPlan.id = :financingPlanId', { financingPlanId })
            .getOne();
    }

    static getFinancingPlanstoUpdateStatus(date: string, status : FinancingPlanStatusEnum[]): Promise<EnterpriseFinancingPlan[]> {
        return this.createQueryBuilder('financingPlan')
            .leftJoinAndSelect('financingPlan.payer', 'payer')
            .where('financingPlan.validityDate <= :date', {date})
            .andWhere('financingPlan.status IN (:...status)', {status})
            .getMany();
    }

    static getFinancingPlanById(financingPlanId: number){
        return this.createQueryBuilder('enterpriseFinancingPlan')
        .leftJoinAndSelect('enterpriseFinancingPlan.payer', 'payer')
        .leftJoinAndSelect('enterpriseFinancingPlan.creationUser', 'creationUser')
        .leftJoinAndSelect('enterpriseFinancingPlan.provider', 'provider')
        .where('enterpriseFinancingPlan.id = :financingPlanId', { financingPlanId })
        .getOne();
    }

    static getFinancingPlanByPayerId(id: number){
        return this.createQueryBuilder('enterpriseFinancingPlan')
        .where('enterpriseFinancingPlan.payer = :id', { id })
        .getMany();
    }
}