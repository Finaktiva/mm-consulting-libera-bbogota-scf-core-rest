
/**
 * EncabezadoEntrada
 * @targetNSAlias `tns`
 * @targetNamespace `http://bancodeoccidente.com.co/Servicios/Base/EncabezadosSOA`
 */
export interface EncabezadoEntrada {
    /** xsd:int */
    AplCod?: string;
    /** xsd:string */
    TrmnalId?: string;
    /** xsd:string */
    SesionId?: string;
    /** xsd:string */
    PtcionId?: string;
    /** xsd:string */
    Usrio?: string;
    /** xsd:dateTime */
    PtcionFecha?: string;
}
