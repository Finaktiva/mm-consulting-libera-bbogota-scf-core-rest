import { Enterprise } from "entities/enterprise";
import { EnterpriseEconomicGroup } from "entities/enterprise-economic-group";
import { EnterpriseFinancingPlan } from "entities/enterprise-financing-plan";
import moment from "moment";

export default class EconomicGroupParser{
  static parseEconomicGroup(financingPlan: EnterpriseFinancingPlan, economicGroup, userFirmed): EnterpriseEconomicGroup {
    const newEconomicGroup: EnterpriseEconomicGroup = new EnterpriseEconomicGroup();

    newEconomicGroup.financingPlan = financingPlan;
    newEconomicGroup.enterprise = economicGroup.id;
    newEconomicGroup.sales = economicGroup.sale ? economicGroup.sale : null; 
    newEconomicGroup.salesCut = economicGroup.salesCut ? economicGroup.salesCut : null;
    newEconomicGroup.creationUser = userFirmed;
    newEconomicGroup.creationDate = moment().toDate();

    return newEconomicGroup;
  }

}