import { CodesCiiu } from 'entities/codes-ciiu';
import { CodeCiiuDAO } from 'dao/code-ciiu.dao';



export class CodeCiiuService {
    static async getCodeCiiuRequest(codeCiiu: string) {
        console.log('SERVICE: Starting getCodeCiiuRequest method');
        const codeCiiuRequest: CodesCiiu = await CodeCiiuDAO.getCodeCiiuRequest(codeCiiu);
        const codeCiiuResult = {
            id: codeCiiuRequest.CIIU,
            actividadEconomica: codeCiiuRequest.ACTIVIDAD_ECONOMICA,
            sectorEconomico: codeCiiuRequest.SECTOR_ECONOMICO
        }
        console.log('SERVICE: Ending getCodeCiiuRequest method');
        return codeCiiuResult;
    }
}
