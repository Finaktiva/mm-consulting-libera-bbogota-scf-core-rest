import { EnterpriseRequest } from 'entities/enterprise-request';
import { getConnection } from 'commons/connection';
import { FilterEnterpriseRequests } from 'commons/filter';
import { Connection } from 'typeorm';
import { Enterprise } from 'entities/enterprise';
import { EnterpriseRequestStatus } from 'commons/enums/enterprise-request-status.enum';
import { EnterpriseLinks } from 'entities/enterprise-links';
import { TemporalTokens } from 'entities/temporal-tokens';
import { EnterpriseLinksDisbursementContract } from 'entities/enterprise-links-disbursement-contract';

export class EnterpriseRequestDAO {
    
    static async getEnterpriseRequestByEnterpriseId(enterpriseId: number) {
        console.log('DAO: Starting getEnterpriseRequestByEnterpriseId...');
        await getConnection();
        const enterpriseRequest =  await EnterpriseRequest.getOneByEnterpriseId(enterpriseId);
        console.log('DAO: Ending getEnterpriseRequestByEnterpriseId...');
        return enterpriseRequest;
    }

    static async getEnterpriseRequest(enterpriseId: number){
        console.log('DAO: Starting getEnterpriseRequest');
        await getConnection();
        const enterprisesRequest = await EnterpriseRequest.getByEnterpriseId(enterpriseId);
        console.log('DAO: Ending getEnterpriseRequest');
        return enterprisesRequest;
    }

    static async saveEnterpriseRequest(enterpriseRequest: EnterpriseRequest): Promise<EnterpriseRequest> {
        console.log('DAO: Starting saveEnterpriseRequest');
        await getConnection();
        const createdEnterpriseRequest = await enterpriseRequest.save();
        console.log('DAO: Ending saveEnterpriseRequest');
        return createdEnterpriseRequest;
    }

    static async updateEnterpriseRequestAndEnterpriseLink(enterpriseRequest: EnterpriseRequest){
        console.log('DAO: Starting updateEnterpriseRequestAndEnterpriseLink');
        const connection:Connection = await getConnection();
        await connection.getRepository(EnterpriseRequest).update(enterpriseRequest.id, enterpriseRequest);
        if(enterpriseRequest.enterpriseLink){
            await connection.getRepository(EnterpriseLinks).update(enterpriseRequest.enterpriseLink.id, enterpriseRequest.enterpriseLink);
            await Enterprise.updateStatus(enterpriseRequest.enterpriseLink.enterpriseLink.id, enterpriseRequest.enterpriseLink.enterpriseLink.status);
        }
        console.log('DAO: Ending updateEnterpriseRequestAndEnterpriseLink');
    }
    
    static async updateEnterpriseRequest(enterpriseRequest: EnterpriseRequest): Promise<void> {
        console.log('DAO: Starting updateEnterpriseRequest');
        const connection: Connection = await getConnection();
        await connection.getRepository(EnterpriseRequest).update(enterpriseRequest.id, enterpriseRequest);
        console.log('DAO: Ending updateEnterpriseRequest');
    }

    static async getEnterpriseRequests(filter: FilterEnterpriseRequests) {
        console.log('DAO: Starting getEnterpriseRequests...');
        await getConnection();
        const requests = await EnterpriseRequest.getEnterpriseRequests(filter);
        console.log(JSON.stringify(requests));
        
        console.log('DAO: Ending getEnterpriseRequests...');
        return requests;
    }

    static async getBasicEnterpriseRequest(requestId:number){
        console.log('DAO: Starting getBasicEnterpriseRequest');
        await getConnection();
        const enterpriseRequest = await EnterpriseRequest.getBasicEnterpriseRequest(requestId);
        console.log('DAO: Ending getBasicEnterpriseRequest');
        return enterpriseRequest;
    }

    static async getRequest(enterpriseId:number){
        console.log('DAO: Starting getRequest');
        await getConnection();
        const enterpriseRequest = await EnterpriseRequest.getByEnterpriseId(enterpriseId);
        console.log('DAO: Ending getRequest');
        return enterpriseRequest;
    }

    static async getRequestBasic(enterpriseId:number){
        console.log('DAO: Starting getRequestBasic');
        await getConnection();
        const enterpriseRequest = await EnterpriseRequest.getOneByEnterpriseId(enterpriseId);
        console.log('DAO: Ending getRequestBasic');
        return enterpriseRequest;
    }

    static async saveRequestBasic(enterpriseRequest: EnterpriseRequest){
        console.log('DAO: Starting saveRequestBasic');
        await getConnection();
        console.log('imprimiendo enterprise request', enterpriseRequest);
        await EnterpriseRequest.save(enterpriseRequest);
        console.log('DAO: Ending saveRequestBasic');
    }

    static async rollbackEnterpriseRequest(enterpriseRequest: EnterpriseRequest, temporalToken: TemporalTokens, enterpriseLink: EnterpriseLinks) {
        console.log('DAO: Starting rollbackEnterpriseRequest');
        await EnterpriseRequest.save(enterpriseRequest);
        await TemporalTokens.save(temporalToken);
        await EnterpriseLinks.save(enterpriseLink);
        console.log('DAO: Ending rollbackEnterpriseRequest');
    }

    static async getRequestByEnterpriseIdAndLinkedId(enterpriseId: number, providerId: number) {
        console.log('DAO: Starting getRequestByEnterpriseIdAndLinkedId');
        await getConnection();
        const link = EnterpriseLinks.getByEnterpriseAndLinkId(enterpriseId, providerId);
        console.log('DAO: Ending getRequestByEnterpriseIdAndLinkedId');
        return link;
    }

    static async getRequestForChanges(requestId: number) {
        console.log('DAO: Starting getRequestForChanges');
        await getConnection();
        const request = await EnterpriseRequest.getRequestForChanges(requestId);
        console.log('DAO: Ending getRequestForChanges');
        return request;
    }

    static async getEnterpriseRequestForRecodByEnterpriseId(enterpriseId: number, status: EnterpriseRequestStatus) {
        console.log('DAO: Starting getEnterpriseRequestForRecodByEnterpriseId...');
        await getConnection();
        const enterpriseRequest =  await EnterpriseRequest.getEnterpriseRequestForRecodByEnterpriseId(enterpriseId, status);
        console.log('DAO: Ending getEnterpriseRequestForRecodByEnterpriseId...');
        return enterpriseRequest;
    }

    static async getEnterpriseDisbursementContract(Id:number){
        console.log('DAO: Starting getEnterpriseDisbursementContract');
        await getConnection();
        const enterpriseRequest = await EnterpriseLinksDisbursementContract.getById(Id)
        console.log('DAO: Ending getEnterpriseDisbursementContract');
        return enterpriseRequest;
    }
    
    static async getDisbursementContractByEnterpriseIdAndProviderId(enterpriseId:number, providerId: number){
        console.log('DAO: Starting getDisbursementContractByEnterpriseIdAndProviderId');
        await getConnection();
        const enterpriseRequest = await EnterpriseLinksDisbursementContract.getByEnterpriseIdAndProviderId(enterpriseId, providerId)
        console.log('DAO: Ending getDisbursementContractByEnterpriseIdAndProviderId');
        return enterpriseRequest;
    }

}
