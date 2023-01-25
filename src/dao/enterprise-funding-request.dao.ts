import { getConnection } from "commons/connection";
import { EnterpriseFundingRequest } from "entities/enterprise-funding-request";


export class EnterpriseFundingRequestDAO {
    static async getFundingRequestById(requestId: number, enterpriseId: number) {
        console.log('DAO: Starting getFundingRequestById');
        await getConnection();
        const request = await EnterpriseFundingRequest.getFundingRequestById(requestId, enterpriseId);
        console.log('DAO: Ending getFundingRequestById');
        return request;
    }
}