import { APIGatewayProxyEvent, APIGatewayProxyHandler, Context } from "aws-lambda";
import { FilterUserTypeEnum, parseFilterUserTypeEnum } from "commons/enums/filter-by.enum";
import { PermissionEnum } from "commons/enums/permission.enum";
import { BadRequestException, handleException } from "commons/exceptions";
import { IPermissionResponse } from "commons/interfaces/catalogs";
import { authorizerPermissions } from "commons/middlewares/authorizer-permissions";
import { CatalogsParsers } from "commons/parsers/catalogs.parsers";
import Response from 'commons/response';
import { CatPermission } from "entities/cat-permissions";
import { CatalogService } from "services/catalog.service";
const middy = require('middy');

export const originalHandler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent, context: Context) => {
    console.log(`HANDLER: Starting ${context.functionName}`);

    try {
        let userType: FilterUserTypeEnum;

        if(event.queryStringParameters){
            var { user_type } = event.queryStringParameters;

            userType = parseFilterUserTypeEnum(user_type);

            if(!userType)
                throw new BadRequestException('SCF.LIBERA.363', { userType: user_type });
        }

        const permissionsEntityList: CatPermission[] = await CatalogService.getAllPermissions(userType);

        const response: IPermissionResponse[] = CatalogsParsers.parseToRolePermissionResponseList(permissionsEntityList);
        
        console.log(`HANDLER: Ending ${context.functionName}`);

        return Response.Ok(response);
    } catch (errors) {
        console.error(errors);
        return handleException(errors);
    }
}

export const handler = middy(originalHandler)
  .use(authorizerPermissions({
    permissions: [
      PermissionEnum.CREATE_ROLE,
      PermissionEnum.UPDATE_ROLE
    ]
  }));