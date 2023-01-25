import { IEnterpriseLinks } from 'commons/interfaces/enterprise-link.interface';
import { SQSService } from 'services/sqs.service';
import { EnterpriseLinkService } from 'services/enterprise-link.service';
import { SQSMetadata } from 'commons/interfaces/sqs.interface';
import { EnterpriseService } from 'services/enterprise.service';
const SQS_LIBERA_ENTERPRISE_REQUEST_QUEUE = process.env.SQS_LIBERA_ENTERPRISE_REQUEST_QUEUE;

export const handler = async (event, context) => {
    console.log(`HANDLER: Starting ${context.functionName} method`);
    context.callbackWaitsForEmptyEventLoop = false;
    const records = event.Records;
    console.log('recors:', records);
    if (!records.length)
        return;

    let enterprisesLinks: IEnterpriseLinks[] = await EnterpriseLinkService.verify(JSON.parse(records[0].body));

    try {
        for (const enterpriseLinks of enterprisesLinks) {
            await EnterpriseService.delay(100);
            const sqsMetadata: SQSMetadata = {
                sqsUrl: SQS_LIBERA_ENTERPRISE_REQUEST_QUEUE,
                body: enterpriseLinks
            };
            await SQSService.sendMessage(sqsMetadata);
        }
        while (enterprisesLinks.length > 0){
            enterprisesLinks = await EnterpriseLinkService.verify(JSON.parse(records[0].body));
            await EnterpriseService.delay(1000);
        }
    }
    catch (errors) {
        console.log('errors: ', errors);
    }
    console.log(`HANDLER: Ending ${context.functionName} method`);
}