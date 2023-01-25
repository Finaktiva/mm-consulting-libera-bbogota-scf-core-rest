import { APIGatewayProxyHandler, APIGatewayProxyEvent, Context } from 'aws-lambda';
import { PermissionEnum } from 'commons/enums/permission.enum';
import { BadRequestException, handleException } from 'commons/exceptions';
import { IRoleResponse } from 'commons/interfaces/catalogs';
import { authorizerPermissions } from 'commons/middlewares/authorizer-permissions';
import { CatalogsParsers } from 'commons/parsers/catalogs.parsers';
import Response from 'commons/response';
import { CatalogService } from 'services/catalog.service';
const middy = require('middy');

const originalHandler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent, context: Context) => {
  console.log(`HANDLER: Starting ${context.functionName}`);
  console.log('Body: ', event.body);

  const userId = +event.requestContext.authorizer.principalId;

  try {

    const reqBody = JSON.parse(event.body);

    if (!reqBody)
      throw new BadRequestException('SCF.LIBERA.348');

    const { description, acronym, permissions } = reqBody;

    if (!description)
      throw new BadRequestException('SCF.LIBERA.349', { parameter: 'description' });

    if (!acronym)
      throw new BadRequestException('SCF.LIBERA.349', { parameter: 'acronym' });

    if (!permissions)
      throw new BadRequestException('SCF.LIBERA.349', { parameter: 'permissions' });

    if (typeof description !== 'string')
      throw new BadRequestException('SCF.LIBERA.350', { parameter: 'description' });

    if (typeof acronym !== 'string')
      throw new BadRequestException('SCF.LIBERA.350', { parameter: 'acronym' });

    if (!Array.isArray(permissions))
      throw new BadRequestException('SCF.LIBERA.350', { parameter: 'permissions' });

    if (description.length < 5 || description.length > 100)
      throw new BadRequestException('SCF.LIBERA.351');

    if (acronym.length < 1 || acronym.length > 5)
      throw new BadRequestException('SCF.LIBERA.352');

    if (permissions.length < 1)
      throw new BadRequestException('SCF.LIBERA.353');

    permissions.forEach(permission => {
      if (typeof permission !== 'string')
        throw new BadRequestException('SCF.LIBERA.354', { permission });
    })

    const response = await CatalogService.createRole(reqBody, userId);
    const finalResult: IRoleResponse = CatalogsParsers.parseReponseRole(response);
    
    console.log(`HANDLER: Ending ${context.functionName}`);
    
    return Response.Ok(finalResult);
  } catch (errors) {
    console.error(errors);
    return handleException(errors);
  }
}
export const handler = middy(originalHandler)
  .use(authorizerPermissions({
    permissions: [
      PermissionEnum.CREATE_ROLE
    ]
  }));
