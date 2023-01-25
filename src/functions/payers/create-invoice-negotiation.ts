const middy = require('middy');
import { APIGatewayProxyHandler, APIGatewayEvent, Context } from 'aws-lambda';
import { authorizerRoles } from 'commons/middlewares/authorizer-roles';
import { RoleEnum } from 'commons/enums/role.enum';
import { BadRequestException, handleException } from 'commons/exceptions';
import Response from 'commons/response';
import { EnterpriseService } from 'services/enterprise.service';
import LiberaUtils from 'commons/libera.utils';
import { isValidDiscountType } from 'commons/enums/negotiation-process-discount-type.enum';

export const originalHandler: APIGatewayProxyHandler = async (event: APIGatewayEvent, context: Context) => {
    console.log(`HANDLER: Starting ${context.functionName}...`);
    try {
        if (!event.body) throw new BadRequestException('SCF.LIBERA.49');
        const { discountDueDate, expectedPaymentDate, discountType, percentage } = JSON.parse(event.body);
        if (!event.pathParameters) throw new BadRequestException('SCF.LIBERA.COMMON.400');
        const { enterpriseId, invoiceId } = event.pathParameters;
        const userId = +event.requestContext.authorizer['principalId'];

        if (!enterpriseId || enterpriseId === undefined) throw new BadRequestException('SCF.LIBERA.29');
        if (isNaN(+enterpriseId)) throw new BadRequestException('SCF.LIBERA.50', { enterpriseId });
        if (!invoiceId || invoiceId === undefined) throw new BadRequestException('SCF.LIBERA.124');
        if (isNaN(+invoiceId)) throw new BadRequestException('SCF.LIBERA.125', { invoiceId });
        if (discountDueDate && !LiberaUtils.isValidFormatDate(discountDueDate)) throw new BadRequestException('SCF.LIBERA.135', {variable: discountDueDate});
        if (expectedPaymentDate && !LiberaUtils.isValidFormatDate(expectedPaymentDate)) throw new BadRequestException('SCF.LIBERA.135', {variable: expectedPaymentDate});
        if (discountType && !isValidDiscountType(discountType)) throw new BadRequestException('SCF.LIBERA.136', {discountType});
        if (percentage && isNaN(percentage)) throw new BadRequestException('SCF.LIBERA.137', {percentage});

        const result = await EnterpriseService.createNewInvoiceNegotiation(+enterpriseId, +invoiceId, {discountDueDate, expectedPaymentDate, discountType, percentage}, +userId);

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