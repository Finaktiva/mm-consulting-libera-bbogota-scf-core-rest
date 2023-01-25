const middy = require('middy');
import { APIGatewayProxyHandler, APIGatewayEvent, Context } from 'aws-lambda';
import { authorizerRoles } from 'commons/middlewares/authorizer-roles';
import { RoleEnum } from 'commons/enums/role.enum';
import { BadRequestException, handleException } from 'commons/exceptions';
import Response from 'commons/response';
import { UserService } from 'services/user.service';


export const originalHandler: APIGatewayProxyHandler = async (event: APIGatewayEvent, context: Context) => {
  console.log(`HANDLER: Starting ${context.functionName}...`);
  try{
    if(!event.pathParameters)throw new BadRequestException('SCF.LIBERA.COMMON.400');
    const { enterpriseId, userId } = event.pathParameters;

    if(!enterpriseId) throw new BadRequestException('SCF.LIBERA.29');

    if(enterpriseId === undefined || isNaN(+enterpriseId)) throw new BadRequestException('SCF.LIBERA.50', {enterpriseId});

    if(!userId) throw new BadRequestException('SCF.LIBERA.57');

    if(userId === undefined || isNaN(+userId)) throw new BadRequestException('SCF.LIBERA.51', {userId});

    
    const principalId = event.requestContext.authorizer.principalId;
    await UserService.resendInvitation(+enterpriseId, +userId, +principalId);
    
    console.log(`HANDLER: Ending ${context.functionName}...`);
    return Response.NoContent();
  }
  catch (errors) {
    console.log('HANDLER ERRORS: ', errors);
    return handleException(errors);
  }
}
export const handler = middy(originalHandler)
    .use(authorizerRoles({
        roles: [
            RoleEnum.ENTERPRISE_CONSOLE_ADMIN
        ]
    }));
