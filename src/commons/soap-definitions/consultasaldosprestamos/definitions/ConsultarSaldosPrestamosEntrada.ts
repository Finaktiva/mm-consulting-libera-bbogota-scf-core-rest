import { InfoPrdctoPrstmo } from "./InfoPrdctoPrstmo";

/**
 * ConsultarSaldosPrestamosEntrada
 * @targetNSAlias `tns`
 * @targetNamespace `http://bancodeoccidente.com.co/Servicios/Negocio/Consulta/xsd/ConsultarSaldosPrestamos`
 */
export interface ConsultarSaldosPrestamosEntrada {
    /** OficinaCodigo_type|xsd:string */
    OficinaCodigo?: string;
    /** InfoPrdctoPrstmo[] */
    InfoPrdctoPrstmo?: Array<InfoPrdctoPrstmo>;
}
