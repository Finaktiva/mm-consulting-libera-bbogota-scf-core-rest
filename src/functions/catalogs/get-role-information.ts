import { APIGatewayProxyHandler, APIGatewayProxyEvent, Context } from 'aws-lambda';
import { PermissionEnum } from 'commons/enums/permission.enum';
import { handleException } from 'commons/exceptions';
import { IRoleInformation } from 'commons/interfaces/catalogs';
import { authorizerPermissions } from 'commons/middlewares/authorizer-permissions';
import { CatalogsParsers } from 'commons/parsers/catalogs.parsers';
import Response from 'commons/response';
import { CatalogService } from 'services/catalog.service';
const middy = require('middy');

const originalHandler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent, context: Context) => {
    console.log(`HANDLER: Starting ${context.functionName}`);

    try {
        const {code} = event.pathParameters;
        const {role,permissions,associatedUsers} = await CatalogService.getRoleInformation(code);
        const roleInformation: IRoleInformation = CatalogsParsers.parseRoleInformation(role,associatedUsers,permissions);
        
        console.log('Role information parser: ',roleInformation);
        console.log(`HANDLER: Ending ${context.functionName}`);
        
        return Response.Ok(roleInformation);
    } catch (errors) {
        console.log('HANDLER ERRORS: ', errors);
        return handleException(errors);
    }
}
export const handler = middy(originalHandler)
  .use(authorizerPermissions({
    permissions: [
      PermissionEnum.UPDATE_ROLE
    ]
  }));

