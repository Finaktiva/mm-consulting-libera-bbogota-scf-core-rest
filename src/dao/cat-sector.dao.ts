import { getConnection } from "commons/connection";
import { CatSector } from "entities/cat-sector";


export class CatSectorDAO {

    static async getSectorByEnterpriseId(enterpriseId: number) {
        console.log('DAO: Starting getSectorByEnterpriseId');
        await getConnection();
        const sector = await CatSector.getSectorByEnterpriseId(enterpriseId);
        console.log('DAO: Ending getSectorByEnterpriseId');
        return sector;
    }

    static async saveSector(sector: CatSector){
        console.log('DAO: Starting saveSector');
        await getConnection();
        const save = await CatSector.save(sector);
        console.log('DAO: Ending saveSector');
    }

    static async getSectorById(sectorId: number) {
        console.log('DAO: Starting getSectorById');
        await getConnection();
        const sector = await CatSector.getSectorById(sectorId);
        console.log('DAO: Ending getSectorById');
        return sector;
    }
}