import { EncabezadoSalida } from "./EncabezadoSalida";
import { ConsultarSaldosPrestamosSalida } from "./ConsultarSaldosPrestamosSalida";

/**
 * tns:MnsjeSalidaType
 * @targetNSAlias `enc`
 * @targetNamespace `http://bancodeoccidente.com.co/Servicios/Base/EncabezadosSOA`
 */
export interface TnsmnsjeSalidaType {
    /** EncabezadoSalida */
    EncabezadoSalida?: EncabezadoSalida;
    /** ConsultarSaldosPrestamosSalida */
    ConsultarSaldosPrestamosSalida?: ConsultarSaldosPrestamosSalida;
}
