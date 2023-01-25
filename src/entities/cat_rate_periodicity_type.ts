import { Entity,Column, BaseEntity, PrimaryColumn, ManyToOne, JoinColumn, OneToMany, ManyToMany} from 'typeorm';
import { EnterpriseFinancingPlan } from './enterprise-financing-plan';
import { RelBaseRatePeriodicity } from './rel_base_rate_periodicity';

@Entity({name: 'CAT_RATE_PERIODICITY_TYPE'})
export class CatRatePeriodicityType extends BaseEntity {
    @PrimaryColumn({
        name: 'CODE',
        type: 'varchar'
    })
    code: string;

    @Column({
        name: 'DESCRIPTION',
        type: 'varchar'
    })
    description: string;

    @OneToMany(type => RelBaseRatePeriodicity, relBaseRatePeriodicity => relBaseRatePeriodicity.basePeriodicityType)
    relRatePeriodicity: RelBaseRatePeriodicity[];

    @OneToMany(type => EnterpriseFinancingPlan, enterpriseFinancingPlan => enterpriseFinancingPlan.minRatePeriodicity)
    minBasePeriodicityPlans: EnterpriseFinancingPlan[];

    @OneToMany(type => EnterpriseFinancingPlan, enterpriseFinancingPlan => enterpriseFinancingPlan.negociatedRatePeriodicity)
    negociatedRatePeriodicityPlans: EnterpriseFinancingPlan[];

}