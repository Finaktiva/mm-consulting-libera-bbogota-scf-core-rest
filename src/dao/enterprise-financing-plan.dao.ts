import { getConnection } from "commons/connection";
import { FinancingPlanStatusEnum } from "commons/enums/financing-plan-status-actions.enum";
import { FilterFinancingPlans } from "commons/filter";
import { EnterpriseFinancingPlan } from "entities/enterprise-financing-plan";


export class FinancingPlanDAO {

    static async getFinancingPlansByEnterpriseId(enterpriseId: number, userType: string, filter_by?: string, q?: string, page?: string, per_page?: string): Promise<[EnterpriseFinancingPlan[], number]> {
        console.log('DAO: Starting getFinancingPlansByEnterpriseId');
        await getConnection();
        const financingPlans: [EnterpriseFinancingPlan[], number] = await EnterpriseFinancingPlan.getFinancingPlansByEnterpriseId(enterpriseId, userType, filter_by, q, page, per_page);
        console.log('DAO: Ending getFinancingPlansByEnterpriseId');
        return financingPlans;
    }

    static async createFinancingPlan(enterprisePlan: EnterpriseFinancingPlan): Promise<EnterpriseFinancingPlan> {
        console.log('DAO: Starting createFinancingPlan');
        await getConnection();
        const financingPlan = await EnterpriseFinancingPlan.save(enterprisePlan);
        console.log('DAO: Ending createFinancingPlan');
        return financingPlan;
    }

    static async getFinancingPlanDetail(financingPlanId: number) {
        console.log('DAO: Starting getFinancingPlanDetail');
        await getConnection();
        const financingPlanDetail = await EnterpriseFinancingPlan.getFinancingPlanDetail(financingPlanId);
        console.log('DAO: Ending getFinancingPlanDetail');
        return financingPlanDetail;
    }

    static async getFinancingPlanstoUpdateStatus(date: string, status : FinancingPlanStatusEnum[]): Promise<EnterpriseFinancingPlan[]> {
        console.log('DAO: Starting getFinancingPlanstoUpdateStatus');
        await getConnection();
        const financingPlans = await EnterpriseFinancingPlan.getFinancingPlanstoUpdateStatus(date, status);
        console.log('DAO: Ending getFinancingPlanstoUpdateStatus');
        return financingPlans;
    }

    static async getFinancingPlanById(financingPlanId: number) {
        console.log('DAO: Starting getFinancingPlanById');
        await getConnection();
        const financingPlan = await EnterpriseFinancingPlan.getFinancingPlanById(financingPlanId);
        console.log('DAO: Ending getFinancingPlanById');
        return financingPlan;
    }

    static async saveFinancingPlan(financingPlan: EnterpriseFinancingPlan) {
        console.log('DAO: Starting saveFinancingPlan');
        await getConnection();
        await EnterpriseFinancingPlan.save(financingPlan);
        console.log('DAO: Ending saveFinancingPlan');
    }

    static async getFinancingPlanByPayerId(id:number){
        console.log('DAO: Starting getFinancingPlanByPayerId');
        await getConnection();
        const financingPlans = await EnterpriseFinancingPlan.getFinancingPlanByPayerId(id);
        console.log('DAO: Ending getFinancingPlanByPayerId');
        return financingPlans;
    }
}