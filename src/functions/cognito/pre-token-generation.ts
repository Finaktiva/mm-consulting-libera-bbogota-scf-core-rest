import { CognitoUserPoolTriggerHandler, CognitoUserPoolTriggerEvent, Context, Callback } from 'aws-lambda';
import { UserService } from 'services/user.service';

export const handler: CognitoUserPoolTriggerHandler = async (event: CognitoUserPoolTriggerEvent, context: Context, cb: Callback) => {
    console.log(`HANDLER: Starting ${context.functionName}`);    
    context.callbackWaitsForEmptyEventLoop = false;
    console.log(`triggerSource ${event.triggerSource}`);
    try {
        if(event.triggerSource === 'TokenGeneration_NewPasswordChallenge') {
            const email = event.request.userAttributes['email'];
            console.log(`email: ${email}`);
            await UserService.preTokenGeneration(email);
        }
        return cb(null, event);
    }
    catch(errors) {
        console.log('HANDLER ERRORS: ', errors);
        return cb(new Error(JSON.stringify(errors)), null);
    }
}