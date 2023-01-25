const middy = require('middy');
import { APIGatewayProxyHandler, APIGatewayEvent, Context } from 'aws-lambda';
import Response from 'commons/response';
import { EnterpriseService } from 'services/enterprise.service';
import { handleException, BadRequestException } from 'commons/exceptions';
import { authorizerPermissions } from 'commons/middlewares/authorizer-permissions';
import { PermissionEnum } from 'commons/enums/permission.enum';

const originalHandler: APIGatewayProxyHandler = async (event: APIGatewayEvent, context: Context) => {
  console.log(`Handler: Starting ${context.functionName} `);
  try {
      const { enterpriseId } = event.pathParameters;

      if(!enterpriseId) throw new BadRequestException('SCF.LIBERA.29');
      if(enterpriseId === undefined || isNaN(+enterpriseId)) throw new BadRequestException('SCF.LIBERA.50', { enterpriseId });

      const record = await EnterpriseService.getEnterpriseRecord(+enterpriseId);
      
      console.log(`Handler: Ending ${context.functionName} `);
      return Response.Ok(record);
  }catch (errors) {
    console.log('HANDLER ERRORS: ', errors);
    return handleException(errors);
  }

}

export const handler = middy(originalHandler)
    .use(authorizerPermissions({
      permissions: [
          PermissionEnum.READ_ENTERPRISE_DETAIL,
          PermissionEnum.READ_ENTERPRISE_LIST
      ]
    }));