import { Entity,Column, BaseEntity, PrimaryColumn, ManyToOne, JoinColumn, OneToMany, ManyToMany} from 'typeorm';
import { EnterpriseFinancingPlan } from './enterprise-financing-plan';
import { RelBaseRatePeriodicity } from './rel_base_rate_periodicity';

@Entity({name: 'CAT_BASE_RATE_TYPE'})
export class CatBaseRateType extends BaseEntity {
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

    @OneToMany(type => RelBaseRatePeriodicity, relBaseRatePeriodicity => relBaseRatePeriodicity.baseRateType)
    relRatePeriodicity: RelBaseRatePeriodicity[];

    @OneToMany(type => EnterpriseFinancingPlan, EnterpriseFinancingPlan => EnterpriseFinancingPlan.minBaseRate)
    minBaseRatePlans: EnterpriseFinancingPlan[];

    @OneToMany(type => EnterpriseFinancingPlan, EnterpriseFinancingPlan => EnterpriseFinancingPlan.negociatedBaseRate)
    negociatedBaseRatePlans: EnterpriseFinancingPlan[];

}