const middy = require('middy')
import { APIGatewayEvent, APIGatewayProxyHandler, Context } from "aws-lambda";
import { BadRequestException, ConflictException, handleException } from "commons/exceptions";
import Response from 'commons/response';
import { EnterpriseService } from "services/enterprise.service";
import { EFinancingPlanType, EPaymentMethod } from "commons/enums/financing-plan-type.enum";
import FinancingPlanParser from "commons/parsers/financing-plan.parser";
import moment, { Moment } from 'moment-timezone';
import { authorizerPermissions } from "commons/middlewares/authorizer-permissions";
import { PermissionEnum } from "commons/enums/permission.enum";

const originalHandler: APIGatewayProxyHandler = async ( event: APIGatewayEvent, context: Context) => {
  try {
    console.log(`Handler: Starting ${context.functionName} `);
    const enterpriseId: number = +event.pathParameters.enterpriseId;
    const requestBody = JSON.parse(event.body);
    const userId = +event.requestContext.authorizer.principalId;
    const evidenceFilename = requestBody.evidenceFilename;

    if(!requestBody
      || !requestBody.type
      || requestBody.type.length < 1) throw new BadRequestException('SCF.LIBERA.327');
      
    let planCreated;
    switch (requestBody.type) {

      case EFinancingPlanType.COMMISSION:
        console.log('COMISSION PLAN');

        // if(!requestBody.evidenceFilename)
        //   throw new BadRequestException('SCF.LIBERA.390');

        if(!requestBody.folio || typeof requestBody.folio !== "string")
          throw new BadRequestException('SCF.LIBERA.310');

        if(requestBody.comments &&
          (typeof requestBody.comments !== "string" || requestBody.comments.length > 200)) throw new BadRequestException('SCF.LIBERA.311');

        if(requestBody.providerOptions){
          if(typeof requestBody.providerOptions.providerId !== "number"
            || requestBody.providerOptions.providerId < 1
            || typeof requestBody.providerOptions.hasAgreement !== "boolean"
            || typeof requestBody.providerOptions.requireAuthToPerformOperation !== "boolean") throw new BadRequestException('SCF.LIBERA.312');

          if(requestBody.providerOptions.authDay
            && (typeof requestBody.providerOptions.authDay !== "number"
              || requestBody.providerOptions.authDay < 0 
              || requestBody.providerOptions.authDay > 99
              || !Number.isInteger(requestBody.providerOptions.authDay))) throw new BadRequestException('SCF.LIBERA.312');
        }

        if(requestBody.economicGroup && requestBody.economicGroup.length > 0) {
          requestBody.economicGroup.forEach(element => {
            if(typeof element.enterpriseId !== "number" || element.enterpriseId < 1)
              throw new BadRequestException('SCF.LIBERA.313');

            if (element.sales < 0 || element.sales > 999999999999999.9999) 
              throw new ConflictException('SCF.LIBERA.387');
          });

          const groupIds = requestBody.economicGroup.flatMap( group => group.enterpriseId);
          let duplicates = [];

          const tempArray = [...groupIds].sort();

          for (let i = 0; i < tempArray.length; i++) {
            if (tempArray[i + 1] === tempArray[i]) {
              duplicates.push(tempArray[i]);
            }
          }

          if(duplicates.length > 0) throw new BadRequestException('SCF.LIBERA.314');
        }

        if(requestBody.totalSales && typeof requestBody.totalSales !== "number")
          throw new BadRequestException('SCF.LIBERA.328');

        if(requestBody.totalSales
            && (requestBody.totalSales < 0 || requestBody.totalSales > 999999999999999999999999999999.9999))
          throw new BadRequestException('SCF.LIBERA.315');

        if(requestBody.salesCut && typeof requestBody.salesCut !== "string") 
          throw new BadRequestException('SCF.LIBERA.329');

        if(!requestBody.minimumRate)
          throw new BadRequestException('SCF.LIBERA.330');

        if(requestBody.minimumRate
          && (typeof requestBody.minimumRate.baseType !== "string"
              || typeof requestBody.minimumRate.baseValue !== "number"
              || typeof requestBody.minimumRate.specialRate !== "number"
              || typeof requestBody.minimumRate.periodicityType !== "string"
              || typeof requestBody.minimumRate.ea !== "number"
              || typeof requestBody.minimumRate.mv !== "number")) throw new BadRequestException('SCF.LIBERA.316');

        if(!requestBody.negotiatedRate)
          throw new BadRequestException('Minimum rate object is required.');

        if(requestBody.negotiatedRate
          && (typeof requestBody.negotiatedRate.baseType !== "string"
              || typeof requestBody.negotiatedRate.baseValue !== "number"
              || typeof requestBody.negotiatedRate.specialRate !== "number"
              || typeof requestBody.negotiatedRate.periodicityType !== "string"
              || typeof requestBody.negotiatedRate.ea !== "number"
              || typeof requestBody.negotiatedRate.mv !== "number")) throw new BadRequestException('SCF.LIBERA.317');

        if(requestBody.isSpecialRate && typeof requestBody.isSpecialRate !== "boolean")
          throw new BadRequestException('SCF.LIBERA.331');

        if(typeof requestBody.validityDays !== "number")
          throw new BadRequestException('SCF.LIBERA.332');

        if(typeof requestBody.validityDate !== "string")
          throw new BadRequestException('SCF.LIBERA.333');
        
        const colombiaCurrentTime = moment().tz('America/Bogota');
        // const todayDate = moment().format('YYYY-MM-DD');
        // const todayParsed = moment(todayDate)
        const valididtyDateCalculated = colombiaCurrentTime.add(requestBody.validityDays, 'd').format('YYYY-MM-DD');
        const validityDate = moment(requestBody.validityDate).format('YYYY-MM-DD');
        console.log('---> COL - current date: ', colombiaCurrentTime);
        console.log('---> VALIDITY DATE CALC: , ', valididtyDateCalculated);
        
        if(validityDate !== valididtyDateCalculated)
          throw new BadRequestException("SCF.LIBERA.318");

        if(requestBody.validityDays < 1){
          throw new BadRequestException("SCF.LIBERA.389");
        }

        if(typeof requestBody.paydayInitialRange !== "number" || requestBody.paydayInitialRange < 0 || requestBody.paydayInitialRange > 99)
          throw new BadRequestException('SCF.LIBERA.334');

        if(requestBody.paydayFinalRange && (requestBody.paydayFinalRange < 1 || requestBody.paydayFinalRange > 99))
          throw new BadRequestException('SCF.LIBERA.336');

        if(typeof requestBody.termDays !== "number" || requestBody.termDays > 999 || requestBody.termDays < 1)
          throw new BadRequestException('SCF.LIBERA.337');

        if(typeof requestBody.paymentMethod !== "string" 
          || (requestBody.paymentMethod !== EPaymentMethod.INTEREST_PER_MONTH_AND_CAPITAL_AT_MATURITY
            && requestBody.paymentMethod !== EPaymentMethod.INTEREST_AND_CAPITAL_AT_MATURITY
            && requestBody.paymentMethod !== EPaymentMethod.INTEREST_AND_CAPITAL_PER_MONTH)) throw new BadRequestException('SCF.LIBERA.319');

        if(requestBody.isPunctualPlan && typeof requestBody.isPunctualPlan !== "boolean")
          throw new BadRequestException('SCF.LIBERA.338');

        if(evidenceFilename && typeof evidenceFilename !== "string")
          throw new BadRequestException('SCF.LIBERA.339');

        if(requestBody.clientPermissions && requestBody.clientPermissions.length > 0) {
            const permissionParsed = FinancingPlanParser.clientsPermissionValidator(requestBody.clientPermissions);
            if (!permissionParsed) throw new BadRequestException('SCF.LIBERA.320');
        }

        planCreated  = await EnterpriseService.createEnterpriseFinancingPlan(enterpriseId, requestBody, userId, evidenceFilename);
        break;
    
      default:
        throw new BadRequestException('SCF.LIBERA.321');
    }

    console.log(`Handler: Ending ${context.functionName} `);
    return Response.Ok(planCreated);

  }catch (errors) {
    console.error('HANDLER ERRORS: ', errors);
    return handleException(errors);
  }
}

export const handler = middy(originalHandler)
  .use(authorizerPermissions({
    permissions: [
        PermissionEnum.CREATE_FINANCING_PLAN
    ]
  }));
