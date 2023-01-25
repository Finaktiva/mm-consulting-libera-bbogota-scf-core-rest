const middy = require('middy');
import { APIGatewayProxyHandler, APIGatewayEvent, Context } from 'aws-lambda';
import Response from 'commons/response';
import { EnterpriseService } from 'services/enterprise.service';
import { handleException, BadRequestException } from 'commons/exceptions';
import { authorizerPermissions } from 'commons/middlewares/authorizer-permissions';
import { PermissionEnum } from 'commons/enums/permission.enum';

const originalHandler: APIGatewayProxyHandler = async (event: APIGatewayEvent, context: Context) => {
  try {
      console.log(`Handler: Starting ${context.functionName} `);
      const { enterpriseId } = event.pathParameters;
      const userId = event.requestContext.authorizer.principalId;

      if(!enterpriseId) throw new BadRequestException('SCF.LIBERA.29');
      if(enterpriseId === undefined || isNaN(+enterpriseId)) throw new BadRequestException('SCF.LIBERA.50', { enterpriseId });

      const enterprise = await EnterpriseService.getEnterpriseById(+enterpriseId, +userId);
      
      console.log(`Handler: Ending ${context.functionName} `);
      return Response.Ok(enterprise);
  }catch (errors) {
    console.log('HANDLER ERRORS: ', errors);
    return handleException(errors);
  }

}

export const handler = middy(originalHandler)
    .use(authorizerPermissions({
      permissions: [
          PermissionEnum.READ_ENTERPRISE_DETAIL,
          PermissionEnum.CREATE_FINANCING_PLAN,
          PermissionEnum.REQUEST_DOCUMENTS,
          PermissionEnum.UPLOAD_DOCUMENTS,
      ]
    }));