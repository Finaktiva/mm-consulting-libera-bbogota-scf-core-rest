import { APIGatewayProxyHandler, APIGatewayProxyEvent, Context } from "aws-lambda";
import { authorizerRoles } from "commons/middlewares/authorizer-roles";
import Response from 'commons/response';
import { BadRequestException, handleException } from "commons/exceptions";
import { isValidEnterpriseInvoiceType } from "commons/enums/enterprise-invoice-type.enum";
import { EnterpriseInvoiceService } from "services/enterprise-invoice.service";
import { RoleEnum } from "commons/enums/role.enum";
import { IEnterpriseInvoice } from "commons/interfaces/enterprise-invoice.interface";
import { PayerService } from "services/payer.service";
const middy = require('middy');

const originalHandler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent, context: Context) => {
    console.log(`HANDLER: Starting ${context.functionName}...`);
    try {
        if(!event.pathParameters)throw new BadRequestException('SCF.LIBERA.COMMON.400');
        const body = JSON.parse(event.body);
        if(!body) throw new BadRequestException('SCF.LIBERA.49');
        const { enterpriseId } = event.pathParameters;
        const { lenderId } = event.pathParameters;
        const userId = +event.requestContext.authorizer['principalId'];
        const { quota, comments} = JSON.parse(event.body);
        
        if(!quota) throw new BadRequestException('SCF.LIBERA.206');
        if(isNaN(+quota)) throw new BadRequestException ('SCF.LIBERA.207');
        if(!enterpriseId || enterpriseId === undefined ) throw new BadRequestException('SCF.LIBERA.29');
        if(isNaN(+enterpriseId)) throw new BadRequestException('SCF.LIBERA.50', {enterpriseId});
        if(!lenderId || lenderId === undefined) throw new BadRequestException('SCF.LIBERA.198');        
        if(isNaN(+lenderId)) throw new BadRequestException('SCF.LIBERA.199', {lenderId});
        const result = await PayerService.createQuotaRequest(+enterpriseId, +lenderId, +userId, quota, comments);
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