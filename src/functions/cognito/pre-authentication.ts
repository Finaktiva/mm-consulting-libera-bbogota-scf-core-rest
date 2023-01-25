import { CognitoUserPoolTriggerHandler, CognitoUserPoolTriggerEvent, Context, Callback} from 'aws-lambda';

import { handleException, BadRequestException} from 'commons/exceptions';
import { CognitoService } from 'services/cognito.service';

export const handler: CognitoUserPoolTriggerHandler = async (event: CognitoUserPoolTriggerEvent, context: Context, callback: Callback) => {
    console.log(`HANDLER: Starting ${context.functionName}...`);
    context.callbackWaitsForEmptyEventLoop = false;
    console.log(`Trigger Source: ${event.triggerSource}`);
    console.log('event',event);

    let email = event.request.userAttributes['email'];
    console.log(`user email ${email}`);
    console.log('event : ', event);

    try {
        if (event.triggerSource === 'PreAuthentication_Authentication') {

            if (!event.request.userAttributes && !email)
                throw new BadRequestException('SCF.LIBERA.COMMON.400', { errors: "no email provided" });

            await CognitoService.verifyUserIdentityByEmail(email);
        }
        return callback(null, event);
        
    } catch(error) {
        const parsedException = handleException(error);
        return callback(new Error("## "+JSON.stringify(parsedException)),null);

    }

};