const middy = require('middy');
import { APIGatewayProxyHandler, APIGatewayProxyEvent, Context } from 'aws-lambda';
import { ConflictException, BadRequestException, handleException } from 'commons/exceptions';
import { parseFilterBy, FilterEnterpriseEnum } from 'commons/enums/filter-by.enum';
import Response from 'commons/response';
import { FilterEnterprises } from 'commons/filter';
import { EnterpriseService } from 'services/enterprise.service';
import { parseFilterStatus } from 'commons/enums/filter-status.enum';
import LiberaUtils from 'commons/libera.utils';
import { DocumentTypeEnum } from 'commons/enums/document-type-enum';
import { isCatModuleValid } from 'commons/enums/cat-module.enum';
import { PermissionEnum } from 'commons/enums/permission.enum';
import { authorizerPermissions } from 'commons/middlewares/authorizer-permissions';
import { FinancingPlanStatusEnum } from 'commons/enums/financing-plan-status-actions.enum';
import { ActiveProductsEnum } from 'commons/enums/active-products.enum';

export const originalHandler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent, context : Context) => {
    console.log(`HANDLER: Starting ${context.functionName}`);

    try {
        if(!event.queryStringParameters) throw new BadRequestException('SCF.LIBERA.17');
        const { page, per_page, filter_by, status, q, documentType, hint, module } = event.queryStringParameters;

        if(!page || !per_page) throw new ConflictException('SCF.LIBERA.12');
        if(per_page && +per_page > 25) throw new BadRequestException('SCF.LIBERA.18');

        if((filter_by && filter_by === FilterEnterpriseEnum.ENTERPRISE_NAME || filter_by && filter_by === FilterEnterpriseEnum.DATE || filter_by && filter_by === FilterEnterpriseEnum.NIT || filter_by && filter_by === FilterEnterpriseEnum.REGION || filter_by && filter_by === FilterEnterpriseEnum.ACTIVE_PRODUCTS || filter_by && filter_by === FilterEnterpriseEnum.FINANCIAL_CONDITIONS) && !q ) 
            throw new BadRequestException('SCF.LIBERA.15');

        if(status && !parseFilterStatus(status)) throw new BadRequestException('SCF.LIBERA.39', { status });
        if(filter_by && !parseFilterBy(filter_by)) throw new BadRequestException('SCF.LIBERA.13', {filter_by});

        if(filter_by && filter_by == FilterEnterpriseEnum.DATE && !LiberaUtils.isValidFormatDate(q)) 
            throw new BadRequestException('SCF.LIBERA.41', {date: q});

        if(filter_by && filter_by === FilterEnterpriseEnum.ACTIVE_PRODUCTS && ActiveProductsEnum[q] === undefined)
            throw new BadRequestException('SCF.LIBERA.408', {q});
        
        if(filter_by && filter_by === FilterEnterpriseEnum.FINANCIAL_CONDITIONS && FinancingPlanStatusEnum[q] === undefined)
            throw new BadRequestException('SCF.LIBERA.257', {q});

        if (documentType && !(documentType in DocumentTypeEnum)) throw new BadRequestException('SCF.LIBERA.272');

        if (hint && !module || module && !hint) throw new BadRequestException('SCF.LIBERA.305');

        if (module && !isCatModuleValid(module)) throw new BadRequestException('SCF.LIBERA.58', {module});

        const filter = new FilterEnterprises(+page, +per_page, filter_by, status, q, documentType, hint, module);
        const enterprisesAndTotal = await EnterpriseService.getEnterprises(filter);
        
        console.log(`HANDLER: Ending ${context.functionName}`);
        return Response.Ok(enterprisesAndTotal.enterprisesDocCount, { 'X-Total-Count': enterprisesAndTotal.total});
    }
    catch(errors) {
            console.log('HANDLER ERRORS: ', errors);
            return handleException(errors);
        }
    
}


export const handler = middy(originalHandler)
    .use(authorizerPermissions({
        permissions: [
            PermissionEnum.READ_ENTERPRISE_LIST
        ]
    }));