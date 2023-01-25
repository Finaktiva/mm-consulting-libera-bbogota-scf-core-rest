import { TnsmnsjeEntradaType } from "../definitions/TnsmnsjeEntradaType";
import { TnsmnsjeSalidaType } from "../definitions/TnsmnsjeSalidaType";

export interface ConsultaSaldosPrestamosClienteSoap {
    ConsultarSaldosPrestamos(consultarSaldosPrestamos: TnsmnsjeEntradaType, callback: (err: any, result: TnsmnsjeSalidaType, rawResponse: any, soapHeader: any, rawRequest: any) => void): void;
}
