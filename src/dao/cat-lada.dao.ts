import { getConnection } from "commons/connection";
import { CatLada } from "entities/cat-lada";


export class CatLadaDAO {
    static async getLadaById(ladaId: number) {
        console.log('DAO: Starting getLadaById');
        await getConnection();
        const lada = await CatLada.getLadaById(ladaId)
        console.log('DAO: Ending getLadaById');
        return lada;
    }

    static async getLadaByLada(lada: number) {
        console.log('DAO: Starting getLadaByLada');
        await getConnection();
        const catLada = await CatLada.getLadaByLada(lada);
        console.log('DAO Ending getLadaByLada');
        return catLada;
    }
}