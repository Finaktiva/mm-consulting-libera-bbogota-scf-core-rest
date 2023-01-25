import { FilterEnterprises } from 'commons/filter';
import { getConnection } from 'commons/connection';
import { EnterpriseLinks } from 'entities/enterprise-links';
import { EnterpriseRequest } from 'entities/enterprise-request';
import { EnterpriseLinkTypeEnum } from 'commons/enums/enterprise-link-type.enum';

export class EnterpriseLinkDAO {

    static async getProviders(filter: FilterEnterprises, enterpriseId: number){
        console.log('DAO: Starting getProviders');
        await getConnection();
        const providers =  await EnterpriseLinks.getProviders(filter, enterpriseId);
        console.log('DAO: Ending getProviders');
        return providers;
    }

    static async save(enterprisesLinks: EnterpriseLinks) {
        console.log('DAO: Starting save');
        await getConnection();
        const result = enterprisesLinks.save();
        console.log('DAO: Ending save');
        return result;
    }

    static async getProvidersByEnterpriseId(enterpriseId: number){
        console.log('DAO: Starting getPoviderById');
        await getConnection();
        const providers =  await EnterpriseLinks.getProvidersByEnterpriseId(enterpriseId);
        console.log('DAO: Ending getPoviderById');
        return providers;
    }

    static async rollbackCreateLinkRequest(linkId:number, requestId:number) {
        console.log ('DAO: starting rollbackCreateLinkRequest...');
        await getConnection();
        await EnterpriseRequest.removeRequest(requestId);
        console.log('deleteRquest >>>>>');    
        await EnterpriseLinks.removeLink(linkId);
        console.log('deleteLink');
    }

    static async getEnterpriseProvidersByHint(enterpriseId: number, hint:string, link_type: EnterpriseLinkTypeEnum, documentType?: string){
        console.log('DAO: Starting getEnterpriseProvidersByHint');
        await getConnection();
        const providers =  await EnterpriseLinks.getEnterpriseProvidersByHint(enterpriseId, hint, link_type, documentType);
        console.log('DAO: Ending getEnterpriseProvidersByHint');
        return providers;
    }

    static async getProviderLinkedToEnterprise(enterpriseId: number, providerId: number) {
        console.log('DAO: Starting getProviderLinkedToEnterprise');
        await getConnection();
        const link =  await EnterpriseLinks.getProviderLinkedToEnterprise(enterpriseId, providerId);
        console.log('DAO: Ending getProviderLinkedToEnterprise');
        return link;
    }

    static async getProviderLinkedToEnterpriseandStatus(enterpriseId: number, providerId: number): Promise<EnterpriseLinks> {
        console.log('DAO: Starting getProviderLinkedToEnterpriseandStatus');
        await getConnection();
        const link =  await EnterpriseLinks.getProviderLinkedToEnterpriseandStatus(enterpriseId, providerId);
        console.log('DAO: Ending getProviderLinkedToEnterpriseandStatus');
        return link;
    }
}