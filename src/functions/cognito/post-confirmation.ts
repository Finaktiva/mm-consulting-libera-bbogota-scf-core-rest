import { CognitoUserPoolTriggerHandler, CognitoUserPoolTriggerEvent, Context, Callback } from 'aws-lambda';
import { UserService } from 'services/user.service';
import { UserTokenTypeEnum } from 'commons/enums/user-token-type.enum';
import { UserTypeEnum } from 'commons/enums/user-type.enum';

export const handler: CognitoUserPoolTriggerHandler = async (event: CognitoUserPoolTriggerEvent, context: Context, cb: Callback) => {
    context.callbackWaitsForEmptyEventLoop = false;
    console.log(`HANDLER: Starting ${context.functionName}`);
    console.log(`triggerSource ${event.triggerSource}`);
    console.log('event : ', event);
    try {
        if(event.triggerSource === 'PostConfirmation_ConfirmSignUp') {
            const email = event.request.userAttributes['email'];
            console.log(`email: ${email}`);

            const user = await UserService.getUserByEmail(email);

            if(user.type === UserTypeEnum.LIBERA_USER){
                await UserService.confirmSignUpLiberaUser(user,event);
            }
            else{
                await UserService.confirmationAccount(email);
            }
        }

        return cb(null, event);
    }
    catch(errors) {
        console.log('HANDLER ERRORS: ', errors);
        return cb(new Error(JSON.stringify(errors)), null);
    }
}