const middy = require('middy');
import Response from 'commons/response';
import { APIGatewayProxyHandler, APIGatewayProxyEvent, Context } from 'aws-lambda';
import { authorizerRoles } from 'commons/middlewares/authorizer-roles';
import { RoleEnum } from 'commons/enums/role.enum';
import { BadRequestException, handleException } from 'commons/exceptions';
import { parseCatModule } from 'commons/enums/cat-module.enum';
import { EnterpriseService } from 'services/enterprise.service';

const originalHandler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent, context: Context) => {
    console.log(`HANDLER: Starting ${context.functionName}...`);
    try {
        const requestBody = JSON.parse(event.body);
        const { enterpriseId } = event.pathParameters;
        const { name, firstSurname, email, modules } = requestBody;
        const userId = event.requestContext.authorizer.principalId;
        
        if(!enterpriseId || enterpriseId === undefined) 
            throw new BadRequestException('SCF.LIBERA.48');
        if (!name)
            throw new BadRequestException('SCF.LIBERA.45');
        if (!firstSurname)
            throw new BadRequestException('SCF.LIBERA.46');
        if (!email)
            throw new BadRequestException('SCF.LIBERA.47');
        if (!modules || !modules.length)
            throw new BadRequestException('SCF.LIBERA.27');

        const catModulesEnum = modules.map(modul => parseCatModule(modul));

        if(catModulesEnum.filter(catModule => !catModule).length > 0)
            throw new BadRequestException('SCF.LIBERA.28', {modules});

        const result = await EnterpriseService.createEnterpriseUser(+enterpriseId, userId, {...requestBody, modules: catModulesEnum})
        console.log(`HANDLER: Ending ${context.functionName}...`);
        return Response.Created(result);
    }
    catch (errors) {
        console.log('HANDLER ERRORS: ', errors);
        return handleException(errors);
    }
}

export const handler = middy(originalHandler)
    .use(authorizerRoles({
        roles: [
            RoleEnum.ENTERPRISE_CONSOLE_ADMIN
        ]
    }));