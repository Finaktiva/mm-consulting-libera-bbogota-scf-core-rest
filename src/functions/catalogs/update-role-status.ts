import { APIGatewayProxyHandler, APIGatewayProxyEvent, Context } from 'aws-lambda';
import { PermissionEnum } from 'commons/enums/permission.enum';
import { BadRequestException, handleException } from 'commons/exceptions';
import { authorizerPermissions } from 'commons/middlewares/authorizer-permissions';
import Response from 'commons/response';
import { CatalogService } from 'services/catalog.service';
const middy = require('middy');

const originalHandler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent, context: Context) => {
    console.log(`HANDLER: Starting ${context.functionName}`);
    console.log('Body: ', event.body);
    const {code } = event.pathParameters;
    const reqBody = JSON.parse(event.body);

    try {  

        const { status } = reqBody;

        if (!status) {
            throw new BadRequestException('SFC.LIBERA.364');
        }

        await CatalogService.updateRoleStatus(code,status);

        console.log(`HANDLER: Ending ${context.functionName}`);
        
        return Response.NoContent();
    } catch (errors) {
        console.error(errors);
        return handleException(errors);
    }
}

export const handler = middy(originalHandler)
  .use(authorizerPermissions({
    permissions: [
      PermissionEnum.ENABLE_OR_DISABLE_ROLE
    ]
  }));
