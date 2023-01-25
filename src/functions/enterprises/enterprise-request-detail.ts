const middy = require('middy');
import { APIGatewayProxyHandler, APIGatewayProxyEvent, Context } from 'aws-lambda';
import { EnterpriseService } from 'services/enterprise.service';
import { BadRequestException, handleException } from 'commons/exceptions';
import Response from 'commons/response';
import { authorizerPermissions } from 'commons/middlewares/authorizer-permissions';
import { PermissionEnum } from 'commons/enums/permission.enum';

const originalHandler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent, context: Context) => {
  console.log(`HANDLER: Starting ${context.functionName}...`);
  try {
    if (!event.pathParameters) throw new BadRequestException('SCF.LIBERA.17');
    const { requestId } = event.pathParameters;

    if (!requestId) throw new BadRequestException('SCF.LIBERA.80');
    if (isNaN(+requestId) || requestId == undefined || requestId == null) throw new BadRequestException('SCF.LIBERA.81', { requestId });

    const requestDetail = await EnterpriseService.getEnterpriseRequestDetail(+requestId);
    console.log(`HANDLER: Ending ${context.functionName}...`);
    return Response.Ok(requestDetail);

  }
  catch (errors) {
    console.log('HANDLER ERROR: ', errors);
    return handleException(errors);
  }
}

export const handler = middy(originalHandler)
    .use(authorizerPermissions({
        permissions: [
            PermissionEnum.READ_ENTERPRISE_LINKINGS_LIST
        ]
}));