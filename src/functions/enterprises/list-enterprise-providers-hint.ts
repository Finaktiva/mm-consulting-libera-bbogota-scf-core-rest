import { APIGatewayProxyHandler, APIGatewayEvent, Context } from "aws-lambda";
import { BadRequestException, handleException } from "commons/exceptions";
import Res from "commons/response";
import { EnterpriseService } from "services/enterprise.service";
import { isValidLinkType } from "commons/enums/enterprise-link-type.enum";
import { DocumentTypeEnum } from "commons/enums/document-type-enum";
import { authorizerPermissions } from "commons/middlewares/authorizer-permissions";
import { PermissionEnum } from "commons/enums/permission.enum";
const middy = require('middy');

const originalHandler: APIGatewayProxyHandler = async (event: APIGatewayEvent, context: Context) => {
    console.log(`Handler: Starting ${context.functionName} `);

    try {
        if(!event.queryStringParameters) throw new BadRequestException('SCF.LIBERA.17');        
        const { enterpriseId } = event.pathParameters;
        const { hint, link_type, documentType } = event.queryStringParameters;
        
        if (!enterpriseId || enterpriseId === undefined) throw new BadRequestException('SCF.LIBERA.29');
        if (isNaN(+enterpriseId)) throw new BadRequestException('SCF.LIBERA.50', { enterpriseId });
        if (!hint || hint === undefined) throw new BadRequestException('SCF.LIBERA.133');
        if (hint.length < 5 )throw new BadRequestException('SCF.LIBERA.134');
        if (!link_type || link_type === undefined) throw new BadRequestException('SCF.LIBERA.156');
        const linkType = isValidLinkType(link_type);
        if (!linkType) throw new BadRequestException('SCF.LIBERA.157', {link_type});
        if (documentType && !(documentType in DocumentTypeEnum)) throw new BadRequestException('SCF.LIBERA.273', { documentType });

        const invoice = await EnterpriseService.getEnterpriseProvidersByHint(+enterpriseId, hint, linkType, documentType);

        console.log(`Handler: Ending ${context.functionName} `);
        return Res.Ok(invoice);
    }
    catch (errors) {
        console.log('HANDLER ERRORS: ', errors);
        return handleException(errors);
    }
}

export const handler = middy(originalHandler)
    .use(authorizerPermissions({
        permissions: [
            PermissionEnum.CREATE_FINANCING_PLAN,
            PermissionEnum.UPDATE_FINANCING_PLAN
        ]
    }));