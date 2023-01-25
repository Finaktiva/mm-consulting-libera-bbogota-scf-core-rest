import { InfoCmpnts } from "./InfoCmpnts";

/**
 * InfoPrdctoPrstmo
 * @targetNSAlias `tns`
 * @targetNamespace `http://bancodeoccidente.com.co/Servicios/Negocio/Consulta/xsd/ConsultarSaldosPrestamos`
 */
export interface InfoPrdctoPrstmo1 {
    /** Fecha_type|xsd:string */
    CnsltaFcha?: string;
    /** dic:NumeroPrestamo_type */
    NumeroPrestamo?: string;
    /** OficinaCodigo_type|xsd:string */
    OficinaCodigo?: string;
    /** Dias_type|xsd:string */
    MoraDias?: string;
    /** dic:CuotaOtroGasto_type */
    CuotaOtroGasto?: string;
    /** dic:MontoPrestamo_type */
    TotalMonto?: string;
    /** dic:MontoPrestamo_type */
    UltimoPagoVlrCap?: string;
    /** dic:CtaNombre_type */
    CtaNombre?: string;
    /** Identificacion_type|xsd:string */
    Identificacion?: string;
    /** IdentificacionTipo_type|xsd:string */
    IdentificacionTipo?: string;
    /** ProductoTipo_type|xsd:string */
    ProductoTipo?: string;
    /** ProductoDesc_type|xsd:string */
    ProductoTipoDesc?: string;
    /** IntTasa_type|xsd:string */
    IntEfecTasa?: string;
    /** Fecha_type|xsd:string */
    CredFecDsmblso?: string;
    /** Fecha_type|xsd:string */
    UltimoPagoFecha?: string;
    /** dic:IntrsesMoraPagdos_type */
    MoraPago?: string;
    /** PagoVriosVlr_type|xsd:string */
    SaldoOtrosComponentes?: string;
    /** PagoVriosVlr_type|xsd:string */
    UltimoPagoCteIntVlr?: string;
    /** Vlr_type|xsd:string */
    UltimoPagoVlr?: string;
    /** dic:PrdctoEstado_type */
    PrdctoEstado?: string;
    /** Fecha_type|xsd:string */
    PagoProxFecha?: string;
    /** Fecha_type|xsd:string */
    VenctoFecha?: string;
    /** IntMoraVlr_type|xsd:string */
    MoraVlr?: string;
    /** Plazo_type|xsd:string */
    Plazo?: string;
    /** dic:PeriodicidadPago_type */
    PeriodicidadPago?: string;
    /** PagoTipo_type|xsd:string */
    IntPagoMdldad?: string;
    /** dic:SaldoTotal_type */
    SldTotal?: string;
    /** dic:FechaCuotaPagada_type */
    FechaCuotaPagada?: string;
    /** dic:PagoVlr_type */
    ValoraPagar?: string;
    /** LmteFecha_type|xsd:string */
    FechaLimitePago?: string;
    /** dic:CuotaVlr_type */
    PagoTotalVlr?: string;
    /** dic:SaldoTotal_type */
    CapitalSld?: string;
    /** IntMoraVlr_type|xsd:string */
    IntCte?: string;
    /** PagoVriosVlr_type|xsd:string */
    CredAdicVlr?: string;
    /** dic:PagoProxTotal_type */
    PagoProxTotal?: string;
    /** ProductoEstado_type|xsd:string */
    EstadoPrestamo?: string;
    /** dic:ExcFecha_type */
    ExcFecha?: string;
    /** Tipo_type|xsd:string */
    IntTipo?: string;
    /** FinanInd_type|xsd:string */
    FinanInd?: string;
    /** Puntos_type|xsd:string */
    Puntos?: string;
    /** dic:PuntosInt_type */
    PuntosInt?: string;
    /** IntTasa_type|xsd:string */
    IntTasa?: string;
    /** IntTasa_type|xsd:string */
    IntNmnalTasa?: string;
    /** VgnteCapitalSld_type|xsd:string */
    VgnteCapitalSld?: string;
    /** dic:PgdoIntVlr_type */
    PgdoIntVlr?: string;
    /** dic:MontoCausIntAntPag_type */
    MontoCausIntAntPag?: string;
    /** UltimaNovedadFecha_type|xsd:string */
    UltimaNovedadFecha?: string;
    /** dic:NumdiaMorxParam_type */
    NumdiaMorxParam?: string;
    /** dic:VencdoComponentes_type */
    VencdoComponentes?: string;
    /** PagoVriosVlr_type|xsd:string */
    SaldoOtrosComponentesAsoc?: string;
    /** dic:Valor_type */
    DeudaTotal?: string;
    /** dic:IntrsesMoraPagdos_type */
    IntrsesMoraPagdos?: string;
    /** dic:IntrsesCausdos_type */
    IntrsesCausdos?: string;
    /** dic:Valor_type */
    ConsigTotalVlr?: string;
    /** dic:Valor_type */
    CapitalVlr?: string;
    /** dic:Valor_type */
    VemctoCapitalSld?: string;
    /** dic:IntrsesCausdos_type */
    IntCorrienteCausado?: string;
    /** IntNetoVlr_type|xsd:string */
    VencdoInt?: string;
    /** dic:IntrsesCausdos_type */
    IntCausadoNoPagado?: string;
    /** InfoCmpnts[] */
    InfoCmpnts?: Array<InfoCmpnts>;
}
