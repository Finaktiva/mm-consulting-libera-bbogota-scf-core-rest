const middy = require('middy');
import { APIGatewayProxyHandler, APIGatewayEvent, Context } from 'aws-lambda';
import Response from 'commons/response';
import { EnterpriseService } from 'services/enterprise.service';
import { handleException, BadRequestException, UnAuthorizedException, ForbiddenException } from 'commons/exceptions';
import { authorizerPermissions } from 'commons/middlewares/authorizer-permissions';
import { PermissionEnum } from 'commons/enums/permission.enum';
import ValidatorUtilities from 'commons/utils/validator';

const originalHandler: APIGatewayProxyHandler = async (event: APIGatewayEvent, context: Context) => {
  try {
    console.log(`Handler: Starting ${context.functionName} `);
    const userId = event.requestContext.authorizer.principalId;
    const { financingPlanId, enterpriseId } = event.pathParameters;

    if (!await ValidatorUtilities.enterpriseFinancingPlanValidator(+enterpriseId, +userId)) 
      throw new ForbiddenException('SCF.LIBERA.COMMON.403.01');
    if(!financingPlanId) throw new BadRequestException('SCF.LIBERA.335');
    const financingPlanDetail = await EnterpriseService.getFinancingPlanDetail(+financingPlanId, userId);
    
    console.log(`Handler: Ending ${context.functionName} `);
    return Response.Ok(financingPlanDetail);
  }catch (errors) {
    console.log('HANDLER ERRORS: ', errors);
    return handleException(errors);
  }
}

export const handler = middy(originalHandler)
  .use(authorizerPermissions({
    permissions: [
        PermissionEnum.READ_FINANCING_PLAN_LIST
    ]
  }));