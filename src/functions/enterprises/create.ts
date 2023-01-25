import { APIGatewayProxyEvent, APIGatewayProxyHandler, Context } from 'aws-lambda';
import { CatModuleEnum } from 'commons/enums/cat-module.enum';
import { DocumentTypeEnum } from 'commons/enums/document-type-enum';
import { PermissionEnum } from 'commons/enums/permission.enum';
import { BadRequestException, ConflictException, handleException } from 'commons/exceptions';
import LiberaUtils from 'commons/libera.utils';
import { authorizerPermissions } from 'commons/middlewares/authorizer-permissions';
import Response from 'commons/response';
import ValidatorUtilities from 'commons/utils/validator';
import { EconomicActivitiesDAO } from 'dao/cat-economic-activities.dao';
import { EnterpriseService } from 'services/enterprise.service';
const middy = require('middy');

const originalHandler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent, context: Context) => {
    console.log(`HANDLER: Starting ${context.functionName}...`);
    try {

        const requestBody = JSON.parse(event.body);
        console.log('---> RequestBody: ', requestBody)
        const { email, enterpriseName, nit, modules, name, firstSurname, secondSurname, referenceRequestId, enterpriseDocumentType } = requestBody;
        const userId = event.requestContext.authorizer.principalId;

        const validationReq: boolean = await ValidatorUtilities.createEnterpriseRequestBodyValidator(requestBody);
        if (validationReq) {
            console.log("---> Validation success!");
        } else {
            throw new BadRequestException('SCF.LIBERA.COMMON.400.01');
        }

        if (LiberaUtils.checkString(name))
            throw new BadRequestException('SCF.LIBERA.229');

        if (LiberaUtils.checkString(firstSurname))
            throw new BadRequestException('SCF.LIBERA.241');

        if (LiberaUtils.checkString(secondSurname))
            throw new BadRequestException('SCF.LIBERA.242');

        const documentTypesValidWithOutCiiuCode = [ DocumentTypeEnum.PASSPORT, DocumentTypeEnum.FOREIGNER_ID, DocumentTypeEnum.IDENTIFICATION_CARD ];

        if(!documentTypesValidWithOutCiiuCode.includes(enterpriseDocumentType)){
            if (requestBody.economicActivity) {
                const economicActivity = await EconomicActivitiesDAO.getActivityByCiiu(requestBody.economicActivity.ciiuCode);
                if (!economicActivity)
                    throw new BadRequestException('SCF.LIBERA.301');
            } else {
                throw new BadRequestException('SCF.LIBERA.279');
            }
        }

        if (!email) throw new BadRequestException('SCF.LIBERA.05');
        if (!nit) throw new BadRequestException('SCF.LIBERA.07');
        if (!LiberaUtils.isNitValid(nit)) throw new BadRequestException('SCF.LIBERA.11', { nit });
        if (!modules || !modules.length) throw new BadRequestException('SCF.LIBERA.27');

        if (!modules.filter(iModule => iModule).length) throw new BadRequestException('SCF.LIBERA.28', { modules });
        if (modules.filter(modules => (modules === CatModuleEnum.ADMIN)).length > 0) throw new BadRequestException('SCF.LIBERA.42');
        if (requestBody.sales && (requestBody.sales < 0 || requestBody.sales > 999999999999999.9999)) 
            throw new ConflictException('SCF.LIBERA.387');
        if (requestBody.salesPerYear && !ValidatorUtilities.validateDateFormat(requestBody.salesPerYear)) 
            throw new BadRequestException('SCF.LIBERA.401');

        const enterprise = await EnterpriseService.createEnterprise(requestBody, +userId, requestBody.economicActivity);
        console.log(`HANDLER: Ending ${context.functionName}...`);
        return Response.Created(enterprise);
    }
    catch (errors) {
        console.error(`HANDLER ERROR: ${errors}`);
        return handleException(errors);
    }
}

export const handler = middy(originalHandler)
    .use(authorizerPermissions({
        permissions: [
            PermissionEnum.CREATE_ENTERPRISE,
            PermissionEnum.READ_ENTERPRISE_LINKINGS_LIST
        ]
}));