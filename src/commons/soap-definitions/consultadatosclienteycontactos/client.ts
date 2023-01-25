import { Client as SoapClient, createClientAsync as soapCreateClientAsync } from "soap";
import { TnsmnsjeEntradaType } from "./definitions/TnsmnsjeEntradaType";
import { TnsmnsjeSalidaType } from "./definitions/TnsmnsjeSalidaType";
import { ConsultaClienteYContactosService } from "./services/ConsultaClienteYContactosService";

export interface ConsultaDatosClienteYContactosClient extends SoapClient {
    ConsultaClienteYContactosService: ConsultaClienteYContactosService;
    consultarDatosClienteYContactosAsync(consultarDatosClienteYContactos: TnsmnsjeEntradaType): Promise<TnsmnsjeSalidaType>;
}

/** Create ConsultaDatosClienteYContactosClient */
export function createClientAsync(...args: Parameters<typeof soapCreateClientAsync>): Promise<ConsultaDatosClienteYContactosClient> {
    return soapCreateClientAsync(args[0], args[1], args[2]) as any;
}
