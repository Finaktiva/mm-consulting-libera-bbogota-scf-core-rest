const middy = require('middy');
import { APIGatewayProxyHandler, APIGatewayProxyEvent, Context } from 'aws-lambda';
import { handleException } from 'commons/exceptions';
import Response from 'commons/response';
import { CatalogService } from 'services/catalog.service';
import { authorizerPermissions } from 'commons/middlewares/authorizer-permissions';
import { PermissionEnum } from 'commons/enums/permission.enum';

const originalHandler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent, context: Context) => {
  try {
    console.log(`HANDLER: Starting ${context.functionName}`);
    const result = await CatalogService.getBanks();

    console.log(`HANDLER: Ending ${context.functionName}`);

    return Response.Ok(result);
  } catch (errors) {
    console.log('HANDLER ERRORS: ', errors);
    return handleException(errors);
  }
}

export const handler = middy(originalHandler)
  .use(authorizerPermissions({
    permissions: [
      PermissionEnum.READ_ENTERPRISE_DETAIL,
      PermissionEnum.CREATE_ENTERPRISE,
      PermissionEnum.UPDATE_ENTERPRISE
    ]
  }));