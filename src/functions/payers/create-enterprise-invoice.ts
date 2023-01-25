import { APIGatewayProxyHandler, APIGatewayProxyEvent, Context } from "aws-lambda";
import { authorizerRoles } from "commons/middlewares/authorizer-roles";
import Res from "commons/response";
import { BadRequestException, handleException } from "commons/exceptions";
import { isValidEnterpriseInvoiceType } from "commons/enums/enterprise-invoice-type.enum";
import { EnterpriseInvoiceService } from "services/enterprise-invoice.service";
import { RoleEnum } from "commons/enums/role.enum";
import { IEnterpriseInvoice } from "commons/interfaces/enterprise-invoice.interface";
const middy = require('middy');

const originalHandler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent, context: Context) => {
    console.log(`HANDLER: Starting ${context.functionName}...`);
    try {
        if(!event.pathParameters)throw new BadRequestException('SCF.LIBERA.COMMON.400');
        const body = JSON.parse(event.body);
        if(!body) throw new BadRequestException('SCF.LIBERA.49');
        const { enterpriseId } = event.pathParameters;
        const userId = +event.requestContext.authorizer['principalId'];

        if(!enterpriseId || enterpriseId === undefined ) throw new BadRequestException('SCF.LIBERA.29');
        if(isNaN(+enterpriseId)) throw new BadRequestException('SCF.LIBERA.50', {enterpriseId});
        if(!body.documentType || body.documentType === undefined ) throw new BadRequestException('SCF.LIBERA.117');
        if(!isValidEnterpriseInvoiceType(body.documentType)) 
            throw new BadRequestException('SCF.LIBERA.123', { documentType: body.documentType});
        if(!body.invoiceNumber) throw new BadRequestException('SCF.LIBERA.118');
        if(!body.alternativeInvoiceId) throw new BadRequestException('SCF.LIBERA.119');
        if(!body.expirationDate) throw new BadRequestException('SCF.LIBERA.120');
        if(!body.payment) throw new BadRequestException('SCF.LIBERA.121');
        if(!body.currencyCode) throw new BadRequestException('SCF.LIBERA.128');

        const enterpriseInvoice: IEnterpriseInvoice = body;
        const result = await EnterpriseInvoiceService.createInvoice(enterpriseInvoice, +enterpriseId, userId);
        console.log(`HANDLER: Ending ${context.functionName}...`);
        return Res.Created(result);
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