import { EncabezadoSalida } from "./EncabezadoSalida";
import { ConsultarDatosClienteYContactosSalida } from "./ConsultarDatosClienteYContactosSalida";

/**
 * tns:MnsjeSalidaType
 * @targetNSAlias `enc`
 * @targetNamespace `http://bancodeoccidente.com.co/Servicios/Base/EncabezadosSOA`
 */
export interface TnsmnsjeSalidaType {
    /** EncabezadoSalida */
    EncabezadoSalida?: EncabezadoSalida;
    /** ConsultarDatosClienteYContactosSalida */
    ConsultarDatosClienteYContactosSalida?: ConsultarDatosClienteYContactosSalida;
}
