import { S3Metadata } from 'entities/s3-metadata';
import { S3MetadataDAO} from 'dao/s3-metadata.dao';
import { BadRequestException } from 'commons/exceptions';

export class S3MetadataService{

    static async createS3Metadata(s3Metadata : any): Promise<S3Metadata>{
        console.log('SERVICES: Starting createEnterpriseFile method');
        const { bucket, filename, fileKey } = s3Metadata;
        let metadata:S3Metadata = null;
        
        if(!bucket) throw new BadRequestException("SCF.LIBERA.24", {variable:"bucket"});

        if(!filename) throw new BadRequestException("SCF.LIBERA.24", {variable:"filename"});
        
        if(!fileKey) throw new BadRequestException("SCF.LIBERA.24", {variable:"fileKey"});

        metadata = new S3Metadata();
        metadata.bucket = bucket;
        metadata.filename = filename;
        metadata.fileKey = fileKey;
        metadata.creationDate = new Date();
        
        metadata = await S3MetadataDAO.createS3Metadata(metadata);

        console.log('SERVICES: Ending createEnterpriseFile method');
        return metadata;
    }

}