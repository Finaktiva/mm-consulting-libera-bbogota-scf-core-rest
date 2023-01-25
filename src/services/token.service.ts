import { EnterpriseDAO } from "dao/enterprise.dao";
import { EnterpriseStatusEnum } from "commons/enums/enterprise-status.enum";
import { ConflictException } from "commons/exceptions";
import { TemporalTokensDAO } from "dao/temporal-token.dao";
import LiberaUtils from "commons/libera.utils";


export class TemporalTokenService {

    static async verification(enterpriseId: number, token: string) {
        console.log('SERVICE: Starting verification');

        const enterprise = await EnterpriseDAO.getBasicEnterpriseById(enterpriseId);
        if(!enterprise || enterprise && enterprise.status === EnterpriseStatusEnum.DELETED)
            throw new ConflictException('SCF.LIBERA.19', {enterpriseId});
        
        const temporalToken = await TemporalTokensDAO
            .getTemporalTokenByTokenAndEnterpriseId(token, enterpriseId);
        
        if(LiberaUtils.confirmExpirationDate(temporalToken.expirationDate))
            throw new ConflictException('SCF.LIBERA.102');

        const enterpriseName = temporalToken.enterpriseRequest.enterprise.enterpriseName;
        console.log('SERVICE: Ending verification');
        return {
            status: temporalToken.status,
            enterpriseRequesterName: enterpriseName
        };
    }
}