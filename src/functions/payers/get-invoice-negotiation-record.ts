import { APIGatewayProxyHandler, APIGatewayProxyEvent, Context } from 'aws-lambda';
import Response from 'commons/response';
import { handleException, BadRequestException } from 'commons/exceptions';
import { authorizerRoles } from 'commons/middlewares/authorizer-roles';
import { RoleEnum } from 'commons/enums/role.enum';
import { PayerService } from 'services/payer.service';

const middy = require('middy');

const originalHandler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent, context: Context) => {
    console.log(`HANDLER: Starting ${context.functionName}...`);
    try {    
        const enterpriseId = event.pathParameters['enterpriseId'] ? parseInt(event.pathParameters['enterpriseId']) : null;
        const negotiationId = event.pathParameters['negotiationId'] ? parseInt(event.pathParameters['negotiationId']) : null;
        const invoiceId = event.pathParameters['invoiceId'] ? parseInt(event.pathParameters['invoiceId']) : null;
        
        if(!enterpriseId)
            throw new BadRequestException('SCF.LIBERA.159');

        if(!negotiationId)
            throw new BadRequestException('SCF.LIBERA.160');

        if(!invoiceId)
            throw new BadRequestException('SCF.LIBERA.161');
        
        const result = await PayerService.getPayerInvoicesNegociationRecord(enterpriseId, invoiceId, negotiationId);

        return Response.Ok(result);
    }
    catch (error) {
        console.log('ERRORS: ' , error);
        return handleException(error);
    }
};

export const handler = middy(originalHandler)
    .use(authorizerRoles({
        roles: [
            RoleEnum.ENTERPRISE_CONSOLE_ADMIN,
            RoleEnum.ENTERPRISE_PAYER_ADMIN
        ]
    }));