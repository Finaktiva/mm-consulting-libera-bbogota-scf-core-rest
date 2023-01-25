const middy = require('middy');
import { APIGatewayProxyHandler, APIGatewayEvent, Context } from 'aws-lambda';
import { BadRequestException, handleException } from 'commons/exceptions';
import Response from 'commons/response';
import { EnterpriseService } from 'services/enterprise.service';
import { authorizerPermissions } from 'commons/middlewares/authorizer-permissions';
import { PermissionEnum } from 'commons/enums/permission.enum';


export const originalHandler: APIGatewayProxyHandler = async (event: APIGatewayEvent, context: Context) => {
  console.log(`HANDLER: Starting ${context.functionName}...`);
  try{
    if(!event.pathParameters)throw new BadRequestException('SCF.LIBERA.COMMON.400');
    const { enterpriseId } = event.pathParameters;

    if(!enterpriseId) throw new BadRequestException('SCF.LIBERA.29');

    if(enterpriseId === undefined || isNaN(+enterpriseId)) throw new BadRequestException('SCF.LIBERA.50', {enterpriseId});
    await EnterpriseService.admResendInvitation(+enterpriseId );

    console.log(`HANDLER: Ending ${context.functionName}...`);
    return Response.NoContent();
  }
  catch (errors) {
    console.log('HANDLER ERRORS: ', errors);
    return handleException(errors);
  }
}
export const handler = middy(originalHandler)
    .use(authorizerPermissions({
        permissions: [
            PermissionEnum.READ_ENTERPRISE_LIST
        ]
    }));
 