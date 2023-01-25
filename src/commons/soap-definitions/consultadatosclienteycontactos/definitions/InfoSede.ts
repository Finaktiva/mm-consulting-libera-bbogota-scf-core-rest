import { InfoSedeAsoc } from "./InfoSedeAsoc";

/** InfoSede */
export interface InfoSede {
    /** IdentificacionAsoc_type|xsd:string */
    IdentificacionAsoc?: string;
    /** NombreAsoc_type|xsd:string */
    NombreAsoc?: string;
    /** InfoSedeAsoc */
    InfoSedeAsoc?: InfoSedeAsoc;
}
