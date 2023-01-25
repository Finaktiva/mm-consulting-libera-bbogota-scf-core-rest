import { IEnterpriseLinks } from 'commons/interfaces/enterprise-link.interface';
import { EnterpriseLinkService } from 'services/enterprise-link.service';

export const handler = async (event, context) => {
    console.log(`HANDLER: Starting ${context.functionName}`);
    context.callbackWaitsForEmptyEventLoop = false;
    const records = event.Records;
    console.log(records);
    if(!records.length) 
        return;

    const body = JSON.parse(records[0].body);
    const enterpriseLink: IEnterpriseLinks = body;
    
    await EnterpriseLinkService.save(enterpriseLink);
    
    console.log(`HANDLER: Ending ${context.functionName}`);
}