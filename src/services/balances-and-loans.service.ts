import { ConflictException, NotFoundException } from "commons/exceptions";
import ApisParser from "commons/parsers/apis.parser";
import file from 'commons/soap-definitions/wsdls/ConsultaSaldosPrestamos.xml';
import { EncabezadoEntrada } from "commons/soap-definitions/consultasaldosprestamos/definitions/EncabezadoEntrada";
import { createClientAsync } from "commons/soap-definitions/consultasaldosprestamos";
import { ApiBalancesProductTypeEnum } from "commons/enums/apis.enum";

//process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

export class BanlancesAndLoansService {

  static async getInformation(trmnalId: string, loanNumber: string) {
    console.log('SERVICE: Starting getInformation method...');
    let responseFromAPI = null;

    let headers:EncabezadoEntrada = {
      AplCod: "518",
      TrmnalId: trmnalId,
      SesionId: "SP001",
      PtcionId: new Date().getTime().toString(),
      Usrio: "1234",
      PtcionFecha: new Date().toISOString()
    };
    console.log(`headers for request: ${ JSON.stringify(headers) }`);

    let payload = {
      OficinaCodigo: 'DG1',
      InfoPrdctoPrstmo: [{
        NumeroPrestamo: loanNumber
      }]
    };
    console.log('---> request PAYLOAD: ', payload);

    try {
      console.log(`mainImage ${ file }`);

      const client = await createClientAsync(file);
      //const client = await createClientAsync("src/commons/soap-definitions/wsdls/ConsultaSaldosPrestamos.wsdl");
      console.log(`client ==> ${JSON.stringify(client.wsdl.toXML()).substring(-4701).slice(-175, -65)}`);
      console.log(`despues de client`);

      responseFromAPI = await client.ConsultarSaldosPrestamosAsync({
        EncabezadoEntrada: headers,
        ConsultarSaldosPrestamosEntrada: payload
      });

      console.log(`==> Response from API: ${JSON.stringify(responseFromAPI[0])}`);

    } catch (errors) {
      console.error('API CONNECTION EXCEPTION DETECTED!!: ', errors);
      throw new ConflictException('SCF.LIBERA.382');
    }
    
    if (responseFromAPI[0].EncabezadoSalida.RtaCod && responseFromAPI[0].EncabezadoSalida.RtaCod === '999')
      throw new NotFoundException('SCF.LIBERA.384');

    if (responseFromAPI[0].ConsultarSaldosPrestamosSalida.InfoPrdctoPrstmo[0].ProductoTipo && 
      !(responseFromAPI[0].ConsultarSaldosPrestamosSalida.InfoPrdctoPrstmo[0].ProductoTipo in ApiBalancesProductTypeEnum)) 
      throw new ConflictException('SCF.LIBERA.383');

    let response = ApisParser.parseBalances(responseFromAPI[0].ConsultarSaldosPrestamosSalida);
    console.log('SERVICE: Ending getInformation method...');
    return response;
  }

}
