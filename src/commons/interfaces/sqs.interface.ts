export interface SQSMetadata {
    sqsUrl: string,
    body: {[name: string]: any} | [{[name: string]: any}] | any
}