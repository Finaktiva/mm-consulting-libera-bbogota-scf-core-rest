import { EnterpriseFinancingPlan } from "entities/enterprise-financing-plan";
import { FinancingPlanClientPermission } from "entities/financing-plan-client-permission";
import moment from "moment";

export default class ClientPermissionParser{

  static parseClientPermission(financingPlan: EnterpriseFinancingPlan, permission: string): FinancingPlanClientPermission {
    const newClientPermission: FinancingPlanClientPermission = new FinancingPlanClientPermission();
      newClientPermission.financingPlan = financingPlan;
      newClientPermission.permission = permission;

    return newClientPermission;
  }

}