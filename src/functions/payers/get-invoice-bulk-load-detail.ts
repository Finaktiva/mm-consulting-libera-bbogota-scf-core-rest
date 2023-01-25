import { APIGatewayProxyHandler, APIGatewayProxyEvent, Context } from 'aws-lambda';
import Response from 'commons/response';
import { handleException, BadRequestException } from 'commons/exceptions';
import { authorizerRoles } from 'commons/middlewares/authorizer-roles';
import { RoleEnum } from 'commons/enums/role.enum';
import { PayerService } from 'services/payer.service';

const middy = require('middy');

const originalHandler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent, context: Context) => {
    console.log(`HANDLER: Starting ${context.functionName}...`);
    try {    
        if(!event.pathParameters) throw new BadRequestException('SCF.LIBERA.173');
        const { enterpriseId , invoiceBulkId } = event.pathParameters;
        
        if(!enterpriseId)
            throw new BadRequestException('SCF.LIBERA.159');
        
        if(!invoiceBulkId)
            throw new BadRequestException('SCF.LIBERA.174');
        
        const result = await PayerService.getInvoiceBulkLoadDetail(+enterpriseId, +invoiceBulkId);

        return Response.Ok(result);
    }
    catch (error) {
        console.log('ERRORS: ' , error);
        return handleException(error);
    }
};

export const handler = middy(originalHandler)
    .use(authorizerRoles({
        roles: [
            RoleEnum.ENTERPRISE_CONSOLE_ADMIN,
            RoleEnum.ENTERPRISE_PAYER_ADMIN
        ]
    }));