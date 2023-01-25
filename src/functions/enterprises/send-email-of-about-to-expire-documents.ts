import { Handler, Context } from "aws-lambda";
import { EnterpriseDocumentationService } from 'services/enterprise-documentation.service';


export const handler: Handler = async (_event: any, _context: Context) => {
  _context.callbackWaitsForEmptyEventLoop = false;
  console.log(`Handler: Starting ${_context.functionName}`);

  try {
    console.log(`Handler: Ending ${_context.functionName}`);
    
    await EnterpriseDocumentationService.sendEmailofAboutToExpireDocuments();
  } catch (error) {
    console.log(error);  
  }

}
