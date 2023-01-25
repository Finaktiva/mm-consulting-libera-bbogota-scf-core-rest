import { Handler, Context } from "aws-lambda";
import { EnterpriseService } from "services/enterprise.service";

export const handler: Handler = async (_event: any, _context: Context) => {
  _context.callbackWaitsForEmptyEventLoop = false;
  console.log(`Handler: Starting ${_context.functionName}`);

  try {
    console.log(`Handler: Ending ${_context.functionName}`);
    
    await EnterpriseService.updateFinancingPlansStatusCRON();
  } catch (error) {
    console.log(error);  
  }

}
