import moment = require('moment');
import { BaseEntity, Entity, Column, JoinColumn, ManyToOne } from 'typeorm';
import { User } from './user';
import { Enterprise } from './enterprise';
import { EnterpriseFinancingPlan } from './enterprise-financing-plan';

@Entity({ name: 'ENTERPRISE_ECONOMIC_GROUP' })
export class EnterpriseEconomicGroup extends BaseEntity {

    @ManyToOne(type => EnterpriseFinancingPlan, financingPlan => financingPlan.economicGroup, {primary: true})
    @JoinColumn({ name: 'FINANCING_PLAN_ID' })
    financingPlan: EnterpriseFinancingPlan;
    
    @ManyToOne(type => Enterprise, enterprise => enterprise.economicGroups, {primary: true})
    @JoinColumn({ name: 'ENTERPRISE_ID' })
    enterprise: Enterprise;

    @Column({ name: 'SALES' })
    sales: number;
    
    @Column({ name: 'SALES_CUT' })
    salesCut: Date;

    @ManyToOne(type => User, user => user.creationUserEconGroup)
    @JoinColumn({ name: 'CREATION_USER_ID' })
    creationUser: User;

    @Column({ name: 'CREATION_DATE' })
    creationDate: Date;

    static getEconomicGroupsByFinancingPlan(financingPlan): Promise<EnterpriseEconomicGroup[]>{
        const queryB = this.createQueryBuilder('economicGroup')
            .where('economicGroup.financingPlan = :financingPlan', {financingPlan})
            .leftJoinAndSelect('economicGroup.financingPlan', 'financingPlan')
            .leftJoinAndSelect('economicGroup.enterprise', 'enterprise')
        return queryB.getMany();
    }

}