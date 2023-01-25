const middy = require('middy')
import { APIGatewayEvent, APIGatewayProxyHandler, Context } from "aws-lambda";
import { BadRequestException, ForbiddenException, handleException } from "commons/exceptions";
import Response from 'commons/response';
import { PermissionEnum } from 'commons/enums/permission.enum';
import { authorizerPermissions } from 'commons/middlewares/authorizer-permissions';
import { FinancingPlanStatusActionsEnum } from "commons/enums/financing-plan-status-actions.enum";
import { EnterpriseService } from "services/enterprise.service";
import ValidatorUtilities from "commons/utils/validator";

const originalHandler: APIGatewayProxyHandler = async (event: APIGatewayEvent, context: Context) => {
  try {
    console.log(`Handler: Starting ${context.functionName} `);
    const userId = +event.requestContext.authorizer['principalId'];

    const requestBody = JSON.parse(event.body);
    console.log(requestBody);

    const { status, comments } = requestBody;
    const { financingPlanId, enterpriseId } = event.pathParameters;

    if (!await ValidatorUtilities.enterpriseFinancingPlanValidator(+enterpriseId, +userId))
      throw new ForbiddenException('SCF.LIBERA.COMMON.403.01');

    if (!status)
      throw new BadRequestException('SFC.LIBERA.364');

    if (!FinancingPlanStatusActionsEnum[status])
      throw new BadRequestException('SFC.LIBERA.376', { status });

    if (FinancingPlanStatusActionsEnum.DECLINE === status && !comments)
      throw new BadRequestException('SFC.LIBERA.377');

    if (FinancingPlanStatusActionsEnum.APPROVE === status && comments)
      throw new BadRequestException('SFC.LIBERA.378');

    if (comments && comments.length > 200)
      throw new BadRequestException('SFC.LIBERA.379');

    const newStatus = await EnterpriseService.updateStatusFinancingPlan(+financingPlanId, +userId, status, comments);

    console.log(`Handler: Ending ${context.functionName} `);
    return Response.Ok({ status: newStatus });
  } catch (errors) {
    console.log('HANDLER ERRORS: ', errors);
    return handleException(errors);
  }
}

export const handler = middy(originalHandler)
  .use(authorizerPermissions({
    permissions: [
      PermissionEnum.UPDATE_ENTERPRISE,
      PermissionEnum.CREATE_PROVIDER,
      PermissionEnum.CREATE_ENTERPRISE
    ]
  }));