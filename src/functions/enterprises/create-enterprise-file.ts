import { APIGatewayProxyHandler, APIGatewayEvent, Context, Callback} from 'aws-lambda';
import moment, { Moment } from 'moment';
import Response from 'commons/response';
import { BadRequestException, handleException } from 'commons/exceptions';
import { S3Service } from 'services/s3.service';
import { S3MetadataService } from 'services/s3-metadata.service';
import { EnterpriseDocumentationService } from 'services/enterprise-documentation.service';
import { EnterpriseService } from 'services/enterprise.service';
import S3Utils from 'commons/s3.utils';
import { UserDAO } from 'dao/user.dao';
import { EnterpriseDocumentationDAO } from 'dao/enterprise-documentation.dao';
import { CatDocumentTypeEnum } from 'commons/enums/cat-document-type.enum';
import { ok } from 'assert';
import { CatDocumentTypeDAO } from 'dao/cat-document-type.dao';
import { EnterpriseDocumentationStatusEnum } from 'commons/enums/enterprise-documentation-status.enum';
import LiberaUtils from '../../commons/libera.utils';
import { UserTypeEnum } from 'commons/enums/user-type.enum';
import EnterprisesParser from 'commons/parsers/enterprises.parser';
import { IEnterpriseDocumentStatus } from 'commons/interfaces/enterprise-document.interface';
import { authorizerPermissions } from 'commons/middlewares/authorizer-permissions';
import { PermissionEnum } from 'commons/enums/permission.enum';

const middy = require('middy');

const documentationPathPrefix:string = process.env.S3_FILE_PATH_PREFIX;
const finalDocumentationPathPrefix:string = process.env.S3_ENTERPRISE_DOCUMENTATION_FILE_PATH_PREFIX;
const bucket:string = process.env.S3_BUCKET_NAME;

const originalHandler: APIGatewayProxyHandler = async (event: APIGatewayEvent, context: Context, callback: Callback) => {
    console.log(`Handler: Starting ${context.functionName}`);
    const { filename, explanation, expeditionDate } = JSON.parse(event.body);
    const { enterpriseId, documentationId } = event.pathParameters;
    const userId = +event.requestContext.authorizer['principalId'];
    
    let encodedFile:string = S3Utils.cleanS3Filename(filename);

    let fromDir:string = documentationPathPrefix
        .replace('{enterpriseId}',enterpriseId.toString())
        .concat(S3Utils.s3UrlEncode(encodedFile));

    let toDir:string = finalDocumentationPathPrefix
        .replace('{enterpriseId}',enterpriseId.toString())
        .concat(S3Utils.fileKeyNameGenerator(encodedFile));

    let currentDate = moment();
    let dateBodyFormated = moment(expeditionDate);
   
    if(!dateBodyFormated.isValid() || dateBodyFormated > currentDate || !expeditionDate){
        throw new BadRequestException('SCF.LIBERA.287');
    }
    
    const userDetail = await UserDAO.getUserById(userId);
    
    try{
        if (explanation?.length > 500) throw new BadRequestException('SCF.LIBERA.291');

        // await EnterpriseService.getEnterpriseByOwnerIdAndEnterpriseId(+enterpriseId,userId);
        let status: EnterpriseDocumentationStatusEnum = EnterpriseDocumentationStatusEnum.LOADED;//Status in case of a consulting without LIBERA_ADMIN
        
        console.log('---> S3 services');
        await S3Service.moveFile(bucket,fromDir,toDir);
        
        const file = await S3MetadataService.createS3Metadata({
            bucket,filename, fileKey:toDir
        });
        console.log('file ==> ', file);
        
        let data: IEnterpriseDocumentStatus = null;
        switch(userDetail.type){
            case UserTypeEnum.LIBERA_USER:
                console.log('---> LIBERA_USER case');
                data = await EnterpriseDocumentationService.getDocumentStatusAndEffectivenessDateCalculation(+enterpriseId, +documentationId, expeditionDate);
                status = data.statusFromService;
            break;
            case UserTypeEnum.ENTERPRISE_USER:
                console.log('---> ENTERPRISE_USER case');
                data = await EnterpriseDocumentationService.getDocumentStatusByEnterpriseStatus(+enterpriseId, +documentationId, expeditionDate);
                status = data.statusFromService;
            break;

        }
        const enterpriseDocumentation = await EnterpriseDocumentationService
            .createEnterpriseFile(+enterpriseId, +documentationId, file.id, expeditionDate, explanation, status, data.dateToService);
            
        const url = await S3Service.getObjectUrl({bucket, fileKey:toDir});
        const parsedEnterpriseDocumentation = EnterprisesParser.parseEnterpriseDocumentation(enterpriseDocumentation, file, url);
        console.log(`Handler: Ending ${context.functionName}`);
        return Response.Created(parsedEnterpriseDocumentation);

    }catch(errors){
        return handleException(errors);
    }
}

export const handler = middy(originalHandler)
    .use(authorizerPermissions({
        permissions: [
            PermissionEnum.UPLOAD_DOCUMENTS,
            PermissionEnum.UPDATE_DOCUMENTS
        ]
    }));
