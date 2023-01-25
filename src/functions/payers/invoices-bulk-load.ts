const middy = require('middy');
import { APIGatewayProxyHandler, Context, APIGatewayProxyEvent } from 'aws-lambda';
import { authorizerRoles } from 'commons/middlewares/authorizer-roles';
import { RoleEnum } from 'commons/enums/role.enum';
import { BadRequestException, handleException } from 'commons/exceptions';
import Response from 'commons/response';
import { EnterpriseService } from 'services/enterprise.service';


const originalHandler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent, context: Context) => {
  console.log(`HANDLER: Starting ${context.functionName}...`);

  try{
    if(!event.pathParameters)throw new BadRequestException('SCF.LIBERA.COMMON.400');
    const userId = +event.requestContext.authorizer['principalId'];
    const enterpriseId = +event.pathParameters['enterpriseId'];
    const body = JSON.parse(event.body);

    if(!enterpriseId) throw new BadRequestException('SCF.LIBERA.29');
    if(enterpriseId === undefined || isNaN(+enterpriseId)) throw new BadRequestException('SCF.LIBERA.50', { enterpriseId });
    if(!body) throw new BadRequestException('SCF.LIBERA.49');

    const result = await EnterpriseService.startProcessInvoicesBulkLoad(userId, enterpriseId, body);

    console.log(`HANDLER: Ending ${context.functionName}...`);
    return Response.Created(result);
  }
  catch (errors) {
    console.log('HANDLER ERRORS: ', errors);
    return handleException(errors);
  }
};

export const handler = middy(originalHandler)
  .use(authorizerRoles({
    roles: [
      RoleEnum.ENTERPRISE_CONSOLE_ADMIN,
      RoleEnum.ENTERPRISE_PAYER_ADMIN
    ]
  }));