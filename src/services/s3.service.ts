import * as AWS from 'aws-sdk';
import moment from 'moment';
import { InternalServerException, ConflictException } from 'commons/exceptions';
import { UserDAO } from 'dao/user.dao';
import { RoleEnum } from 'commons/enums/role.enum';
import S3Utils from 'commons/s3.utils';

const fs = require('fs').promises;

const resourceBucket: string = process.env.S3_BUCKET_NAME;
const documentsMimeType: string = process.env.S3_DOCUMENTS_MIME_TYPE;
const uploadUrlExpirationTime: number = parseInt(process.env.S3_UPLOAD_LINK_EXPIRATION_TIME);
const uploadUrlACL: string = process.env.S3_UPLOAD_LINK_ACL;
const S3 = new AWS.S3();
const documentationPathPrefix = process.env.S3_FILE_PATH_PREFIX;

export class S3Service {

    static async moveFile(bucket: string, fromDir: string, toDir: string, destinationBucket?: string): Promise<void> {
        console.log('SERVICE: Starting moveFile service');
        const params: AWS.S3.CopyObjectRequest = {
            Bucket: destinationBucket ? destinationBucket : bucket,
            CopySource: `${bucket}/${fromDir}`,
            Key: toDir
        };
        try {
            await S3.copyObject(params).promise();
            console.log('FINISHED: Finished moveFile service');
        } catch (errors) {
            throw new InternalServerException('SCF.LIBERA.COMMON.500', { errors });
        }

    }

    static async getObjectUrl(metadata: { bucket: string, fileKey?: string, hours?: number, minutes?: number }) {
        console.log('SERVICE: Starting getObjectUrl method');
        try {
            const expirationDate = moment(moment.now(), 'x').milliseconds();
            let milliseconds;
            if (metadata.hours || metadata.minutes) {
                milliseconds = expirationDate;
                const expHourMsec = metadata.hours * (1000 * 60 * 60);
                const expMinutesMsec = metadata.minutes * (1000 * 60);
                milliseconds += expHourMsec + expMinutesMsec;
            }
            else {
                milliseconds = expirationDate + 86400000;
            }
            const params = {
                Bucket: metadata.bucket,
                Key: metadata.fileKey,
                Expires: milliseconds
            };
            const url = S3.getSignedUrl('getObject', params);
            console.log('url ', url);
            console.log('SERVICE: Ending getObjectUrl method');
            return url;
        }
        catch (errors) {
            console.log('SERVICE ERROR: ', errors);
            throw new InternalServerException('SCF.LIBERA.COMMON.500', { errors });
        }
    }

    static async createCredentialsPath(filename: string, contentType: string, enterpriseId: number, userId): Promise<object> {
        console.log('SERVICE: Starting createCredentialsPath method');
        const user = await UserDAO.getUserById(userId);
        if (user && user.userRoles.find(userRole => userRole.role.name != RoleEnum.LIBERA_ADMIN)) throw new ConflictException('SCF.LIBERA.110', { userId });

        const path: string = documentationPathPrefix
            .replace('{enterpriseId}', enterpriseId.toString())
            .concat(S3Utils.cleanS3Filename(filename));

        console.log('normalized filename: ', S3Utils.cleanS3Filename(filename));
        console.log('url generated: ', path);

        const params: object = {
            Bucket: resourceBucket,
            Key: path,
            Expires: uploadUrlExpirationTime,
            ACL: uploadUrlACL,
            ContentType: contentType ? contentType : documentsMimeType
        };

        try {
            const url = await S3.getSignedUrl('putObject', params);
            console.log('SERVICE: Ending createCredentialsPath method');
            return { url };
        }
        catch (errors) {
            console.log('SERVICE ERROR: ', errors);
            throw new InternalServerException('SCF.LIBERA.COMMON.500', { errors });
        }
    }

    static async deleteFile(metadata: { bucket: string, filekey: string }) {
        console.log('SERVICE: Starting deleteFileOnS3');

        try {
            const params: any = {
                Bucket: metadata.bucket,
                Key: metadata.filekey
            }
            const result = await await S3.deleteObject(params).promise();
            console.log(`result : ${result}`);

            console.log('SERVICE: Ending deleteFileOnS3');
            return result;
        } catch (errors) {
            console.log('SERVICE ERRORS: ', errors);
            throw new InternalServerException('SCF.LIBERA.COMMON.500', { errors });
        }
    }

    static async getObjectFile(metadata: { bucket: string, filekey: string }) {
        console.log('SERVICE: Starting getObjectFile...');
        try {
            const params: any = {
                Bucket: metadata.bucket,
                Key: metadata.filekey
            };
            const object = await await S3.getObject(params).promise();
            console.log('obj', object);
            return object;
        }
        catch (errors) {
            console.log('SERVICE ERRORS: ', errors);
            throw new InternalServerException('SCF.LIBERA.COMMON.500', { errors });
        }
    }

    static async downloadFileToTmp(metadata: { bucket: string, filekey: string }){
        try{
            console.log(`SERVICE: Starting downloadFileToTmp function`);

            const params: any = {
                Bucket: metadata.bucket,
                Key: metadata.filekey
            };

            console.log(`params: ${ JSON.stringify(params) }`);

            const { Body } = await S3.getObject(params).promise();

            console.log('Moving file to tmp');

            await fs.writeFile('/tmp/wsdl', Body);

            console.log(`SERVICE: Ending downloadFileToTmp function`);

            return true;
        }
        catch (errors) {
            console.log('SERVICE ERRORS: ', errors);
            throw new InternalServerException('SCF.LIBERA.COMMON.500', { errors });
        }
    }
}