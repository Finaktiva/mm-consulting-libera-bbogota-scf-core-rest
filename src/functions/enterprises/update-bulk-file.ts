import { APIGatewayProxyEvent, Context, APIGatewayProxyHandler } from "aws-lambda";
import { authorizerRoles } from "commons/middlewares/authorizer-roles";
import { RoleEnum } from "commons/enums/role.enum";
import Res from "commons/response";
import { EnterpriseService } from "services/enterprise.service";
import { handleException, BadRequestException } from "commons/exceptions";
const middy = require('middy');


const originalHandler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent, context: Context)  => {
    console.log(`HANDLER: Starting ${context.functionName}...`);
    try {
        const { enterpriseId } = event.pathParameters;
        const { filename, contentType } = JSON.parse(event.body);

        if(!enterpriseId) throw new BadRequestException('SCF.LIBERA.29');

        const res = await EnterpriseService.moveBulkFileToS3(+enterpriseId, filename, contentType);

        console.log(`HANDLER: Ending ${context.functionName}...`);
        return Res.Ok(res);
    } 
    catch (errors) {
        console.log('HANDLER ERRORS: ', errors);
        return handleException(errors);
    }
};

export const handler = middy(originalHandler)
    .use(authorizerRoles({
        roles: [
            RoleEnum.ENTERPRISE_PAYER_ADMIN
        ]
    }));