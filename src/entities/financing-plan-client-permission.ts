import { BaseEntity, Entity, Column, JoinColumn, ManyToOne } from 'typeorm';
import { EnterpriseFinancingPlan } from './enterprise-financing-plan';

@Entity({ name: 'FINANCING_PLAN_CLIENT_PERMISSION' })
export class FinancingPlanClientPermission extends BaseEntity {

    @ManyToOne(type => EnterpriseFinancingPlan, financingPlan => financingPlan.clientePermission, {primary: true})
    @JoinColumn({ name: 'FINANCING_PLAN_ID' })
    financingPlan: EnterpriseFinancingPlan;
    
    @Column({ name: 'PERMISSION', primary: true})
    permission: string;
    
}