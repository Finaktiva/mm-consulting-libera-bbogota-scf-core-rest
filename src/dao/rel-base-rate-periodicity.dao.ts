import { getConnection } from 'commons/connection';
import { RelBaseRatePeriodicity } from 'entities/rel_base_rate_periodicity';

export class RelRatePeriodicityDAO {

    static async getAllRatePeriodicityRelations(): Promise<RelBaseRatePeriodicity[]>{
        console.log('DAO: Starting getAllRatePeriodicityRelations');
        await getConnection();
        const result:RelBaseRatePeriodicity[]  = await RelBaseRatePeriodicity.getAllRatePeriodicityRelations();
        console.log('DAO: Ending getAllRatePeriodicityRelations');
        return result;
    }

    static async getRateAndPeriodicityRelation(rate: string, periodicity: string): Promise<RelBaseRatePeriodicity>{
        console.log('DAO: Starting getRateAndPeriodicityRelation');
        await getConnection();
        const result:RelBaseRatePeriodicity  = await RelBaseRatePeriodicity.getRateAndPeriodicityRelation(rate, periodicity);
        console.log('DAO: Ending getRateAndPeriodicityRelation');
        return result;
    }
}