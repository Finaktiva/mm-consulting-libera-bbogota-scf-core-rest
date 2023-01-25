import { getConnection } from "commons/connection";
import { EnterpriseEconomicGroup } from "entities/enterprise-economic-group";


export class EconomicGroupDAO {

    static async saveEnterpriseEconomicGroup(economicGroup: EnterpriseEconomicGroup): Promise<EnterpriseEconomicGroup> {
        console.log('DAO: Starting saveEnterpriseEconomicGroup');
        await getConnection();
        const newEconomicGroup: EnterpriseEconomicGroup = await EnterpriseEconomicGroup.save(economicGroup);
        console.log('DAO: Ending saveEnterpriseEconomicGroup');
        return newEconomicGroup;
    }
    
    static async getEconomicGroupsByFinancingPlan(planId: number): Promise<EnterpriseEconomicGroup[]> {
        console.log('DAO: Starting getEconomicGroupsByFinancingPlan');
        await getConnection();
        const newEconomicGroups: EnterpriseEconomicGroup[] = await EnterpriseEconomicGroup.getEconomicGroupsByFinancingPlan(planId);
        console.log('DAO: Ending getEconomicGroupsByFinancingPlan');
        return newEconomicGroups;
    }

}