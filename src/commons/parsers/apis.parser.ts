import { ApisRateTypeEnum } from "commons/enums/apis.enum";


export default class ApisParser {

  static parseDailyRates(dailyRates, type?: string) {
    console.log('PARSER: Starting parseDailyRates');

    dailyRates = dailyRates.data.filter(dailyRate => dailyRate.TypeRate.includes('DTF') || dailyRate.TypeRate.includes('IBR'));
    console.log('PARSER: Ending parseDailyRates');
    
    if (type) {
      switch(type) {
        case ApisRateTypeEnum.DTF:

          const parseDailyRatesDTF = [];
          for(dailyRates of dailyRates) {
            if(dailyRates.TypeRate.includes('DTF')) {
              parseDailyRatesDTF.push({
                type: dailyRates.TypeRate,
                percent: +dailyRates.Percent,
                startValidityDate: dailyRates.StartValidity,
                endValidityDate: dailyRates.EndValidity
              })
            }
          }
          return parseDailyRatesDTF;

        case ApisRateTypeEnum.IBR:
          
            const parseDailyRatesIBR = [];
            for(dailyRates of dailyRates) {
              if(dailyRates.TypeRate.includes('IBR')) {
                parseDailyRatesIBR.push({
                  type: dailyRates.TypeRate,
                  percent: +dailyRates.Percent,
                  startValidityDate: dailyRates.StartValidity,
                  endValidityDate: dailyRates.EndValidity
                })
              }
            }

          return parseDailyRatesIBR;
      }
    } else {
      return dailyRates.map(dailyRate => {
        return {
          type: dailyRate.TypeRate,
          percent: +dailyRate.Percent,
          startValidityDate: dailyRate.StartValidity,
          endValidityDate: dailyRate.EndValidity
        }
      })
    }
  }

  static parseBalances(responseFromAPI) {
    console.log('PARSER: Starting parseBalances');
    let parseBalance = responseFromAPI.InfoPrdctoPrstmo[0] ? 
    {
      dutyNumber: responseFromAPI.InfoPrdctoPrstmo[0].NumeroPrestamo ? 
                  responseFromAPI.InfoPrdctoPrstmo[0].NumeroPrestamo : null,                 
      payer: responseFromAPI.InfoPrdctoPrstmo[0].CtaNombre ? 
             responseFromAPI.InfoPrdctoPrstmo[0].CtaNombre : null,
      identificationNumber: responseFromAPI.InfoPrdctoPrstmo[0].IdentificacionTipo && responseFromAPI.InfoPrdctoPrstmo[0].Identificacion ? 
                            `${responseFromAPI.InfoPrdctoPrstmo[0].IdentificacionTipo} - ${responseFromAPI.InfoPrdctoPrstmo[0].Identificacion}` : null,
      officeCode: responseFromAPI.InfoPrdctoPrstmo[0].OficinaCodigo ? 
                  responseFromAPI.InfoPrdctoPrstmo[0].OficinaCodigo : null,
      product: responseFromAPI.InfoPrdctoPrstmo[0].ProductoTipo && responseFromAPI.InfoPrdctoPrstmo[0].ProductoTipoDesc ? 
               `${responseFromAPI.InfoPrdctoPrstmo[0].ProductoTipo} - ${responseFromAPI.InfoPrdctoPrstmo[0].ProductoTipoDesc}` : null,
      dutyValue: responseFromAPI.InfoPrdctoPrstmo[0].TotalMonto ? 
                 responseFromAPI.InfoPrdctoPrstmo[0].TotalMonto : null,
      disbursementDate: responseFromAPI.InfoPrdctoPrstmo[0].CredFecDsmblso ? 
                        responseFromAPI.InfoPrdctoPrstmo[0].CredFecDsmblso : null,
      defaulterDays: responseFromAPI.InfoPrdctoPrstmo[0].MoraDias ? 
                     +responseFromAPI.InfoPrdctoPrstmo[0].MoraDias : null,
      rateType: responseFromAPI.InfoPrdctoPrstmo[0].Puntos ? 
                responseFromAPI.InfoPrdctoPrstmo[0].Puntos : null,
      rate: responseFromAPI.InfoPrdctoPrstmo[0].FinanInd ? 
            responseFromAPI.InfoPrdctoPrstmo[0].FinanInd : null,
      score: responseFromAPI.InfoPrdctoPrstmo[0].PuntosInt ? 
             +responseFromAPI.InfoPrdctoPrstmo[0].PuntosInt : null,
      effectiveAnnualRate: responseFromAPI.InfoPrdctoPrstmo[0].IntTasa ? 
                           +responseFromAPI.InfoPrdctoPrstmo[0].IntTasa : null,
      nextPaymentDate: responseFromAPI.InfoPrdctoPrstmo[0].PagoProxFecha ? 
                       responseFromAPI.InfoPrdctoPrstmo[0].PagoProxFecha : null,
      nextFeeValue: responseFromAPI.InfoPrdctoPrstmo[0].PagoTotalVlr ? 
                    +responseFromAPI.InfoPrdctoPrstmo[0].PagoTotalVlr : null,
      capitalBalance: responseFromAPI.InfoPrdctoPrstmo[0].CapitalSld ? 
                      +responseFromAPI.InfoPrdctoPrstmo[0].CapitalSld : null,
      totalBalance: responseFromAPI.InfoPrdctoPrstmo[0].SldTotal ? 
                    +responseFromAPI.InfoPrdctoPrstmo[0].SldTotal : null,
      expirationDate: responseFromAPI.InfoPrdctoPrstmo[0].VenctoFecha ? 
                      responseFromAPI.InfoPrdctoPrstmo[0].VenctoFecha : null,
      status: responseFromAPI.InfoPrdctoPrstmo[0].EstadoPrestamo ? 
              responseFromAPI.InfoPrdctoPrstmo[0].EstadoPrestamo : null
    } : null
    console.log('PARSER: Ending parseBalances');
    return parseBalance;
  }

}