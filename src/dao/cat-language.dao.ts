import { getConnection } from "commons/connection";
import { CatLanguage } from "entities/cat-language";


export class CatLanguageDAO {

    static async getLanguageByCode(code: string) {
        console.log('DAO: Starting getLanguageByCode');
        await getConnection();
        const language = await CatLanguage.getLanguageByCode(code);
        console.log('DAO: Ending getLanguageByCode');
        return language;
    }

}