import { CognitoUserPoolTriggerHandler, CognitoUserPoolTriggerEvent, Context, Callback } from 'aws-lambda';
import { UserService } from 'services/user.service';
import { BadRequestException, handleException } from 'commons/exceptions';
import LiberaUtils from 'commons/libera.utils';


export const handler: CognitoUserPoolTriggerHandler = async (event: CognitoUserPoolTriggerEvent , _context: Context, cb: Callback) => {
    console.log(`HANDLER: Starting ${_context.functionName}...`);
    console.log(`TriggerSource ${event.triggerSource}`);
    console.log('event:  ', event);
    
    _context.callbackWaitsForEmptyEventLoop = false;
    
    try {
        if(event.triggerSource === 'PreSignUp_SignUp'){
            console.log('request: ', event.request);
            const email = event.request.userAttributes['email'];
            const businessName = event.request.userAttributes['custom:business_name'];
            const nit = event.request.userAttributes['custom:nit']

            if (!email) throw new BadRequestException('SCF.LIBERA.05');
            if(!businessName)  throw new BadRequestException('SCF.LIBERA.06');
            if(!nit) throw new BadRequestException('SCF.LIBERA.07');

            if(!LiberaUtils.validationEmailFormat(email)) throw new BadRequestException('SCF.LIBERA.306', {email});
            if(!LiberaUtils.isNitValid(nit)) throw new BadRequestException('SCF.LIBERA.11', {nit});

            await UserService.saveUser({email, businessName, nit});
        }

        if(event.triggerSource === 'PreSignUp_ExternalProvider'){
            const email = event.request.userAttributes['email'];
            const userCognitoName = event.userName
            await UserService.createFederalLiberaUser(email, userCognitoName)

        }
        console.log(`HANDLER Ending ${_context.functionName}...`);
        return cb(null, event);
    } 
    catch (errors) {
        console.log(`HANDLER ERRORS: ${errors}`);
        let parserException = handleException(errors);
        return cb(new Error(JSON.stringify(parserException)), null);
    }
};
