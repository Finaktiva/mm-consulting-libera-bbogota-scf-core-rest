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

    const userId = +event.requestContext.authorizer.principalId;
    const {code } = event.pathParameters;
    const reqBody = JSON.parse(event.body);

    try {  

        const { acronym, permissions } = reqBody;

        if (!acronym)
            throw new BadRequestException('SCF.LIBERA.349', { parameter: 'acronym' });

        if (!permissions)
            throw new BadRequestException('SCF.LIBERA.349', { parameter: 'permissions' });

        if (typeof acronym !== 'string')
            throw new BadRequestException('SCF.LIBERA.350', { parameter: 'acronym' });

        if (!Array.isArray(permissions))
            throw new BadRequestException('SCF.LIBERA.350', { parameter: 'permissions' });

        if (acronym.length < 1 || acronym.length > 5)
            throw new BadRequestException('SCF.LIBERA.352');

        if (permissions.length < 1)
            throw new BadRequestException('SCF.LIBERA.353');

        permissions.forEach(permission => {
            if (typeof permission !== 'string')
                throw new BadRequestException('SCF.LIBERA.354', { permission });
        })

        await CatalogService.updateRole(reqBody, userId,code);

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
      PermissionEnum.UPDATE_ROLE
    ]
  }));
