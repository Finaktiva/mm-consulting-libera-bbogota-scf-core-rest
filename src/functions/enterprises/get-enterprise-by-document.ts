const middy = require('middy')
import { APIGatewayEvent, APIGatewayProxyHandler, Context } from "aws-lambda";
import { BadRequestException, handleException } from "commons/exceptions";
import { DocumentNumberService } from "services/search-document-number.service";
import Response from 'commons/response';
import { DocumentTypeEnum } from "commons/enums/document-type-enum";
import { EnterpriseRequestModuleEnum } from "commons/enums/enterprise-request-module.enum";
import { PermissionEnum } from 'commons/enums/permission.enum';
import { authorizerPermissions } from 'commons/middlewares/authorizer-permissions';

const originalHandler: APIGatewayProxyHandler = async ( event: APIGatewayEvent, context: Context) => {
  try {
    console.log(`Handler: Starting ${context.functionName} `);
    const { type, number, module, product} = event.queryStringParameters;
    const userId = +event.requestContext.authorizer['principalId'];

    if (!type) throw new BadRequestException('SCF.LIBERA.271');
    if (type in DocumentTypeEnum) { } else throw new BadRequestException('SCF.LIBERA.272');
    if (!number) throw new BadRequestException('SCF.LIBERA.270');
    if (module && !(module in EnterpriseRequestModuleEnum)) throw new BadRequestException('SCF.LIBERA.295');

    if (product && product.toUpperCase() !== 'UNIDIRECT' && product.toUpperCase() !== 'FACTORING' && product.toUpperCase() !== 'CONFIRMING' && product.toUpperCase() !== 'DOCUMENT_DISCOUNT'){
      throw new BadRequestException('SCF.LIBERA.294');
    }
    const documentNumberResponse = await DocumentNumberService.getDocumentNumberRequest(number, type, module, product, userId, true);
    
    console.log(`Handler: Ending ${context.functionName} `);
    return Response.Ok(documentNumberResponse);
  }catch (errors) {
    console.log('HANDLER ERRORS: ', errors);
    return handleException(errors);
  }
}

export const handler = middy(originalHandler)
    .use(authorizerPermissions({
        permissions: [
            PermissionEnum.UPDATE_ENTERPRISE,
            PermissionEnum.CREATE_PROVIDER,
            PermissionEnum.CREATE_ENTERPRISE
        ]
    }));