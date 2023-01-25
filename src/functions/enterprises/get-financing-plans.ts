const middy = require('middy')
import { APIGatewayEvent, APIGatewayProxyHandler, Context } from "aws-lambda";
import { BadRequestException, ForbiddenException, handleException, UnAuthorizedException } from "commons/exceptions";
import Response from 'commons/response';
import { EnterpriseService } from "services/enterprise.service";
import { FilterByFinancingPlans } from "commons/enums/filter-by.enum";
import { EFinancingObservations, EFinancingPlanType, EinancingPlanStatus } from "commons/enums/financing-plan-type.enum";
import { authorizerPermissions } from "commons/middlewares/authorizer-permissions";
import { PermissionEnum } from "commons/enums/permission.enum";
import ValidatorUtilities from "commons/utils/validator";


const originalHandler: APIGatewayProxyHandler = async ( event: APIGatewayEvent, context: Context) => {
  try {
    console.log(`Handler: Starting ${context.functionName} `);
    const enterpriseId: number = +event.pathParameters.enterpriseId;
    const userId = event.requestContext.authorizer.principalId;
    let filter_by = null;
    let q = null;
    let page = null;
    let per_page = null;
    event.queryStringParameters ? { filter_by, q, page, per_page } = event.queryStringParameters : null;
    
    if (!await ValidatorUtilities.enterpriseFinancingPlanValidator(enterpriseId, userId)) 
      throw new ForbiddenException('SCF.LIBERA.COMMON.403.01');
    if (filter_by && !q) throw new BadRequestException('SCF.LIBERA.15');
    if (q && !filter_by) throw new BadRequestException('SCF.LIBERA.14');
    if (filter_by && !(filter_by in FilterByFinancingPlans)) throw new BadRequestException('SCF.LIBERA.13', { filter_by });
    if (filter_by && filter_by == FilterByFinancingPlans.OBSERVATION && !(q in EFinancingObservations)) 
        throw new BadRequestException('SCF.LIBERA.360', { q });
    if (filter_by && filter_by == FilterByFinancingPlans.STATUS && !(q in EinancingPlanStatus)) 
        throw new BadRequestException('SCF.LIBERA.361', { q });
    if (filter_by && filter_by == FilterByFinancingPlans.TYPE && !(q in EFinancingPlanType)) 
        throw new BadRequestException('SCF.LIBERA.362', { q });
    
    if(page && isNaN(Number(page))){
      throw new BadRequestException('SCF.LIBERA.371', {parameter: 'page'});
    }
    if(per_page && isNaN(Number(per_page))){
      throw new BadRequestException('SCF.LIBERA.371', {parameter: 'per_page'});
    }
    if(page && !per_page || !page && per_page){
      throw new BadRequestException('SCF.LIBERA.372');
    }
    
    const [financingPlans,total] = await EnterpriseService.getEnterpriseFinancingPlans(enterpriseId, userId, filter_by, q, page, per_page);  
    console.log(`Handler: Ending ${context.functionName} `);
    return Response.Ok(financingPlans, { 'X-Total-Count': total });
  }catch (errors) {
    console.log('HANDLER ERRORS: ', errors);
    return handleException(errors);
  }
}

export const handler = middy(originalHandler)
  .use(authorizerPermissions({
    permissions: [
        PermissionEnum.READ_FINANCING_PLAN_LIST
    ]
  }));
