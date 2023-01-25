import { getConnection } from 'commons/connection';
import { BasicFilter, QuotaRequestFilterBy, EnterpriseQuotaRequestFilterBy, EnterpriseQuotaRequestOrderBy  } from 'commons/filter';
import { EnterpriseQuotaRequest } from 'entities/enterprise-quota-request';

export class EnterpriseQuotaRequestDAO {

    static async getQuotaRequests(enterpriseId: number, filter: BasicFilter<QuotaRequestFilterBy, string>) {
        console.log('DAO: Starting getQuotaRequests method');
        await getConnection();
        const result = await EnterpriseQuotaRequest.getQuotaRequests(enterpriseId, filter);
        console.log('result', result);
        console.log('DAO: Ending getQuotaRequests method');
        return result;
    }

    static async getLenderQuotaRequests(lenderId: number, filter: BasicFilter<QuotaRequestFilterBy,string>) {
        console.log('DAO: Starting getLenderQuotaRequests method');
        await getConnection();
        const result = await EnterpriseQuotaRequest.getLenderQuotaRequests(lenderId, filter);
        console.log('result', result);
        console.log('DAO: Ending getLenderQuotaRequests method');
        return result;
    }
    
    static async getById(quotaRequestId: number) {
        console.log('DAO: Starting getById method');
        await getConnection();
        const quotaRequest = await EnterpriseQuotaRequest.getById(quotaRequestId);
        console.log('DAO: Ending getById method');
        return quotaRequest;
    }

    static async update(quotaRequest: EnterpriseQuotaRequest) {
        console.log('DAO: Starting update method');
        await getConnection();
        await EnterpriseQuotaRequest.update({ id: quotaRequest.id }, quotaRequest);
        console.log('DAO: Ending update method');
    }


    static async saveQuotaRequest(quotaRequest: EnterpriseQuotaRequest): Promise<EnterpriseQuotaRequest> {
        console.log('DAO: Starting saveQuotaRequest');
        await getConnection();
        const createdQuotaRequest = await quotaRequest.save();
        console.log('DAO: Ending saveQuotaRequest');
        return createdQuotaRequest;
    }

    static async rollbackCreateQuotaReques(quotaRequestId:number) {
        console.log ('DAO: Starting rollbackCreateQuotaReques...');
        await getConnection();
        await EnterpriseQuotaRequest.removeQuotaRequest(quotaRequestId);
        console.log('DAO: Ending rollbackCreateQuotaReques');
    }

    static async getQuotaRequestExist(enterpriseId: number, lenderId: number) {
        console.log ('DAO: starting getQuotaRequestExist...');
        await getConnection();
        const quotaExist = await EnterpriseQuotaRequest.getQuotaRequestExist(enterpriseId, lenderId);
        console.log('DAO: Ending getQuotaRequestExist');
        return quotaExist;
    }

    static async createEntepriseQuotaRequest(quotaRequest: EnterpriseQuotaRequest) {
        console.log('DAO: Starting createEntepriseQuotaRequest method...');
        await getConnection();
        const createdQuotaRequest = await quotaRequest.save();
        console.log('DAO: Ending createEntepriseQuotaRequest method...');
        return createdQuotaRequest;
    }



    static async getByLenderId(lenderId: number, requestId:number){
        console.log('DAO: Starting getByLenderId');
        await getConnection();
        const enterpriseQuotaRequest = await EnterpriseQuotaRequest.getByLenderId(lenderId, requestId);
        console.log('EnterpriseQuotaRequest', enterpriseQuotaRequest);
        console.log('DAO: Ending getByLenderId');
        return enterpriseQuotaRequest;
    }
}