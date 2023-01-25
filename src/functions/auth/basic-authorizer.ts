import { CustomAuthorizerEvent, Context, CustomAuthorizerHandler } from 'aws-lambda';
import { AuthenticationService } from 'services/authentication.service';
import { CognitoService }  from 'services/cognito.service';
import { handleException, UnAuthorizedException } from 'commons/exceptions';

export const handler = async (event: CustomAuthorizerEvent, context: Context, callback) => {
    console.log(`HANDLER: Starting ${context.functionName} method`);
    context.callbackWaitsForEmptyEventLoop = false;
    try {
        if(!event.authorizationToken) {
            throw new UnAuthorizedException('SCF.LIBERA.COMMON.401');
        }
        
        const token = event.authorizationToken.split(' ')[1];
        const principal = await AuthenticationService.getPrincipal(token,event.methodArn);
        const email = principal.context.email;
        const userId = await CognitoService.getUserIdentifierByEmail(email);

        principal.principalId = userId;

        console.log('principal ', principal);
        console.log(`HANDLER: Ending ${context.functionName}...`);
        return callback(null,principal);
    }
    catch(errors) {
        console.log(`HANDLER ERRORS: ${JSON.stringify(errors)}`);
        return callback('Unauthorized', null);
    }

};
  