import { getConnection } from "commons/connection";
import { EnterpriseDocumentation } from "entities/enterprise-documentation";
import { InternalServerException } from "commons/exceptions";
import { EnterpriseDocumentationStatusEnum } from "commons/enums/enterprise-documentation-status.enum";

export class EnterpriseDocumentationDAO {

    static async getEnterpriseDocumentationById(id: number){
        console.log('DAO: Starting getEnterpriseDocumentationById');
        await getConnection();
        const enterpriseDocumentation = await EnterpriseDocumentation.getById(id);
        console.log('DAO: Ending getEnterpriseDocumentationById');
        return enterpriseDocumentation;
    }

    static async getEnterpriseDocumentationByEnterpriseId(enterpriseId: number, param?: boolean) {
        console.log('DAO: Starting getEnterpriseDocumentationByEnterpriseId method');
        await getConnection();
        const enterpriseDocumentation = await EnterpriseDocumentation
            .getEnterpriseDocumentationByEnterpriseId(enterpriseId, param);
        console.log('DAO: Ending getEnterpriseDocumentationByEnterpriseId method');
        return enterpriseDocumentation;
    }

    static async getEnterpriseDocumentationByIdAndEnterpriseId(enterpriseId:number,eDocumentationId:number): Promise<EnterpriseDocumentation>{
        console.log('DAO: Starting getEnterpriseDocumentation method');

        try{
            await getConnection();
            const response:EnterpriseDocumentation = await EnterpriseDocumentation
                .getEnterpriseDocumentationByIdAndEnterpriseId(enterpriseId,eDocumentationId);
            console.log('documentation',response);
            console.log('DAO: Ending getEnterpriseDocumentation method');
    
            return response;
        }catch(errors){
            console.log('Error on DAO',errors);
            throw new InternalServerException('SCF.LIBERA.COMMON.500',{errors});
        }


    }

    static async saveEnterpriseDocumentation(enterpriseDocumentation:EnterpriseDocumentation):Promise<EnterpriseDocumentation>{
        console.log('DAO: Starting saveEnterpriseDocumentation method');
        try{        
            await getConnection();
            enterpriseDocumentation = await enterpriseDocumentation.save();
            console.log('DAO: Ending saveEnterpriseDocumentation method');
            
            return enterpriseDocumentation;
        }catch(errors){
            console.log('Error on DAO',errors);
            throw new InternalServerException('SCF.LIBERA.COMMON.500',{errors});
        }

    }

    static async getEnterpriseDocumentation(enterpriseId: number, documentationId: number): Promise<EnterpriseDocumentation> {
        console.log('DAO: Starting getEnterpriseDocumentation');
        await getConnection();
        const enterpriseDocumentation = await EnterpriseDocumentation.getEnterpriseDocumentation(enterpriseId, documentationId);
        console.log('DAO: Ending getEnterpriseDocumentation');
        return enterpriseDocumentation;
    }

    static async getEnterpriseDocumentationByEnterpriseIdAndStatus(enterpriseId: number){
        console.log('DAO: Starting getEnterpriseDocumentationByEnterpriseIdAndStatus');
        await getConnection();
        const enterpriseDocumentations = await EnterpriseDocumentation
            .getEnterpriseDocumentationsByEnterpriseIdAndStatus(enterpriseId);
        console.log('DAO: Ending getEnterpriseDocumentationByEnterpriseIdAndStatus');
        return enterpriseDocumentations;
    }

    static async save(enterpriseDocumentation: EnterpriseDocumentation){
        console.log('DAO: Starting save');
        await getConnection();
        await enterpriseDocumentation.save();
        console.log('DAO: Ending save');
    }

    static async getEnterpriseDocumentationCountByEnterpriseId(enterpriseId: number) {
        console.log('DAO: Starting getEnterpriseDocumentationCountByEnterpriseId');
        await getConnection();
        const docCount = await EnterpriseDocumentation.getEnterpriseDocumentationCountEnabledByEnterpriseId(enterpriseId);
        console.log('DAO: Ending getEnterpriseDocumentationCountByEnterpriseId');
        return docCount;
    }

    static async getTotalDocumentationCount(enterpriseId: number) {
        console.log('DAO: Starting getTotalCount');
        await getConnection();
        const count =  await EnterpriseDocumentation.getTotalCount(enterpriseId);
        console.log('DAO: Ending getTotalCount');
        return count;
    }

    static async getByEnterpriseId(enterpriseId: number) {
        console.log('DAO: Starting getByEnterpriseId');
        await getConnection();
        const documentations = await EnterpriseDocumentation.getByEnterpriseId(enterpriseId);
        console.log('DAO: Ending getByEnterpriseId');
        return documentations;
    }

    static async getLasDocByEnterpriseId(enterpriseId: number, status: string) {
        console.log('DAO: Starting getLasDocByEnterpriseId');
        await getConnection();
        const documentations = await EnterpriseDocumentation.getLasDocByEnterpriseId(+enterpriseId, status);
        console.log('DAO: Ending getLasDocByEnterpriseId');
        return documentations;
    }

    static async getDocumentsAboutToExpire(todayDate: Date) {
        console.log('DAO: Starting getDocumentsAboutToExpire');
        await getConnection();
        const documentations = await EnterpriseDocumentation.getDocumentsAboutToExpire(todayDate);
        console.log('DAO: Ending getDocumentsAboutToExpire');
        return documentations;
    }

    static async getEnterpriseDocumentationByStatus(enterpriseId: number, status: string){
        console.log('DAO: Starting getEnterpriseDocumentationByStatus');

        await getConnection();
        const documents = await EnterpriseDocumentation.getEnterpriseDocumentationByStatus(enterpriseId, status);
        console.log('DAO: Ending getEnterpriseDocumentationByStatus');
        
        return documents;
    }

    static async getGeneralDocumentationByDocumentationId(documentationId: number){
        console.log('DAO: Starting getGeneralDocumentationByDocumentationId');

        await getConnection();
        const document = await EnterpriseDocumentation.getGeneralDocumentationByDocumentationId(documentationId);
        console.log('DAO: Ending getGeneralDocumentationByDocumentationId');
        
        return document;
    }
}
