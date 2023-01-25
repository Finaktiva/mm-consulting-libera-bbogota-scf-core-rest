export enum EnterpriseRequestTypeEnum {
     ENTERPRISE_LINKING = 'ENTERPRISE_LINKING',
     ENTERPRISE_MODULE_ACTIVATION = 'ENTERPRISE_MODULE_ACTIVATION'
}

export const isEnterpriseRequestTypeValid = (value: string) => {
     if(!value) return null;

     switch (value) {
          case EnterpriseRequestTypeEnum.ENTERPRISE_LINKING:
               return EnterpriseRequestTypeEnum.ENTERPRISE_LINKING;
          case EnterpriseRequestTypeEnum.ENTERPRISE_MODULE_ACTIVATION:
               return EnterpriseRequestTypeEnum.ENTERPRISE_MODULE_ACTIVATION;
          default:
               return null;
     }
}