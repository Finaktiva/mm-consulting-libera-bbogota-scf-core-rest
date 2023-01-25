import { RateTypeEnum } from "./enums/rate-type.enum";

export default class EmailTextParser {

    static quotaRateTypeEspParser(rateType: RateTypeEnum) {
        switch(rateType){
            case RateTypeEnum.ADVANCE_MONTH_RATE:
                return QuotaRateTypeEsp.ADVANCE_MONTH_RATE;
            case RateTypeEnum.ANNUAL_RATE:
                return QuotaRateTypeEsp.ANNUAL_RATE;
            case RateTypeEnum.DUE_MONTH_RATE:
                return QuotaRateTypeEsp.DUE_MONTH_RATE;
            case RateTypeEnum.PREFERENTIAL_RATE:
                return QuotaRateTypeEsp.PREFERENTIAL_RATE;
            case RateTypeEnum.VARIABLE_RATE:
                return QuotaRateTypeEsp.VARIABLE_RATE;
            case RateTypeEnum.FIXED_RATE:
                return QuotaRateTypeEsp.FIXED_RATE;
        }
    }
}

enum QuotaRateTypeEsp {
    DUE_MONTH_RATE = 'Mes vencido',
    FIXED_RATE = 'Fijo',
    ANNUAL_RATE = 'Anual',
    ADVANCE_MONTH_RATE = 'Mes Anticipado',
    PREFERENTIAL_RATE = 'Preferencial',
    VARIABLE_RATE = 'Variable'
}