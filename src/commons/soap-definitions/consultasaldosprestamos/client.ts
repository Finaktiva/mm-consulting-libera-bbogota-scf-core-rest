import { Client as SoapClient, createClientAsync as soapCreateClientAsync } from "soap";
import { TnsmnsjeEntradaType } from "./definitions/TnsmnsjeEntradaType";
import { TnsmnsjeSalidaType } from "./definitions/TnsmnsjeSalidaType";
import { ConsultaSaldosPrestamosService } from "./services/ConsultaSaldosPrestamosService";

export interface ConsultaSaldosPrestamosClient extends SoapClient {
    ConsultaSaldosPrestamosService: ConsultaSaldosPrestamosService;
    ConsultarSaldosPrestamosAsync(consultarSaldosPrestamos: TnsmnsjeEntradaType): Promise<TnsmnsjeSalidaType>;
}

/** Create ConsultaSaldosPrestamosClient */
export function createClientAsync(...args: Parameters<typeof soapCreateClientAsync>): Promise<ConsultaSaldosPrestamosClient> {
    console.log('args[0] ==> ', args[0]);
    return soapCreateClientAsync(args[0], args[1], args[2]) as any;
}
