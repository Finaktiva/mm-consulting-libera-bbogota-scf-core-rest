import { getConnection } from 'commons/connection';
import { CatEconomicActivity } from 'entities/cat-ciiu-economic-activity';

export class CiiuCodesDAO{
    static async getCiiuCodeRequest(codeCiiu: string): Promise<CatEconomicActivity> {
        console.log('DAO: Starting getCiiuCodeRequest');
        await getConnection();
        const result = await CatEconomicActivity.getActivityByCiiu(codeCiiu);
        console.log('DAO: Ending getCiiuCodeRequest');
        return result;
    }
}