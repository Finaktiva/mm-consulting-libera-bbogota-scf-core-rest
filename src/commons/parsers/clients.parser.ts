import { CatEnterpriseDocumentCodeTypeEnum } from "commons/enums/cat-enterprise-document-code-type.enum";
import { ConflictException } from "commons/exceptions";
import { IClientBasicData } from "commons/interfaces/api-interfaces/client.interface";
import { PostEnterpriseDocumentResponse } from "commons/interfaces/post-enterprise-documentation.interface";
import { ConsultarDatosClienteYContactosSalida, TnsmnsjeSalidaType } from "commons/soap-definitions/consultadatosclienteycontactos";
import { EnterpriseDocumentation } from "entities/enterprise-documentation";
import moment from "moment";

export default class ClientsParser {

    /**
   * @description Parse a new client basic info response
   * @param       { TnsmnsjeSalidaType } clientFromAPI
   * @returns     { IClientBasicData }
   * @author      festrada
   */
    static parseClientBasicData(clientFromAPI: ConsultarDatosClienteYContactosSalida): IClientBasicData {
        console.log('PARSER: Starting parseClientBasicData function...');

        if (clientFromAPI == null)
            throw new ConflictException('SCF.LIBERA.276');

        let infoGerentes = clientFromAPI.InfoGerentes;
        let relationshipManager: string[];

        if (infoGerentes != null && infoGerentes.InfoGerentesDtll.length > 0) {
                relationshipManager = infoGerentes.InfoGerentesDtll.map( manager => {
                return manager.Nombre;
            });
        }
        console.log('relationshipManager --> ', relationshipManager);
        let notRepeatedManager = [... new Set(relationshipManager)];

        let clientBasicData: IClientBasicData = {
            documentType: clientFromAPI.IdentificacionTipo,
            documentNumber: clientFromAPI.Identificacion,
            ciiu: clientFromAPI.ActividadEconomica,
            enterpriseName: clientFromAPI.IdentificacionTipo === CatEnterpriseDocumentCodeTypeEnum.NIT || 
                            clientFromAPI.IdentificacionTipo === CatEnterpriseDocumentCodeTypeEnum.AUTONOMOUS_HERITAGE ?
                            clientFromAPI.RazonSocial : 
                            clientFromAPI.NombreComercial,
            relationshipManager: notRepeatedManager.length > 0 ? notRepeatedManager.join(', ') : null               
        }

        console.log(`===> clientBasicData parsed: ${ JSON.stringify(clientBasicData) }`);

        console.log('PARSER: Ending parseClientBasicData function...');

        return clientBasicData;
    }
    
    static parseCreateEnterpriseDocumentationResponse(enterpriseDocument: EnterpriseDocumentation) {
        console.log('PARSER: Starting parseCreateEnterpriseDocumentationResponse function...');
        let finalResponse: PostEnterpriseDocumentResponse = {
            id: enterpriseDocument.id,
            documentTypeDescription: enterpriseDocument.documentTypeDescription,
            effectiveness: enterpriseDocument.effectiveness,
            creationDate: enterpriseDocument.creationDate ? moment(enterpriseDocument.creationDate).format('YYYY-MM-DD') : null,
            status: enterpriseDocument.status,
            modificationDate: enterpriseDocument. modificationDate ? moment(enterpriseDocument. modificationDate).format('YYYY-MM-DD') : null,
            expeditionDate:enterpriseDocument.expeditionDate ? moment(enterpriseDocument.expeditionDate).format('YYYY-MM-DD') : null,
            effectivenessDate: enterpriseDocument.effectivenessDate ? moment(enterpriseDocument.effectivenessDate).format('YYYY-MM-DD') : null,
            file: enterpriseDocument.s3Metadata,
            type: {
                templateUrl:  enterpriseDocument.documentType.templateUrl,
                required:  enterpriseDocument.documentType.required,
                code:  enterpriseDocument.documentType.code,
                description:  enterpriseDocument.documentType.description,
                announcement:  enterpriseDocument.documentType.announcement,
                monthEffectiveness: enterpriseDocument.documentType.effectiveness
            },
            comment: enterpriseDocument.comment
        }
        console.log('PARSER: Ending parseCreateEnterpriseDocumentationResponse function...');
        return finalResponse;
    }
}