const middy = require('middy');
import { APIGatewayProxyHandler, APIGatewayProxyEvent, Context } from 'aws-lambda';
import { handleException, BadRequestException } from 'commons/exceptions';
import { EnterpriseService } from 'services/enterprise.service';
import Response from 'commons/response';
import { authorizerPermissions } from 'commons/middlewares/authorizer-permissions';
import { PermissionEnum } from 'commons/enums/permission.enum';


const originalHandler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent, context: Context) => {
  console.log(`HANDLER: Starting ${context.functionName} method...`);
  try {
    const requestBody = JSON.parse(event.body);
    const { documentType, documentTypeDescription } = requestBody
    const { enterpriseId } = event.pathParameters;
    const userId = +event.requestContext.authorizer['principalId'];
    console.log('User Id ===>', userId);

    if (!documentType || documentType === undefined) throw new BadRequestException('SCF.LIBERA.117');
    if (documentType === "OTHER_DOCUMENTS") {
      if (!documentTypeDescription || documentTypeDescription === undefined) throw new BadRequestException('SCF.LIBERA.289');
    }
    if (documentTypeDescription.length > 100) throw new BadRequestException('SCF.LIBERA.293');

    const savedEnterpriseDocumentation = await EnterpriseService.postEnterpriseDocumentationByEnterpriseId(+enterpriseId, requestBody, userId);
    console.log(`HANDLER: Ending ${context.functionName} method...`);
    return Response.Created(savedEnterpriseDocumentation);
  }
  catch(errors) {
    console.log('HANDLER ERRORS ', errors);
    return handleException(errors);
  }
}

export const handler = middy(originalHandler)
    .use(authorizerPermissions({
        permissions: [
            PermissionEnum.REQUEST_DOCUMENTS
        ]
    }));