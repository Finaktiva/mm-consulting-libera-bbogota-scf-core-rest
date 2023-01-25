import { APIGatewayProxyHandler, APIGatewayEvent, Context } from 'aws-lambda';
import Response from 'commons/response';
import { handleException, BadRequestException } from 'commons/exceptions';
import { CiiuCodesService } from 'services/ciiu-codes.service';
import EnterprisesParser from 'commons/parsers/enterprises.parser';

export const handler: APIGatewayProxyHandler = async (event: APIGatewayEvent, context: Context) => {
  try {
    console.log(`Handler: Starting ${context.functionName} `);
    const { ciiuCode } = event.pathParameters;

    if(!ciiuCode) throw new BadRequestException('SCF.LIBERA.279');
    if(ciiuCode === undefined ) throw new BadRequestException('SCF.LIBERA.279');
    const record = await CiiuCodesService.getCiiuCodesRequest(ciiuCode);
    const response = EnterprisesParser.parseEconomicActivity(record);

    console.log(`Handler: Ending ${context.functionName} `);
    return Response.Ok(response);
  }catch (errors) {
    console.log('HANDLER ERRORS: ', errors);
    return handleException(errors);
  }
}