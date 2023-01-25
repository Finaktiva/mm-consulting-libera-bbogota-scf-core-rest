import { handleException } from 'commons/exceptions'
import { AuthenticationService } from 'services/authentication.service';

export const authorizerRoles = (config: any) => {
    return ({
        before: async (handler, next) => {
            console.log('MIDDLEWARE: Starting authorizerRoles  method');
            handler.context.callbackWaitsForEmptyEventLoop = false;
            const userId = handler.event.requestContext.authorizer.principalId;
            console.log('roles', config['roles']);
            await AuthenticationService.verifyRoles(userId, config['roles']);
            console.log('MIDDLEWARE: Ending authorizerRoles  method');
        },
        onError: async (handler, next) => {
            console.log('onError: ', handler.error);
            const e = handleException(handler.error);
            return handler.callback(null, e);
        }
    });
}