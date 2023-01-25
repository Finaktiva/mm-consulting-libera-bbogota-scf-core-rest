import { FinancingPlanStatusEnum } from 'commons/enums/financing-plan-status-actions.enum';
import { FinancingPlanDAO } from 'dao/enterprise-financing-plan.dao';
import { EnterpriseDAO } from 'dao/enterprise.dao';
import { Enterprise } from 'entities/enterprise';

export class EnterpriseUtils {

    static async updateFinancialConditions(enterpriseId: number){

        const financingPlans = await FinancingPlanDAO.getFinancingPlanByPayerId(enterpriseId);
        const enterprise = await EnterpriseDAO.getEnterpriseById(enterpriseId);

        if(!financingPlans.length){
            enterprise.financialConditions = null;
            await EnterpriseDAO.updateFinancialConditionsById(null, enterpriseId);
        }else{
            const financingPlanStatus = [FinancingPlanStatusEnum.EXPIRED, FinancingPlanStatusEnum.ABOUT_TO_EXPIRE,  FinancingPlanStatusEnum.PENDING_ACCEPTANCE, FinancingPlanStatusEnum.PENDING_APPROVAL, FinancingPlanStatusEnum.CURRENT];
            
            let status = null;            
            financingPlans.forEach(financingPlan => {
                if(financingPlanStatus.includes(FinancingPlanStatusEnum[financingPlan.status]) &&  (financingPlanStatus.indexOf(FinancingPlanStatusEnum[financingPlan.status]) < financingPlanStatus.indexOf(status) || status === null) )
                    status = financingPlan.status;
            });

            enterprise.financialConditions = status;
            await EnterpriseDAO.updateFinancialConditionsById(status, enterpriseId);
        }
    }
}