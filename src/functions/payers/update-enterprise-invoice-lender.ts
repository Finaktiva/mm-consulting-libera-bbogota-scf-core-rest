const middy = require('middy');
import { APIGatewayProxyHandler, APIGatewayProxyEvent, Context } from 'aws-lambda';
import { handleException, BadRequestException } from 'commons/exceptions';
import { EnterpriseService } from 'services/enterprise.service';
import Response from 'commons/response';
import { RoleEnum } from 'commons/enums/role.enum';
import { authorizerRoles } from 'commons/middlewares/authorizer-roles';
import { LenderService } from 'services/lender.service';

const originalHandler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent, context: Context) => {
    console.log(`HANDLER: Starting ${context.functionName}`);

    try {
        if(!event.pathParameters) throw new BadRequestException('SCF.LIBERA.126');
        if(!event.body) throw new BadRequestException('SCF.LIBERA.237');
        const { enterpriseId, invoiceId } = event.pathParameters;
        const { lenderId } = JSON.parse(event.body);
        if(!lenderId) throw new BadRequestException('SCF.LIBERA.237');
        if(!invoiceId) throw new BadRequestException('SCF.LIBERA.124');
        if(!enterpriseId) throw new BadRequestException('SCF.LIBERA.29');

        const result = await LenderService.updateInvoiceLender(+enterpriseId, +invoiceId, +lenderId);
        console.log(`HANDLER: Ending ${context.functionName}`);
        return Response.Ok(result);
    } catch (errors) {
        console.log('HANDLER ERRORS: ', errors);
        return handleException(errors);
    }
}

export const handler = middy(originalHandler)
    .use(authorizerRoles({ roles: [RoleEnum.ENTERPRISE_CONSOLE_ADMIN, RoleEnum.ENTERPRISE_PAYER_ADMIN] }));