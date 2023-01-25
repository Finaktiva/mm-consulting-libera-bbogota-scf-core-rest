import { TnsmnsjeEntradaType } from "../definitions/TnsmnsjeEntradaType";
import { TnsmnsjeSalidaType } from "../definitions/TnsmnsjeSalidaType";

export interface ConsultaClienteYContactosPort {
    consultarDatosClienteYContactos(consultarDatosClienteYContactos: TnsmnsjeEntradaType, callback: (err: any, result: TnsmnsjeSalidaType, rawResponse: any, soapHeader: any, rawRequest: any) => void): void;
}
