const middy = require('middy');
import { APIGatewayProxyHandler, APIGatewayProxyEvent, Context } from 'aws-lambda';
import { BadRequestException, handleException } from 'commons/exceptions';
import Response from 'commons/response';
import { BanlancesAndLoansService } from 'services/balances-and-loans.service';
import { authorizerPermissions } from 'commons/middlewares/authorizer-permissions';
import { PermissionEnum } from 'commons/enums/permission.enum';


const originalHandler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent, context: Context) => {
  console.log(`HANDLER: Starting ${context.functionName}`);
  try {
    let loanNumber = null;
    event.queryStringParameters ? { loanNumber } = event.queryStringParameters : null;
    const trmnalId = event.requestContext.identity.sourceIp;

    if (!loanNumber) throw new BadRequestException('SCF.LIBERA.385');
    const response = await BanlancesAndLoansService.getInformation(trmnalId, loanNumber);
    console.log('response ==> ', response);

    console.log(`HANDLER: Ending ${context.functionName}`);
    return Response.Ok(response);
  } catch (errors) {
    console.log('HANDLER ERRORS: ', errors);
    return handleException(errors);
  }
}

export const handler = middy(originalHandler)
  .use(authorizerPermissions({
    permissions: [
      PermissionEnum.CONSULT_OBLIGATION
    ]
  }));