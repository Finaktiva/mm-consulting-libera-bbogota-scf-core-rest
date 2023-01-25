import { APIGatewayProxyHandler, APIGatewayProxyEvent, Context } from 'aws-lambda';
import { handleException } from 'commons/exceptions';
import { IBankRegion } from 'commons/interfaces/catalogs';
import EnterprisesParser from 'commons/parsers/enterprises.parser';
import Response from 'commons/response';
import { CatalogService } from 'services/catalog.service';

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent, context: Context) => {
  console.log(`HANDLER: Starting ${context.functionName}`);
  try {
    let response  = await CatalogService.getAllRegions();
    let finalResult: IBankRegion[] = [];
    if(!(response.length < 1)){
      for (const region of response) {
        let newRegion: IBankRegion = EnterprisesParser.parseCatBankRegion(region);
        finalResult.push(newRegion);
      }
    }
    console.log(`HANDLER: Ending ${context.functionName}`);
    return Response.Ok(finalResult);
  } catch (errors) {
    console.error(errors);
    return handleException(errors);
  }
}