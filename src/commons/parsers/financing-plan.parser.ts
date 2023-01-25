import { EFinancingObservations, EFinancingPlanClientPermission, EinancingPlanStatus } from "commons/enums/financing-plan-type.enum";
import { IResponseFinancingPlan } from "commons/interfaces/enterprise-document.interface";
import { EnterpriseFinancingPlan } from "entities/enterprise-financing-plan";
import moment from "moment";

export default class FinancingPlanParser{
  static parseFinancingPlanReq(reqBody, enterpriseId, user, file?): EnterpriseFinancingPlan {
    const newFinancingPlan: EnterpriseFinancingPlan = new EnterpriseFinancingPlan();

    newFinancingPlan.folioNumber = reqBody.folio;
    newFinancingPlan.type = reqBody.type;
    newFinancingPlan.payer = enterpriseId;

    newFinancingPlan.minBaseRate = reqBody.minimumRate.baseType;
    newFinancingPlan.minBaseRateValue = reqBody.minimumRate.baseValue;
    newFinancingPlan.minSpecialRateValue = reqBody.minimumRate.specialRate;
    newFinancingPlan.minRatePeriodicity = reqBody.minimumRate.periodicityType;
    newFinancingPlan.minEfectiveRateEA = reqBody.minimumRate.ea;
    newFinancingPlan.minEfectiveRateMV = reqBody.minimumRate.mv;

    newFinancingPlan.negociatedBaseRate = reqBody.negotiatedRate.baseType;
    newFinancingPlan.negociatedBaseRateValue = reqBody.negotiatedRate.baseValue;
    newFinancingPlan.negociatedSpecialRateValue = reqBody.negotiatedRate.specialRate;
    newFinancingPlan.negociatedRatePeriodicity = reqBody.negotiatedRate.periodicityType;
    newFinancingPlan.negociatedEfecRateEA = reqBody.negotiatedRate.ea;
    newFinancingPlan.negociatedEfecRateMV = reqBody.negotiatedRate.mv;

    newFinancingPlan.validityDays = reqBody.validityDays;
    newFinancingPlan.validityDate = reqBody.validityDate;
    
    newFinancingPlan.payDayInitialRange = reqBody.paydayInitialRange;
    newFinancingPlan.operationTermDays = reqBody.termDays;
    newFinancingPlan.paymentMethod = reqBody.paymentMethod;

    newFinancingPlan.salesCut = reqBody.salesCut ? reqBody.salesCut : null;
    newFinancingPlan.comments = reqBody.comments ? reqBody.comments : null;
    
    newFinancingPlan.provider = reqBody.providerOptions ? reqBody.providerOptions.providerId : null;
    newFinancingPlan.agreement = reqBody.providerOptions ? reqBody.providerOptions.hasAgreement : null;
    newFinancingPlan.providerAuth = reqBody.providerOptions ? reqBody.providerOptions.requireAuthToPerformOperation : null;
    newFinancingPlan.authDays = reqBody.providerOptions && reqBody.providerOptions.authDay ? reqBody.providerOptions.authDay : null;

    newFinancingPlan.sales = reqBody.totalSales ? reqBody.totalSales : null;
    newFinancingPlan.specialRate = reqBody.isSpecialRate === null || reqBody.isSpecialRate === undefined ? null : reqBody.isSpecialRate;
    newFinancingPlan.payDayFinalRange = reqBody.paydayFinalRange ? reqBody.paydayFinalRange : null;
    newFinancingPlan.punctualPlan = reqBody.isPunctualPlan ? reqBody.isPunctualPlan : null;
    newFinancingPlan.evidenceFile = file ? file : null;
    newFinancingPlan.creationDate = moment().toDate();
    newFinancingPlan.status = EinancingPlanStatus.PENDING_APPROVAL;
    newFinancingPlan.creationUser = user;

    return newFinancingPlan;
  }

  static parseFinancingPlanRes(planCreated, reqBody, relNegRatePeriodicity):IResponseFinancingPlan {

    let arrObservations: string[] = [];
    if(planCreated.agreement)
      arrObservations.push(EFinancingObservations.AGREEMENT);
    if(reqBody.economicGroup)
      arrObservations.push(EFinancingObservations.ECONOMIC_GROUP);
    if(planCreated.specialRate)
      arrObservations.push(EFinancingObservations.SPECIAL_RATE);

    const result = {
      id: +planCreated.id,
      folio: planCreated.folio,
      type: planCreated.type,
      comments: planCreated.comments ? planCreated.comments : null,
      status: planCreated.status,
      effectivenessDate: planCreated.validityDate,
      observations: arrObservations,
      summary: {
        termDays: +planCreated.operationTermDays,
        negotiatedRate: {
          baseType: {
            code: relNegRatePeriodicity.baseRateType.code,
            description: relNegRatePeriodicity.baseRateType.description
          },
          specialRate: +planCreated.negociatedSpecialRateValue,
          periodicityType: {
            code: relNegRatePeriodicity.basePeriodicityType.code,
            description: relNegRatePeriodicity.basePeriodicityType.description
          }
        }
      }

    }
    return result;
  }

  static clientsPermissionValidator = (permissions: string[]) => {
    for (const permission of permissions) {
      switch (permission) {
          case EFinancingPlanClientPermission.DAYS:
              return EFinancingPlanClientPermission.DAYS;
  
          case EFinancingPlanClientPermission.DAYS_FINANCED_TERM:
              return EFinancingPlanClientPermission.DAYS_FINANCED_TERM;
  
          case EFinancingPlanClientPermission.DISCOUNT:
              return EFinancingPlanClientPermission.DISCOUNT;
  
          case EFinancingPlanClientPermission.RATE:
              return EFinancingPlanClientPermission.RATE;
  
          case EFinancingPlanClientPermission.RATE_FINANCED_TERM:
              return EFinancingPlanClientPermission.RATE_FINANCED_TERM;
  
          case EFinancingPlanClientPermission.TERM:
              return EFinancingPlanClientPermission.TERM;

          default:
              return null;
      }
    }
  }
}