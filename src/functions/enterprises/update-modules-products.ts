const middy = require('middy');
import { APIGatewayProxyEvent, APIGatewayProxyHandler, Context } from 'aws-lambda';
import { PermissionEnum } from 'commons/enums/permission.enum';
import { BadRequestException, handleException } from 'commons/exceptions';
import { authorizerPermissions } from 'commons/middlewares/authorizer-permissions';
import Response from 'commons/response';
import ValidatorUtilities from 'commons/utils/validator';
import { EnterpriseService } from 'services/enterprise.service';

const originalHandler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent, context: Context) => {
  console.log(`HANDLER: Starting ${context.functionName}...`);
  try {
    const { enterpriseId } = event.pathParameters;
    const requestBody = JSON.parse(event.body);
    console.log('requestBody ============>', requestBody)
    
    const validationReq: boolean = await ValidatorUtilities.updateEnterpriseRequestBodyValidator(requestBody);
    if (validationReq) {
        console.log("---> Validation success!!");
    } else {
        throw new BadRequestException('SCF.LIBERA.COMMON.400.01');
    }

    if(!enterpriseId) throw new BadRequestException('SCF.LIBERA.29');
    await EnterpriseService.updateModulesProducts(+enterpriseId, requestBody);

    console.log(`HANDLER: Ending ${context.functionName}...`);
    return Response.NoContent();
  } catch (errors) {
    console.log(`HANDLER ERROR: ${errors}`);
    return handleException(errors);
  }
}

export const handler = middy(originalHandler)
  .use(authorizerPermissions({
    permissions: [
      PermissionEnum.CREATE_ENTERPRISE
    ]
  }));