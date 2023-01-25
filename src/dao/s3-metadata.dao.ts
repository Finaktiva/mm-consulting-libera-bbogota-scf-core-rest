import { getConnection } from "commons/connection";
import { S3Metadata } from "entities/s3-metadata";
import { InternalServerException } from "commons/exceptions";



export class S3MetadataDAO {

    static async createS3Metadata(s3Metadata:S3Metadata):Promise<S3Metadata>{
        console.log('DAO: Starting createS3Metadata method');
        try{
            await getConnection();
            const response:S3Metadata = await s3Metadata.save();
            console.log('DAO: Ending createS3Metadata method');
            return response;
        }catch(errors){
            console.log('Error on DAO',errors);
            throw new InternalServerException('SCF.LIBERA.COMMON.500',{errors});
        }
    }

    static async getS3MetadataById(s3MetadataId:number): Promise<S3Metadata>{
        console.log('DAO: Starting getS3Metadata method');
        try{
            await getConnection();
            const response:S3Metadata = await S3Metadata.getById(s3MetadataId);
            
            console.log("metadata",response);
            console.log('DAO: Ending getS3Metadata method');
    
            return response;
        }catch(errors){
            console.log('Error on DAO',errors);
            throw new InternalServerException('SCF.LIBERA.COMMON.500',{errors});
        }


    }

    static async getById(s3MetadataId: number) {
        console.log('DAO: Starting getDocumentById');
        await getConnection();
        const s3Metadata = await S3Metadata.findOne(s3MetadataId);
        console.log('DAO: Ending getDocumentById');
        return s3Metadata;
    }

    static async delete(s3Metadata: S3Metadata) {
        console.log('DAO: Starting deleteDocumentById');
        await getConnection();
        await s3Metadata.remove();
        console.log('DAO: Ending deleteDocumentById');
    }

    static async getByBranding(s3MetadataId: number){
        console.log('DAO: Starting getByBranding');
        await getConnection();
        const s3Metadata = await S3Metadata.getByBranding(s3MetadataId);
        console.log('DAO: Ending getByBranding');
        return s3Metadata;
    }

    static async save(s3Metadata: any){
        console.log('DAO: Starting save');
        await getConnection();
        const save = await S3Metadata.save(s3Metadata);
        console.log('DAO: Ending save');
        return save;
    }
    
}