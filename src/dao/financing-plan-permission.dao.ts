import { getConnection } from "commons/connection";
import { FinancingPlanClientPermission } from "entities/financing-plan-client-permission";


export class FinancingPlanPermissionDAO {

    static async saveFinancingPlanPermission(planPermission: FinancingPlanClientPermission): Promise<FinancingPlanClientPermission> {
        console.log('DAO: Starting saveFinancingPlanPermission');
        await getConnection();
        const financingPermission: FinancingPlanClientPermission = await FinancingPlanClientPermission.save(planPermission);
        console.log('DAO: Ending saveFinancingPlanPermission');
        return financingPermission;
    }

}