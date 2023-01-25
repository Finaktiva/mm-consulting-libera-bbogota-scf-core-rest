const middy = require('middy');
import { APIGatewayProxyHandler, APIGatewayEvent, Context } from 'aws-lambda';
import { authorizerRoles } from 'commons/middlewares/authorizer-roles';
import { RoleEnum } from 'commons/enums/role.enum';
import { BadRequestException, handleException } from 'commons/exceptions';
import Response from 'commons/response';
import { PayerService } from 'services/payer.service';
import { CreateNewFundingRequest } from 'commons/interfaces/payer-interfaces/create-new-funding-request.interface';


export const originalHandler: APIGatewayProxyHandler = async (event: APIGatewayEvent, context: Context) => {
    console.log(`HANDLER: Starting ${context.functionName}...`);

    try {
        if (!event.pathParameters) throw new BadRequestException('SCF.LIBERA.COMMON.400');
        const { enterpriseId, invoiceId } = event.pathParameters;
        const userId = event.requestContext.authorizer['principalId'];
        const body: CreateNewFundingRequest = JSON.parse(event.body);

        if (!enterpriseId) throw new BadRequestException('SCF.LIBERA.29');
        if (enterpriseId === undefined || isNaN(+enterpriseId)) throw new BadRequestException('SCF.LIBERA.50', { enterpriseId });
        if (!invoiceId) throw new BadRequestException('SCF.LIBERA.124');
        if (invoiceId === undefined || isNaN(+invoiceId)) throw new BadRequestException('SCF.LIBERA.125', { invoiceId });
        if (!body) throw new BadRequestException('SCF.LIBERA.49');

        const result = await PayerService.createNewFundingRequest(+enterpriseId, +invoiceId, body, +userId);

        console.log(`HANDLER: Ending ${context.functionName}...`);
        return Response.Created(result);
    }
    catch (errors) {
        console.log('HANDLER ERRORS: ', errors);
        return handleException(errors);
    }
}

export const handler = middy(originalHandler)
    .use(authorizerRoles({
        roles: [
            RoleEnum.ENTERPRISE_CONSOLE_ADMIN,
            RoleEnum.ENTERPRISE_PAYER_ADMIN
        ]
    }));