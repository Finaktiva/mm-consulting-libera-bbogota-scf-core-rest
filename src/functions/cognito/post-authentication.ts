import { Context, Callback, CognitoUserPoolTriggerHandler, CognitoUserPoolTriggerEvent} from 'aws-lambda';


export const handler: CognitoUserPoolTriggerHandler = async (event: CognitoUserPoolTriggerEvent, _context: Context, callback: Callback) => {
    return callback(null, event);
};