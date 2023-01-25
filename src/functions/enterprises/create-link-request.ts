const middy = require('middy');
import { APIGatewayProxyHandler, APIGatewayEvent, Context } from 'aws-lambda';
import { authorizerRoles } from 'commons/middlewares/authorizer-roles';
import { RoleEnum } from 'commons/enums/role.enum';
import { BadRequestException, handleException } from 'commons/exceptions';
import Response from 'commons/response';
import { EnterpriseService } from 'services/enterprise.service';
import LiberaUtils from 'commons/libera.utils';
import { EnterpriseLinkService } from 'services/enterprise-link.service';


export const originalHandler: APIGatewayProxyHandler = async (event: APIGatewayEvent, context: Context) => {
  console.log(`HANDLER: Starting ${context.functionName}...`);

  try{
    if(!event.pathParameters)throw new BadRequestException('SCF.LIBERA.COMMON.400');
    if(!event.body) throw new BadRequestException('SCF.LIBERA.89');
    const userId = event.requestContext.authorizer.principalId;
    const { enterpriseId } = event.pathParameters;
    console.log('Id de la empresa es:  ', enterpriseId);
    const { enterpriseName, nit, owner, phone, providerDocumentType, disbursementContract, city, department } = JSON.parse(event.body);
    const requestBody = JSON.parse(event.body);

    if(!enterpriseId) throw new BadRequestException('SCF.LIBERA.29');
    if(enterpriseId === undefined || isNaN(+enterpriseId)) throw new BadRequestException('SCF.LIBERA.50', {enterpriseId});
    if(owner.name && LiberaUtils.checkString(owner.name)) throw new BadRequestException('SCF.LIBERA.229');
    if(owner.firstSurname && LiberaUtils.checkString(owner.firstSurname)) throw new BadRequestException('SCF.LIBERA.241');
    if(owner.secondSurname && LiberaUtils.checkString(owner.secondSurname)) throw new BadRequestException('SCF.LIBERA.242');

    if(!providerDocumentType || !nit || !enterpriseName || !phone || !phone.number){
      throw new BadRequestException('SCF.LIBERA.280');
    }

    if(!owner || !owner.name || !owner.firstSurname || !owner.email){
      throw new BadRequestException('SCF.LIBERA.281');
    }

    if(!disbursementContract || !disbursementContract.type){
      throw new BadRequestException('SCF.LIBERA.282');
    }

    if((department && !city) || (city && !department))
      throw new BadRequestException("SCF.LIBERA.303");

    if(department && city)
      await EnterpriseLinkService.departmenAndCityValidation(city, department);

    const enterpriseProvider = await EnterpriseService.createLinkRequest(+enterpriseId, +userId, requestBody);

    console.log(`HANDLER: Ending ${context.functionName}...`);
    return Response.Created(enterpriseProvider);
  }
  catch (errors) {
    console.log('HANDLER ERRORS: ', errors);
    return handleException(errors);
  }
}
export const handler = middy(originalHandler)
    .use(authorizerRoles({
        roles: [
            RoleEnum.ENTERPRISE_PAYER_ADMIN
        ]
    }));
