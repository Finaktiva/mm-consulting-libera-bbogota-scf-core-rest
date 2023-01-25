import { APIGatewayProxyHandler, APIGatewayEvent, Context } from 'aws-lambda';
import Response from 'commons/response';
import { handleException } from 'commons/exceptions';
import { MeService } from 'services/me.service';
import { MeParsers } from 'commons/parsers/me.parsers';
import { UserRole } from 'entities/user-role';
import { IRolesPermissions } from 'commons/interfaces/me-interfaces/reponse-roles-permissions.interface';


export const handler: APIGatewayProxyHandler = async (event: APIGatewayEvent, context: Context) => {
    console.log(`Handler: Starting ${context.functionName} `);
    try {
        const userId = event.requestContext.authorizer.principalId;

        const response: UserRole[] = await MeService.getRolesPermissionsByUserId(+userId);

        const responseParsed: IRolesPermissions[] = MeParsers.parseRolesWithPermissions(response);

        console.log(`Handler: Ending ${context.functionName} `);
        return Response.Ok(responseParsed);
    }
    catch (errors) {
        console.log('HANDLER ERRORS: ', errors);
        return handleException(errors);
    }

}