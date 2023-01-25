import { RelUserBankRegion } from 'entities/rel-user-bank-region';
import { getConnection } from 'commons/connection';


export class RelUserBankRegionDAO {

    static async save(relUserBankRegion : RelUserBankRegion): Promise<RelUserBankRegion> {
        console.log('DAO: Starting saveRelUserBankRegion');
        await getConnection();
        const RelUserBankRegionDB = await RelUserBankRegion.save(relUserBankRegion);
        console.log('DAO: Ending saveRelUserBankRegion');
        return RelUserBankRegionDB;
    }

    static async deleteByUserId(id: number): Promise<void> {
        console.log('DAO: Starting deleteByUserId');
        await getConnection();
        await RelUserBankRegion.deleteByUserId(id);
        console.log('DAO: Ending deleteByUserId');
    }

    static async getRelUserBankRegionByBankRegionId(id: number): Promise<RelUserBankRegion[]> {
        console.log('DAO: Starting getRelUserBankRegionByBankRegionId');
        await getConnection();
        const RelUserBankRegions = await RelUserBankRegion.getRelUserBankRegionByBankRegionId(id);
        console.log('DAO: Ending getRelUserBankRegionByBankRegionId');
        return RelUserBankRegions;
    }

}