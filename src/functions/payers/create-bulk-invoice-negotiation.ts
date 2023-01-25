const middy = require('middy');
import { APIGatewayProxyHandler, APIGatewayEvent, Context } from 'aws-lambda';
import { authorizerRoles } from 'commons/middlewares/authorizer-roles';
import { RoleEnum } from 'commons/enums/role.enum';
import { BadRequestException, handleException } from 'commons/exceptions';
import Response from 'commons/response';
import LiberaUtils from 'commons/libera.utils';
import { isValidDiscountType } from 'commons/enums/negotiation-process-discount-type.enum';
import { CreateNewNegotiationBulk } from 'commons/interfaces/payer-interfaces/create-new-negotiation-bulk';
import { EnterpriseInvoiceNegotiationService } from 'services/enterprise-invoice-negotiation.service';

export const originalHandler: APIGatewayProxyHandler = async (event: APIGatewayEvent, context: Context) => {
    console.log(`HANDLER: Starting ${context.functionName}...`);
    try {
        if (!event.body) throw new BadRequestException('SCF.LIBERA.49');
        const { discountType,  percentage, discountDueDate, lenderId, expectedPaymentDate, currentAmount, invoices } = JSON.parse(event.body);
        if (!event.pathParameters) throw new BadRequestException('SCF.LIBERA.COMMON.400');
        const { enterpriseId } = event.pathParameters;
        const userId = +event.requestContext.authorizer['principalId'];
        if(!discountType || !percentage || !discountDueDate || !lenderId || !expectedPaymentDate || !invoices || !currentAmount)
            throw new BadRequestException("SCF.LIBERA.259");
        if (!enterpriseId || enterpriseId === undefined) throw new BadRequestException('SCF.LIBERA.29');
        if (isNaN(+enterpriseId)) throw new BadRequestException('SCF.LIBERA.50', { enterpriseId });
        if (discountDueDate && !LiberaUtils.isValidFormatDate(discountDueDate)) throw new BadRequestException('SCF.LIBERA.135', {variable: discountDueDate});
        if (expectedPaymentDate && !LiberaUtils.isValidFormatDate(expectedPaymentDate)) throw new BadRequestException('SCF.LIBERA.135', {variable: expectedPaymentDate});
        if (discountType && !isValidDiscountType(discountType)) throw new BadRequestException('SCF.LIBERA.136', {discountType});
        if (percentage && isNaN(percentage)) throw new BadRequestException('SCF.LIBERA.137', {percentage});
        if(isNaN(lenderId))throw new BadRequestException('SCF.LIBERA.244', {lenderId});
        if(LiberaUtils.confirmExpirationDate(expectedPaymentDate)) throw new BadRequestException('SCF.LIBERA.253', {expectedPaymentDate})
        if(LiberaUtils.confirmExpirationDate(discountDueDate)) throw new BadRequestException('SCF.LIBERA.254', {discountDueDate})
        if(isNaN(currentAmount))throw new BadRequestException('SCF.LIBERA.266', {currentAmount});
        const data: CreateNewNegotiationBulk = {
            discountType,
            percentage,
            discountDueDate,
            lenderId,
            expectedPaymentDate,
            currentAmount,
            invoices
        }
        const result = await EnterpriseInvoiceNegotiationService.createNewBulkNegotiation(data, +enterpriseId, +userId);

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