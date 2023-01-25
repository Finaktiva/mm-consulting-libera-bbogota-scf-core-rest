import { APIGatewayProxyEvent, Context, Handler } from "aws-lambda";
import { EnterpriseService } from "services/enterprise.service";


export const handler: Handler = async (_event: APIGatewayProxyEvent, _context: Context) => {
    console.log(`Handler: Starting ${_context.functionName}`);

    try {
      const trmnalId = '127.0.0.1';
      
      await EnterpriseService.updateEnabledEnterprises(trmnalId);
      console.log(`Handler: Ending ${_context.functionName}`);
    } catch (error) {
      console.log(error);  
    }

}
