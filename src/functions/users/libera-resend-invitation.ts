const middy = require('middy');
import { APIGatewayProxyHandler, APIGatewayEvent, Context } from 'aws-lambda'
import { BadRequestException, handleException } from 'commons/exceptions';
import Response from 'commons/response';
import { UserService } from 'services/user.service';
import LiberaUtils from 'commons/libera.utils';
import { UserDAO } from 'dao/user.dao';
import { EnterpriseDAO } from 'dao/enterprise.dao';
import { User } from 'entities/user';
import { authorizerPermissions } from 'commons/middlewares/authorizer-permissions';
import { PermissionEnum } from 'commons/enums/permission.enum';


export const originalHandler: APIGatewayProxyHandler = async (event: APIGatewayEvent, context: Context) => {
  console.log(`HANDLER: Starting ${context.functionName}...`);
  try{
    if(!event.pathParameters)throw new BadRequestException('SCF.LIBERA.COMMON.400');
    const { userId } = event.pathParameters;
    const first_time = event.queryStringParameters?.first_time;

    const userFirmedId = event.requestContext.authorizer.principalId;
    const userFirmed: User = await UserDAO.getUserById(userFirmedId)
    
    if (first_time !== undefined && typeof first_time === 'string') {
      var firstTime = await LiberaUtils.parseBooleanFromString(first_time)
    }

    if(!userId) throw new BadRequestException('SCF.LIBERA.57');

    if(userId === undefined || isNaN(+userId)) throw new BadRequestException('SCF.LIBERA.51', {userId});
    await UserService.liberaResendInvitation(+userId, userFirmed, firstTime);
    
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
            PermissionEnum.MANAGE_BOCC_USERS,
            PermissionEnum.REQUEST_DOCUMENTS
        ]
    }));

