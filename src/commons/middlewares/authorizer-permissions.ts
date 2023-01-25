import { handleException } from "commons/exceptions";
import { AuthenticationService } from "services/authentication.service";

export const authorizerPermissions = (config: any) => {
    return ({
        before: async (handler, next) => {
            console.log('MIDDLEWARE: Starting authorizerPermissions  method');
            handler.context.callbackWaitsForEmptyEventLoop = false;
            const userId = handler.event.requestContext.authorizer.principalId;
            console.log('permissions', config['permissions']);
            console.log('userId', userId);
            await AuthenticationService.verifyPermissions(userId, config['permissions']);
            console.log('MIDDLEWARE: Ending authorizerPermissions  method');
        },
        onError: async (handler, next) => {
            console.log('onError: ', handler.error);
            const e = handleException(handler.error);
            return handler.callback(null, e);
        }
    });
}