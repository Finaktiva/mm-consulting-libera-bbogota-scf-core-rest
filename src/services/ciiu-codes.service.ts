import { CodesCiiu } from 'entities/codes-ciiu';
import { CatEconomicActivity } from 'entities/cat-ciiu-economic-activity'
import { CiiuCodesDAO } from 'dao/ciiu-codes.dao';
import { NotFoundException } from 'commons/exceptions';

export class CiiuCodesService {
  static async getCiiuCodesRequest(codeCiiu: string) {
    console.log('SERVICE: Starting getCodeCiiuRequest method');
    const codeCiiuRequest: CatEconomicActivity = await CiiuCodesDAO.getCiiuCodeRequest(codeCiiu);
    if (!codeCiiuRequest) throw new NotFoundException('SCF.LIBERA.COMMON.404');

    console.log('SERVICE: Ending getCodeCiiuRequest method');
    return codeCiiuRequest;
  }
}