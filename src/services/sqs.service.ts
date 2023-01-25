import * as AWS from 'aws-sdk';
import { SQSMetadata } from 'commons/interfaces/sqs.interface';
const SQS = new AWS.SQS({ apiVersion: '2012-11-05'});

export class SQSService {

    static async sendMessage(sqsMetadata: SQSMetadata) {
        console.log('SERVICE: Starting sendMessage method');
        const params = {
            QueueUrl: sqsMetadata.sqsUrl,
            MessageBody: JSON.stringify(sqsMetadata.body)
        };

        try {
            const result = await await SQS.sendMessage(params).promise();
            console.log('result:', result);
        }
        catch(errors) {
            console.log('errors:', errors);
            throw new Error(errors.message);
        }
        console.log('SERVICE: Ending sendMessage method');
    }
}