import { APIGatewayProxyHandler, APIGatewayProxyEvent, Context } from 'aws-lambda';
import Response from 'commons/response';
import { authorizerRoles } from 'commons/middlewares/authorizer-roles';
import { RoleEnum } from 'commons/enums/role.enum';
import { handleException, BadRequestException } from 'commons/exceptions';
import { EnterpriseInvoiceNegotiationService } from 'services/enterprise-invoice-negotiation.service';
import { BulkDiscountRequestInterface } from 'commons/interfaces/provider-interfaces/bulk-discount-request.interface';

const middy = require('middy');

const originalHandler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent, context : Context) => {
    console.log(`HANDLER: Starting ${context.functionName}...`);

    try{
        const { enterpriseId, bulkNegotiationId } = event.pathParameters;

        if (!enterpriseId) throw new BadRequestException('SCF.LIBERA.29');
        if (!bulkNegotiationId) throw new BadRequestException('SCF.LIBERA.249');

        console.log(`enterpriseId received >>>>> ${enterpriseId} `);
        console.log(`bulkNegotiationId >>>>> ${bulkNegotiationId} `);

        if (isNaN(+enterpriseId)) throw new BadRequestException('SCF.LIBERA.50', { enterpriseId });
        if (isNaN(+bulkNegotiationId)) throw new BadRequestException('SCF.LIBERA.250');
        if (+enterpriseId < 1) throw new BadRequestException('SCF.LIBERA.251', { enterpriseId });
        if (+bulkNegotiationId < 1) throw new BadRequestException('SCF.LIBERA.252', { bulkNegotiationId });

        const bulkNegotiationRequest:BulkDiscountRequestInterface =
            await EnterpriseInvoiceNegotiationService.getBulkNegotiationRequestById(
                +enterpriseId, +bulkNegotiationId);

        console.log(`HANDLER: Ending ${context.functionName}...`);

        return Response.Ok(bulkNegotiationRequest);
    }
    catch(error){
        console.log('HANDLER ERROR: ', error);
        return handleException(error);
    }
}

export const handler = middy(originalHandler)
    .use(authorizerRoles({
        roles: [
            RoleEnum.ENTERPRISE_PROVIDER_ADMIN
        ]
    })
);