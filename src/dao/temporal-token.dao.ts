import { getConnection } from "commons/connection";
import { TemporalTokens } from "entities/temporal-tokens";

export class TemporalTokensDAO {

    static async getByTokenAndEnterpriseId(token: string, enterpriseId: number) {
        console.log('DAO: Starting getByTokenAndEnterpriseId method');
        await getConnection();

        const tempToken = await TemporalTokens.getByTokenAndEnterpriseId(token, enterpriseId);
        console.log('DAO: Ending getByTokenAndEnterpriseId method');
        return tempToken;
    }

    static async getTemporalTokenByTokenAndEnterpriseId(token: string, enterpriseId: number) {
        console.log('DAO: Starting getTemporalTokenByTokenAndEnterpriseId');
        await getConnection();
        const temporalToken = await TemporalTokens.getByTokenAndEnterpriseId(token, enterpriseId);
        console.log('DAO: Ending getTemporalTokenByTokenAndEnterpriseId');
        return temporalToken;
    }

    static async getTemporalTokenByRequestId(requestId: number) {
        console.log('DAO: Starting getTemporalTokenByRequestId');
        await getConnection();
        const temporalToken = await TemporalTokens.getTemporalTokenByRequestId(requestId);
        console.log('DAO: Ending getTemporalTokenByRequestId');
        return temporalToken;
    }

    static async saveTemporalToken(temporalToken: TemporalTokens) {
        console.log('DAO: Starting saveTemporalToken');
        await getConnection();
        await TemporalTokens.save(temporalToken);
        console.log('DAO: Ending saveTemporalToken');
    }
}