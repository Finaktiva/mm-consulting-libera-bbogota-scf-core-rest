const middy = require('middy');
import { APIGatewayProxyHandler, APIGatewayProxyEvent, Context } from 'aws-lambda';
import { BadRequestException, handleException } from 'commons/exceptions';
import Response from 'commons/response';
import { EnterpriseService } from 'services/enterprise.service';
import { authorizerRoles } from 'commons/middlewares/authorizer-roles';
import { RoleEnum } from 'commons/enums/role.enum';
import { authorizerPermissions } from 'commons/middlewares/authorizer-permissions';
import { PermissionEnum } from 'commons/enums/permission.enum';


export const originalHandler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent, context : Context) => {
  console.log(`HANDLER: Starting ${context.functionName}`);

  try {
    if(!event.queryStringParameters) throw new BadRequestException('SCF.LIBERA.17');
    const { enterprise_id } = event.queryStringParameters;
    
    const enterprises = await EnterpriseService.getEnterprisePayers(+enterprise_id);
    
    console.log(`HANDLER: Ending ${context.functionName}`);
    return Response.Ok(enterprises);
  }
  catch(errors) {
    console.log('HANDLER ERRORS: ', errors);
    return handleException(errors);
  }
    
}


export const handler = middy(originalHandler)
  .use(authorizerPermissions({
    permissions: [
        PermissionEnum.UPDATE_FINANCING_PLAN,
        PermissionEnum.CREATE_FINANCING_PLAN
    ]
  }));