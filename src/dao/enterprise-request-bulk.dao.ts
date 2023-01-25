import { EnterpriseRequestBulk } from "entities/enterprise-request-bulk";
import { getConnection } from "commons/connection";
import { SimpleFilter } from "commons/filter";
import { S3Metadata } from "entities/s3-metadata";

export class EnterpriseRequestBulkDAO {

    static async save(enterpriseRequestBulk: EnterpriseRequestBulk){
        console.log('DAO: Starting save');
        await getConnection();
        await enterpriseRequestBulk.save();
        console.log('DAO: Ending save');
        return enterpriseRequestBulk;
    }

    static async getByEnterpriseId(enterpriseId: number){
        console.log('DAO: Starting getByEnterpriseId');
        await getConnection();
        const result = await EnterpriseRequestBulk.getByEnterpriseId(enterpriseId);
        console.log('DAO: Ending getByEnterpriseId');
        return result;
    }

    static async getBulksByEnterpriseId(enterpriseId: number, filter: SimpleFilter) {
        console.log('DAO: Starting getBulksByEnterpriseId');
        await getConnection();
        const bulks = await EnterpriseRequestBulk.getManyByEnterpriseId(enterpriseId, filter);
        console.log('DAO: Ending getBulksByEnterpriseId');
        return bulks;
    }

    static async getById(enterpriseRequestBulkId: number) {
        console.log('DAO: Starting getById');
        await getConnection();
        const bulk = await EnterpriseRequestBulk.getById(enterpriseRequestBulkId);
        console.log(bulk.id);
        console.log('DAO: Ending getById');
        return bulk;
    }

    static async getByBulkId(enterpriseRequestBulkId: number) {
        console.log('DAO: Starting getByBulkId');
        await getConnection();
        const bulk = await EnterpriseRequestBulk.getByBulkId(enterpriseRequestBulkId);
        console.log('DAO: Ending getByBulkId');
        return bulk;
    }

    static async rollbackmoveBulkFileToS3(s3Metadata, enterpriseRequestBulk){
        console.log('DAO: Starting rollbackmoveBulkFileToS3')
        await getConnection();
        if(s3Metadata){
        console.log('Delete enterpriseRequesBulk');
        await EnterpriseRequestBulk.removeEnterpriseRequestBulk(enterpriseRequestBulk);
        console.log('EnterpriseRequestBulk Deleted');
        }
        if(enterpriseRequestBulk){
        console.log('Delete S3Metadata');
        await S3Metadata.removeS3Metadata(s3Metadata);
        console.log('S3Metada Deleted');
        }
    }

}
