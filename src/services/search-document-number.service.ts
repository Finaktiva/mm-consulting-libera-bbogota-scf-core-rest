import { CatModuleEnum } from "commons/enums/cat-module.enum";
import { EnterpriseLinkTypeEnum } from "commons/enums/enterprise-link-type.enum";
import { UserTypeEnum } from "commons/enums/user-type.enum";
import { NotFoundException } from "commons/exceptions";
import EnterprisesParser from "commons/parsers/enterprises.parser";
import { EnterpriseLinksDisbursementContractDAO } from "dao/enterprise-links-disbursement-contract.dao";
import { EnterpriseDAO } from "dao/enterprise.dao";
import { Enterprise } from "entities/enterprise";
import { EnterpriseLinksDisbursementContract } from "entities/enterprise-links-disbursement-contract";
import { User } from "entities/user";
import { EnterpriseService } from "./enterprise.service";

export class DocumentNumberService {
  static async getDocumentNumberRequest(documentnumber: string, type: string, module?: string, product?: string, userLoggedId?: number, fullData?: boolean) {
    try {
      console.log('SERVICE: Starting getDocumentNumberRequest method');

      const documentNumberRequest: Enterprise = await EnterpriseDAO.getDocumentNumberRequest(documentnumber, type, module, product);
      if (!documentNumberRequest) throw new NotFoundException('SCF.LIBERA.COMMON.404');

      let searchEnterprise = await EnterpriseService.getEnterpriseById(+documentNumberRequest.id, null, fullData);

      let finalResponse = EnterprisesParser.parseGetEnterpriseDocument(searchEnterprise);
      console.log('=== finalResponse ===', finalResponse);
      
      const userType = await User.getMeById(userLoggedId);
      console.log('==== userType ====', userType);

      if(userLoggedId != undefined && module == CatModuleEnum.PROVIDER && userType.type === UserTypeEnum.ENTERPRISE_USER){
        const payer: Enterprise = await EnterpriseService.getByOwnerId(userLoggedId);
        
        const disbursementContract: EnterpriseLinksDisbursementContract = 
            await EnterpriseLinksDisbursementContractDAO.getByRequestLinkKeys(
              payer.id, searchEnterprise.id, EnterpriseLinkTypeEnum.PROVIDER);
        
        console.log('=== disbursementContract ===', disbursementContract);
        if(disbursementContract){
          let disbursementContractResponse = {
            type: disbursementContract.type,
            bankCertificationFilename: disbursementContract.bankCertificationFile ? disbursementContract.bankCertificationFile.filename : null,
            account: {
              type: disbursementContract.accountType,
              number: disbursementContract.accountNumber,
              bank: disbursementContract.bank ? {
                code: disbursementContract.bank.code
              } : null
            }
          };

          finalResponse.disbursementContract = disbursementContractResponse;
        }
      }

      console.log('SERVICE: Ending getDocumentNumberRequest method');
      return finalResponse;
      
    } catch (error) {
      throw new NotFoundException('SCF.LIBERA.COMMON.404');
    }
    
  }
}