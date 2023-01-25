const middy = require('middy');
import { APIGatewayProxyHandler, APIGatewayEvent, Context } from "aws-lambda";
import { BadRequestException, handleException } from "commons/exceptions";
import Res from "commons/response";
import { authorizerRoles } from "commons/middlewares/authorizer-roles";
import { RoleEnum } from "commons/enums/role.enum";
import { LenderService } from "services/lender.service";
import { ConfirmPayment } from "commons/interfaces/lender-interfaces/confirm-payment.interface";


const originalHandler: APIGatewayProxyHandler = async (event: APIGatewayEvent, context: Context) => {
    console.log(`Handler: Starting ${context.functionName} `);


    try {
        if (!event.pathParameters) throw new BadRequestException('SCF.LIBERA.COMMON.400');
        if (!event.body) throw new BadRequestException('SCF.LIBERA.49');
        const userId = event.requestContext.authorizer.principalId;
        const { enterpriseId, requestId } = event.pathParameters;
        const body: ConfirmPayment = JSON.parse(event.body);
        if (!enterpriseId || enterpriseId === undefined) throw new BadRequestException('SCF.LIBERA.29');
        if (isNaN(+enterpriseId)) throw new BadRequestException('SCF.LIBERA.50', { enterpriseId });
        if (!requestId || requestId === undefined) throw new BadRequestException('SCF.LIBERA.80');
        if (isNaN(+requestId)) throw new BadRequestException('SCF.LIBERA.81', { requestId });;
        if (body.status === 'ACCEPTED' && !body.filename && !body.comments)  throw new BadRequestException('SCF.LIBERA.226');

        await LenderService.confirmPayment(+enterpriseId, +requestId, body, +userId);

        console.log(`Handler: Ending ${context.functionName} `);
        return Res.NoContent();
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
            RoleEnum.ENTERPRISE_FUNDING_ADMIN
        ]
    }));