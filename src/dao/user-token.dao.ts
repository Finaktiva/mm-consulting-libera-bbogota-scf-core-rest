import { getConnection } from "commons/connection";
import { CatTokenType } from "entities/cat-token-type";


export class UserTokenDAO {
    static async getTokenType(type: string){
        console.log('DAO: Starting getTokenType');
        await getConnection();
        const tokenType = await CatTokenType.getType(type);
        console.log('DAO: Ending getTokenType');
        return tokenType;
    }
}