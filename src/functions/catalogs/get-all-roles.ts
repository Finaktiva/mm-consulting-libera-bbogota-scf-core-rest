import { APIGatewayProxyHandler, APIGatewayProxyEvent, Context } from 'aws-lambda';
import { CatRoleFilterEnum } from 'commons/enums/cat-role.enums';
import { FilterRoleUserTypeEnum } from 'commons/enums/filter-by.enum';
import { PermissionEnum } from 'commons/enums/permission.enum';
import { BadRequestException, handleException } from 'commons/exceptions';
import { IRoles, IRolesWithUsersAssociated } from 'commons/interfaces/catalogs';
import { authorizerPermissions } from 'commons/middlewares/authorizer-permissions';
import EnterprisesParser from 'commons/parsers/enterprises.parser';
import Response from 'commons/response';
const middy = require('middy');
import { CatalogService } from 'services/catalog.service';

const originalHandler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent, context: Context) => {
  console.log(`HANDLER: Starting ${context.functionName}`);

  try {
    if (event.queryStringParameters) {
      var { user_type = null, filter_by = null, q = null, proximity_search, page=null , per_page=null } = event.queryStringParameters;
    }
    
    let proximity_search_bool = false;

    if (user_type) {
      if (user_type !== FilterRoleUserTypeEnum.ENTERPRISE_USER && user_type !== FilterRoleUserTypeEnum.LIBERA_USER)
        throw new BadRequestException('SCF.LIBERA.342');
    }

    if (filter_by && !q || !filter_by && q || (filter_by && q.trim() === ''))
      throw new BadRequestException('SFC.LIBERA.367');

    if (filter_by) {
      var isValidFilter = CatRoleFilterEnum[filter_by];
      if (!isValidFilter)
        throw new BadRequestException('SFC.LIBERA.368');
      
      if(proximity_search){
        if(proximity_search !== 'true' && proximity_search !== 'false')
          throw new BadRequestException('SFC.LIBERA.369');
        if(proximity_search === 'true')
          proximity_search_bool = true;
      }
    }

    if(page && isNaN(Number(page))){
      throw new BadRequestException('SCF.LIBERA.371', {parameter: 'page'});
    }

    if(per_page && isNaN(Number(per_page))){
      throw new BadRequestException('SCF.LIBERA.371', {parameter: 'per_page'});
    }

    if(page && !per_page || !page && per_page){
      throw new BadRequestException('SCF.LIBERA.372');
    }

    const [response,total]: [IRolesWithUsersAssociated[],number] = await CatalogService.getAllRoles(user_type, isValidFilter, q, proximity_search_bool, page, per_page);
    const finalResult: IRoles[] = EnterprisesParser.parseRoles(response);
    
    console.log(`HANDLER: Ending ${context.functionName}`);
    
    return Response.Ok(finalResult, {'X-Total-Count': total});
  } catch (errors) {
    console.error(errors);
    return handleException(errors);
  }
}

export const handler = middy(originalHandler)
  .use(authorizerPermissions({
    permissions: [
      PermissionEnum.MANAGE_BOCC_USERS,
      PermissionEnum.READ_ROLE_LIST
    ]
  }));
