const middy = require('middy');
import { APIGatewayProxyHandler, APIGatewayProxyEvent, Context } from 'aws-lambda';
import { handleException, BadRequestException, ConflictException } from 'commons/exceptions';
import { UserService } from 'services/user.service';
import Response from 'commons/response';
import { FilterUsers, isFilterLiberaUserValid } from 'commons/filter';
import { FilterUsersEnum, isFilterUserStatusValid } from 'commons/enums/filter-by.enum';
import { authorizerPermissions } from 'commons/middlewares/authorizer-permissions';
import { PermissionEnum } from 'commons/enums/permission.enum';


const originalHandler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent, context: Context) => {
  console.log(`HANDLER: Starting ${context.functionName}`);
  try {
    if(!event.queryStringParameters) throw new BadRequestException('SCF.LIBERA.12');
    const {page, per_page, filter_by, q} = event.queryStringParameters;

    if(!page || !per_page) throw new BadRequestException('SCF.LIBERA.12');
    if(page && isNaN(+page) || per_page && isNaN(+per_page)) throw new BadRequestException('SCF.LIBERA.59');
    if(+page <= 0 || +per_page <=0) throw new BadRequestException('SCF.LIBERA.78');
    if(!filter_by && q) throw new BadRequestException('SCF.LIBERA.14');
    if(filter_by && !q) throw new BadRequestException('SCF.LIBERA.15');
    if(filter_by && !isFilterLiberaUserValid(filter_by)) throw new BadRequestException('SCF.LIBERA.116', { filter_by });
    if(filter_by && filter_by === FilterUsersEnum.STATUS && q && !isFilterUserStatusValid(q)) 
      throw new BadRequestException('SCF.LIBERA.39', {status:q});
    if(filter_by && filter_by === FilterUsersEnum.ROLE && q && !(await UserService.userEnabledRoles()).includes(q)) 
      throw new ConflictException('SCF.LIBERA.84', {role:q});
    
    if( filter_by && filter_by === FilterUsersEnum.REGION ){
      if(isNaN(+q)) throw new BadRequestException('SCF.LIBERA.398');
      if(+q <= 0) throw new BadRequestException('SCF.LIBERA.399');
    }

    const filter = new FilterUsers(+page, +per_page, filter_by, q);
    const users = await UserService.getLiberaUsers(filter);
    console.log(`HANDLER: Ending ${context.functionName}`);
    return Response.Ok(users.usersResponse, {'X-Total-Count': users.total});

  } catch (errors) {
    console.log('HANDLER ERRORS: ', errors);
    return handleException(errors);
  }
}

export const handler = middy(originalHandler)
    .use(authorizerPermissions({
        permissions: [
            PermissionEnum.MANAGE_BOCC_USERS
        ]
}));
