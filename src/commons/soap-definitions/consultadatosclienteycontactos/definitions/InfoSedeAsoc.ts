import { InfoSedeDir } from "./InfoSedeDir";
import { InfoSedeTel } from "./InfoSedeTel";
import { InfoSedeCorreoElectronico } from "./InfoSedeCorreoElectronico";

/** InfoSedeAsoc */
export interface InfoSedeAsoc {
    /** InfoSedeDir */
    InfoSedeDir?: InfoSedeDir;
    /** InfoSedeTel */
    InfoSedeTel?: InfoSedeTel;
    /** InfoSedeCorreoElectronico */
    InfoSedeCorreoElectronico?: InfoSedeCorreoElectronico;
}
