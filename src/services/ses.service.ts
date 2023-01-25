import { InternalServerException } from 'commons/exceptions';
import * as AWS from 'aws-sdk';
const region = process.env.SES_REGION;
const apiVersion = process.env.SES_API_VERSION;
const Charset = process.env.SES_CHARSET;
const Source = process.env.SES_SOURCE;
AWS.config.update({region});
const SES = new AWS.SES({apiVersion});

export class SESService {

    static async sendEmail(options: {destinationEmail: string, messageBody: string, subject: string}) {
        console.log('SERVICE: Starting sendEmail');
        try {
            const params: any = {
                Destination: {
                    ToAddresses: [
                        options.destinationEmail
                    ]
                }, 
                Message: {
                    Body: {
                        Text: {
                            Charset,
                            Data: options.messageBody
                        }
                    },
                    Subject: {
                        Charset,
                        Data: options.subject
                    }
                },
                Source
            };

            await await SES.sendEmail(params).promise();
            console.log('SERVICE: Ending sendEmail');
        } catch (errors) {
            console.log('SERVICE ERROR: ', errors);
            throw new InternalServerException('SCF.LIBERA.COMMON.500', {errors});
        }
    }

    static async sendTemplatedEmail(options: {template: string, destinationEmail: string, mergeVariables?: {[key: string]: any}}) {
        console.log('SERVICE: Starting sendTemplatedEmail');
        
        try {
            const params: any = {
                Destination: {
                    ToAddresses: [
                        options.destinationEmail
                    ]
                },
                Source,
                Template: options.template,
                TemplateData: JSON.stringify(options.mergeVariables || {})
            };
            await await SES.sendTemplatedEmail(params).promise();
            
            console.log('SERVICE: Ending sendTemplatedEmail');
        } catch (errors) {
            console.log('SERVICE ERROR: ', errors);
            throw new InternalServerException('SCF.LIBERA.COMMON.500', {errors});
        }
    }
    
    static async sendBulkTemplatedEmail(options: {template: string, destinationEmails: string[], ReplacementTemplateData: string}) {
        console.log('SERVICE: Starting sendBulkTemplatedEmail');
        
        try {
            const destinationEmails = options.destinationEmails;
            const destinationEmailsChunks = [];
            for (let i = 0; i < destinationEmails.length; i += 50) {
                destinationEmailsChunks.push(destinationEmails.slice(i, i + 50));
            }

            for (const destinationEmailsChunk of destinationEmailsChunks) {
                const params: any = {
                    Destinations: [{
                        Destination: {
                            BccAddresses: destinationEmailsChunk
                        },
                        ReplacementTemplateData: options.ReplacementTemplateData
                    }],
                    Source,
                    Template: options.template,
                    DefaultTemplateData: JSON.stringify({})
                };
            await await SES.sendBulkTemplatedEmail(params).promise();
            console.log(`Lot #${destinationEmailsChunks.indexOf(destinationEmailsChunk) + 1} of ${destinationEmailsChunks.length} sent`);
        }
            
            console.log('SERVICE: Ending sendBulkTemplatedEmail');
        } catch (errors) {
            console.log('SERVICE ERROR: ', errors);
            throw new InternalServerException('SCF.LIBERA.COMMON.500', {errors});
        }
    }
}