const middy = require('middy');
import { APIGatewayProxyHandler, APIGatewayProxyEvent, Context } from 'aws-lambda';
import { handleException } from 'commons/exceptions';
import { EnterpriseService } from 'services/enterprise.service';
import Response from 'commons/response';
import { authorizerPermissions } from 'commons/middlewares/authorizer-permissions';
import { PermissionEnum } from 'commons/enums/permission.enum';


const originalHandler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent, context: Context) => {
  console.log(`HANDLER: Starting ${context.functionName} method...`);
  try {
    const { enterpriseId } = event.pathParameters;
    const sendDocumentationResolution= await EnterpriseService.sendDocumentationResolution(+enterpriseId);
   
    console.log(`HANDLER: Ending ${context.functionName} method...`);
    return Response.NoContent();
  }
  catch(errors) {
    console.log('HANDLER ERRORS ', errors);
    return handleException(errors);
  }
}

export const handler = middy(originalHandler)
  .use(authorizerPermissions({
    permissions: [
      PermissionEnum.READ_ENTERPRISE_DOCUMENTATION,
      PermissionEnum.APPROVE_DOCUMENTS,
      PermissionEnum.REQUEST_DOCUMENTS,
      PermissionEnum.UPDATE_DOCUMENTS,
      PermissionEnum.DELETE_DOCUMENTS,
      PermissionEnum.UPLOAD_DOCUMENTS
    ]
  }));