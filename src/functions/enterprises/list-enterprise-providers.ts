const middy = require('middy');
import { APIGatewayProxyHandler, APIGatewayProxyEvent, Context } from 'aws-lambda';
import { handleException, BadRequestException } from 'commons/exceptions';
import { parseFilterProvidersStatus } from 'commons/enums/filter-status.enum';
import Response from 'commons/response';
import { EnterpriseService } from 'services/enterprise.service';
import { FilterEnterprises } from 'commons/filter';
import { authorizerRoles } from 'commons/middlewares/authorizer-roles';
import { RoleEnum } from 'commons/enums/role.enum';
import { DocumentTypeEnum } from 'commons/enums/document-type-enum';

const originalHandler : APIGatewayProxyHandler = async (event: APIGatewayProxyEvent, context: Context) => {
    console.log(`HANDLER: Starting ${context.functionName}...`);

    try {
        if(!event.queryStringParameters) throw new BadRequestException('SCF.LIBERA.17');
        const { enterpriseId } = event.pathParameters;
        const { page, per_page, filter_by, status, q, documentType } = event.queryStringParameters;
        
        if(!enterpriseId) throw new BadRequestException('SCF.LIBERA.29');
        if(!page || !per_page) throw new BadRequestException('SCF.LIBERA.12');
        if(isNaN(+page) || isNaN(+per_page)) throw new BadRequestException('SCF.LIBERA.59');
        if(+page <= 0 || +per_page <= 0)  throw new BadRequestException('SCF.LIBERA.78');
        if(+per_page > 25) throw new BadRequestException('SCF.LIBERA.18');
        if(filter_by && !q) throw new BadRequestException('SCF.LIBERA.15');
        if(status && !parseFilterProvidersStatus(status)) throw new BadRequestException('SCF.LIBERA.39',{status});
        if (documentType && !(documentType in DocumentTypeEnum)) throw new BadRequestException('SCF.LIBERA.272');

        console.log(`id: ${JSON.stringify(enterpriseId)}`);
        const filter = new FilterEnterprises(+page, +per_page, filter_by, status, q, documentType);
        const providers = await EnterpriseService.getEnterpriseProviders(filter, +enterpriseId);

        console.log(`HANDLER: Ending ${context.functionName}...`);
        return Response.Ok(providers.providersResponse, { 'X-Total-Count': providers.total });
    } catch (errors) {
        console.log('HANDLER ERRORS:', errors);
        return handleException(errors);
    }
}

export const handler = middy(originalHandler)
    .use(authorizerRoles({
        roles: [
            RoleEnum.ENTERPRISE_PAYER_ADMIN,
            RoleEnum.LIBERA_ADMIN
        ]
    }));
