import { APIGatewayProxyHandler, APIGatewayProxyEvent, Context } from "aws-lambda";
import { authorizerRoles } from "commons/middlewares/authorizer-roles";
import { RoleEnum } from "commons/enums/role.enum";
import { handleException, BadRequestException } from "commons/exceptions";
import Response from 'commons/response';
import { PayerService } from "services/payer.service";
import { parseQuotaRequestAdjustmentType } from "commons/enums/enterprise-quota-request-type.enum";

const middy = require('middy');

const originalHandler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent, context: Context) => {
    console.log(`HANDLER: Starting ${context.functionName}...`);
    
    const userId = event.requestContext.authorizer['principalId'];
    const enterpriseId = event.pathParameters['enterpriseId'] ? event.pathParameters['enterpriseId'] : null;
    const lenderId = event.pathParameters['lenderId'] ? event.pathParameters['lenderId'] : null;
    const body = JSON.parse(event.body);

    try {
        if (!enterpriseId) throw new BadRequestException('SCF.LIBERA.159');
        if (isNaN(+enterpriseId)) throw new BadRequestException('SCF.LIBERA.50', { enterpriseId });
        if (!lenderId) throw new BadRequestException('SCF.LIBERA.198');
        if (isNaN(+lenderId)) throw new BadRequestException('SCF.LIBERA.199', { lenderId });
        if (!body) throw new BadRequestException('SCF.LIBERA.49');
        if (!body.quota) throw new BadRequestException('SCF.LIBERA.206');
        if (isNaN(+body.quota)) throw new BadRequestException('SCF.LIBERA.207', { quota: body.quota });
        if(!body.type) throw new BadRequestException('SCF.LIBERA.208');
        if(!parseQuotaRequestAdjustmentType(body.type)) throw new BadRequestException('SCF.LIBERA.209', { type: body.type });

        await PayerService.requestQuotaAdjustment(+userId, +enterpriseId, +lenderId, body);
        
        console.log(`HANDLER: Ending ${context.functionName}...`);
        return Response.Created();
    } catch (error) {
        console.log('ERRORS: ' , error);
        return handleException(error);
    }
}

export const handler = middy(originalHandler)
    .use(authorizerRoles({
        roles: [
            RoleEnum.ENTERPRISE_CONSOLE_ADMIN,
            RoleEnum.ENTERPRISE_PAYER_ADMIN
        ]
    }));