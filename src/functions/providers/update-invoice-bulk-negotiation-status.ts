import { APIGatewayProxyHandler, APIGatewayProxyEvent, Context } from 'aws-lambda';
import { BadRequestException, handleException } from 'commons/exceptions';
import Response from 'commons/response';
import { authorizerRoles } from 'commons/middlewares/authorizer-roles';
import { RoleEnum } from 'commons/enums/role.enum';
import { parseNegotiationUpdateProcessStatus, EnterpriseInvoiceNegotiationProcessStatus }
    from 'commons/enums/enterprise-invoice-negotiation-process-status.enum';
import { EnterpriseInvoiceBulkNegotiationService } from 'services/enterprise-invoice-bulk-negotiation.service';
import { isValidDiscountType } from 'commons/enums/negotiation-process-discount-type.enum';
import LiberaUtils from 'commons/libera.utils';

const middy = require('middy');

const originalHandler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent, context: Context) => {
    console.log(`HANDLER: Starting ${context.functionName}...`);

    try {
        if(!event.body) throw new BadRequestException('SCF.LIBERA.49');
        if (!event.pathParameters) throw new BadRequestException('SCF.LIBERA.COMMON.400');

        const { enterpriseId, bulkNegotiationId } = event.pathParameters;
        const { status, newOffer } = JSON.parse(event.body);
        const userId = +event.requestContext.authorizer['principalId'];

        if (!enterpriseId || enterpriseId === undefined) throw new BadRequestException('SCF.LIBERA.29');
        if (!bulkNegotiationId || bulkNegotiationId === undefined)
            throw new BadRequestException('SCF.LIBERA.249');
        if (isNaN(+enterpriseId)) throw new BadRequestException('SCF.LIBERA.50', { enterpriseId });
        if (isNaN(+bulkNegotiationId)) throw new BadRequestException('SCF.LIBERA.250', { bulkNegotiationId });
        if(+enterpriseId < 1)
            throw new BadRequestException('SCF.LIBERA.251', { enterpriseId });
        if(+bulkNegotiationId < 1)
            throw new BadRequestException('SCF.LIBERA.252', { bulkNegotiationId });
        if(!status) throw new BadRequestException('SCF.LIBERA.31');
        if(status && !parseNegotiationUpdateProcessStatus(status))
            throw new BadRequestException('SCF.LIBERA.39', { status });
        if (status == EnterpriseInvoiceNegotiationProcessStatus.COUNTEROFFERED && !newOffer)
            throw new BadRequestException('SCF.LIBERA.255', { status });
        if(newOffer && !newOffer.discountType || newOffer && !isValidDiscountType(newOffer.discountType)) 
            throw new BadRequestException('SCF.LIBERA.262');
        if(newOffer && !newOffer.percentage || newOffer && isNaN(+newOffer.percentage))
            throw new BadRequestException('SCF.LIBERA.263');
        if(newOffer && !newOffer.discountDueDate || newOffer && !LiberaUtils.isValidFormatDate(newOffer.discountDueDate))
            throw new BadRequestException('SCF.LIBERA.264');
        if(newOffer && !newOffer.expectedPaymentDate || newOffer && !LiberaUtils.isValidFormatDate(newOffer.expectedPaymentDate))
            throw new BadRequestException('SCF.LIBERA.265');
        if(newOffer && !newOffer.currentAmount || newOffer && isNaN(+newOffer.currentAmount))
            throw new BadRequestException('SCF.LIBERA.267');
        if(newOffer && LiberaUtils.confirmExpirationDate(newOffer.expectedPaymentDate)) throw new BadRequestException('SCF.LIBERA.253', { expectedPaymentDate: newOffer.expectedPaymentDate })
        if(newOffer && LiberaUtils.confirmExpirationDate(newOffer.discountDueDate)) throw new BadRequestException('SCF.LIBERA.254', {discountDueDate: newOffer.discountDueDate})

        await EnterpriseInvoiceBulkNegotiationService
            .updateInvoiceBulkNegotiationStatus(+enterpriseId, +bulkNegotiationId, {status, newOffer}, +userId);

        console.log(`HANDLER: Ending ${context.functionName}...`);
        return Response.NoContent();
    } catch (error) {
        console.log('HANDLER ERROR: ', error);
        return handleException(error);
    }
}

export const handler = middy(originalHandler)
    .use(authorizerRoles({
        roles: [
            RoleEnum.ENTERPRISE_PROVIDER_ADMIN
        ]
    }));