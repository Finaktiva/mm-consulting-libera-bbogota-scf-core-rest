import { createClientAsync, TnsmnsjeSalidaType } from "commons/soap-definitions/consultadatosclienteycontactos";
import { EncabezadoEntrada } from "commons/soap-definitions/consultadatosclienteycontactos/definitions/EncabezadoEntrada";
import { BadRequestException, ConflictException, NotFoundException } from "commons/exceptions";
import file from 'commons/soap-definitions/wsdls/ConsultaDatosClienteYContactos.xml';
import ClientsParser from "commons/parsers/clients.parser";
import { IClientBasicData } from "commons/interfaces/api-interfaces/client.interface";
import { parseToEnterpriseDocumentCode } from "commons/enums/cat-enterprise-document-code-type.enum";

export class ClientsAndContactsService {

    static async getInformation(trmnalId: string, documentType: string, document_number: string ):Promise<IClientBasicData> {
        console.log('SERVICE: Starting getInformation method...');
        let responseFromAPI: TnsmnsjeSalidaType = null;

        if(!documentType) {
            throw new BadRequestException('SCF.LIBERA.271');
        }

        documentType = parseToEnterpriseDocumentCode(documentType);
        if(!documentType) {
            throw new BadRequestException('SCF.LIBERA.273', {documentType});
        }

        let headers:EncabezadoEntrada={
            AplCod: "518",
            TrmnalId: trmnalId,
            SesionId: "A001",
            PtcionId: new Date().getTime().toString(),
            Usrio: "string",
            PtcionFecha: new Date().toISOString()
        };

        console.log(`headers for request: ${ JSON.stringify(headers) }`);

        let payload = {
            IdentificacionTipo: documentType,
            Identificacion: document_number,
            CntactoTipo: '1',
        }
        console.log('---> request PAYLOAD: ', payload);

        try {
            console.log(`mainImage ${ file }`);

            const client = await createClientAsync(file);

            console.log(`despues de client`);

            responseFromAPI = await client.consultarDatosClienteYContactosAsync({
                EncabezadoEntrada:headers,
                ConsultarDatosClienteYContactosEntrada: payload
            });

            console.log(`==> Response from API: ${JSON.stringify(responseFromAPI[0])}`);

        } catch (errors) {
            console.error('API CONNECTION EXCEPTION DETECTED!!: ', errors);
            throw new ConflictException('SCF.LIBERA.274');
        }

        if (responseFromAPI[0].EncabezadoSalida.RtaCod == "3"){
            console.error(`Client with document number ${payload.Identificacion} was not found`);
            
            throw new NotFoundException('SCF.LIBERA.275', { documentNumber: payload.Identificacion });
        }

        let response = ClientsParser.parseClientBasicData(responseFromAPI[0].ConsultarDatosClienteYContactosSalida);
        console.log('SERVICE: Ending getInformation method...');
        return response;
    }
}
