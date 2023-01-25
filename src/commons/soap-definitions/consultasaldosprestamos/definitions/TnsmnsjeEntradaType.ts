import { EncabezadoEntrada } from "./EncabezadoEntrada";
import { ConsultarSaldosPrestamosEntrada } from "./ConsultarSaldosPrestamosEntrada";

/**
 * tns:MnsjeEntradaType
 * @targetNSAlias `enc`
 * @targetNamespace `http://bancodeoccidente.com.co/Servicios/Base/EncabezadosSOA`
 */
export interface TnsmnsjeEntradaType {
    /** EncabezadoEntrada */
    EncabezadoEntrada?: EncabezadoEntrada;
    /** ConsultarSaldosPrestamosEntrada */
    ConsultarSaldosPrestamosEntrada?: ConsultarSaldosPrestamosEntrada;
}
