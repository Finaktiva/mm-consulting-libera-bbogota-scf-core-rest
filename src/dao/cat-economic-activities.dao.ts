import { CatEconomicActivity } from 'entities/cat-ciiu-economic-activity'
import { getConnection } from 'commons/connection';

export class EconomicActivitiesDAO {

    static async getActivityByCiiu(ciiuCode: string){
        console.log('DAO: Starting getActivities');
        await getConnection();
        const documentTypes = await CatEconomicActivity.getActivityByCiiu(ciiuCode);
        console.log('DAO: Ending getActivities');
        return documentTypes;
    }
}