import { EncabezadoEntrada } from "./EncabezadoEntrada";
import { ConsultarDatosClienteYContactosEntrada } from "./ConsultarDatosClienteYContactosEntrada";

/**
 * tns:MnsjeEntradaType
 * @targetNSAlias `enc`
 * @targetNamespace `http://bancodeoccidente.com.co/Servicios/Base/EncabezadosSOA`
 */
export interface TnsmnsjeEntradaType {
    /** EncabezadoEntrada */
    EncabezadoEntrada?: EncabezadoEntrada;
    /** ConsultarDatosClienteYContactosEntrada */
    ConsultarDatosClienteYContactosEntrada?: ConsultarDatosClienteYContactosEntrada;
}
