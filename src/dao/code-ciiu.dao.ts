import { getConnection } from 'commons/connection';
import { CodesCiiu } from 'entities/codes-ciiu';


export class CodeCiiuDAO{
    static async getCodeCiiuRequest(codeCiiu: string): Promise<CodesCiiu> {
        console.log('DAO: Starting getCodeCiiuRequest');
        await getConnection();
        const result = await CodesCiiu.getByCiiu(codeCiiu);
        console.log('DAO: Ending getCodeCiiuRequest');
        return result;
    }
}