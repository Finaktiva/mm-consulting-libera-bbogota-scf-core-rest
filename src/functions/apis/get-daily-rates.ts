const middy = require('middy');
import { APIGatewayProxyHandler, APIGatewayEvent, Context } from 'aws-lambda';
import Response from 'commons/response';
import { handleException, BadRequestException } from 'commons/exceptions';
import { ApisService } from 'services/apis.service';
import { ApisRateTypeEnum } from 'commons/enums/apis.enum';
import { authorizerPermissions } from 'commons/middlewares/authorizer-permissions';
import { PermissionEnum } from 'commons/enums/permission.enum';

const originalHandler: APIGatewayProxyHandler = async (event: APIGatewayEvent, context: Context) => {
  try {
    console.log(`Handler: Starting ${context.functionName} `);
    let type = null;
    event.queryStringParameters ? { type } = event.queryStringParameters : null

    if (type && !(type in ApisRateTypeEnum)) throw new BadRequestException('SCF.LIBERA.340', { type });
    const dailyRates = await ApisService.getDailyRates(type);
    
    console.log(`Handler: Ending ${context.functionName} `);
    return Response.Ok(dailyRates);
  }catch (errors) {
    console.log('HANDLER ERRORS: ', errors);
    return handleException(errors);
  }
}

export const handler = middy(originalHandler)
  .use(authorizerPermissions({
    permissions: [
        PermissionEnum.CREATE_FINANCING_PLAN,
        PermissionEnum.UPDATE_FINANCING_PLAN
    ]
  }));
