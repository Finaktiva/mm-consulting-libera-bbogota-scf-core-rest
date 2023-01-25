import { InfoDir } from "./InfoDir";
import { InfoTelefono } from "./InfoTelefono";
import { RepresentanteLegal } from "./RepresentanteLegal";
import { InfoCntactoDatos } from "./InfoCntactoDatos";
import { InfoCorreoElectronico } from "./InfoCorreoElectronico";
import { InfoSedes } from "./InfoSedes";
import { InfoGerentes } from "./InfoGerentes";
import { InfoCntacto } from "./InfoCntacto";

/**
 * ConsultarDatosClienteYContactosSalida
 * @targetNSAlias `tns`
 * @targetNamespace `http://bancodeoccidente.com.co/Servicios/Negocio/Consulta/xsd/ConsultarDatosClienteYContactos`
 */
export interface ConsultarDatosClienteYContactosSalida {
    /** EstCod_type|xsd:string */
    EstCod?: string;
    /** PrdctoDesc_type|xsd:string */
    PrdctoDesc?: string;
    /** PersonaTipo_type|xsd:string */
    PersonaTipo?: string;
    /** IdentificacionTipo_type|xsd:string */
    IdentificacionTipo?: string;
    /** Identificacion_type|xsd:string */
    Identificacion?: string;
    /** DgtoChqueo_type|xsd:string */
    DgtoChqueo?: string;
    /** ExpedicionFecha_type|xsd:string */
    ExpedicionFecha?: string;
    /** ExpedicionLugar_type|xsd:string */
    ExpedicionLugar?: string;
    /** CliNomPrmro_type|xsd:string */
    CliNomPrmro?: string;
    /** CliNomSgndo_type|xsd:string */
    CliNomSgndo?: string;
    /** CliApellPrmro_type|xsd:string */
    CliApellPrmro?: string;
    /** CliApellSgndo_type|xsd:string */
    CliApellSgndo?: string;
    /** RazonSocial_type|xsd:string */
    RazonSocial?: string;
    /** NombreComercial_type|xsd:string */
    NombreComercial?: string;
    /** ClienteEst_type|xsd:string */
    ClienteEst?: string;
    /** ClienteNivel_type|xsd:string */
    ClienteNivel?: string;
    /** Sexo_type|xsd:string */
    Sexo?: string;
    /** CivilEst_type|xsd:string */
    CivilEst?: string;
    /** Profesion_type|xsd:string */
    Profesion?: string;
    /** Ocupacion_type|xsd:string */
    Ocupacion?: string;
    /** ViviendaTipo_type|xsd:string */
    ViviendaTipo?: string;
    /** EduNivel_type|xsd:string */
    EduNivel?: string;
    /** Estrato_type|xsd:string */
    Estrato?: string;
    /** VinculacionFecha_type|xsd:string */
    VinculacionFecha?: string;
    /** PersonasACargo_type|xsd:string */
    PersonasACargo?: string;
    /** HijosNum_type|xsd:string */
    HijosNum?: string;
    /** NactoFecha_type|xsd:string */
    NactoFecha?: string;
    /** NactoPais_type|xsd:string */
    NactoPais?: string;
    /** NactoDepto_type|xsd:string */
    NactoDepto?: string;
    /** NactoCiudad_type|xsd:string */
    NactoCiudad?: string;
    /** Nacionalidad_type|xsd:string */
    Nacionalidad?: string;
    /** EsClinton_type|xsd:string */
    EsClinton?: string;
    /** EsVIP_type|xsd:string */
    EsVIP?: string;
    /** TarjetaProfesional_type|xsd:string */
    TarjetaProfesional?: string;
    /** EsListaSeg_type|xsd:string */
    EsListaSeg?: string;
    /** ActividadEconomica_type|xsd:string */
    ActividadEconomica?: string;
    /** EntTipo_type|xsd:string */
    EntTipo?: string;
    /** ConstitucionFecha_type|xsd:string */
    ConstitucionFecha?: string;
    /** EsSIPLA_type|xsd:string */
    EsSIPLA?: string;
    /** EsEdoRcrsoAdmor_type|xsd:string */
    EsEdoRcrsoAdmor?: string;
    /** EsDeclEf_type|xsd:string */
    EsDeclEf?: string;
    /** EsExdoRf_type|xsd:string */
    EsExdoRf?: string;
    /** EsSegBca_type|xsd:string */
    EsSegBca?: string;
    /** InfoDir */
    InfoDir?: InfoDir;
    /** InfoTelefono */
    InfoTelefono?: InfoTelefono;
    /** RepresentanteLegal */
    RepresentanteLegal?: RepresentanteLegal;
    /** InfoCntactoDatos */
    InfoCntactoDatos?: InfoCntactoDatos;
    /** InfoCorreoElectronico */
    InfoCorreoElectronico?: InfoCorreoElectronico;
    /** InfoSedes */
    InfoSedes?: InfoSedes;
    /** InfoGerentes */
    InfoGerentes?: InfoGerentes;
    /** InfoCntacto */
    InfoCntacto?: InfoCntacto;
}
