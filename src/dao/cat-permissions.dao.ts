import { getConnection } from "commons/connection";
import { CatPermission } from "entities/cat-permissions";


export class CatPermissionsDAO {
    static async getAllPermissions(): Promise<CatPermission[]> {
        console.log('DAO: Starting getAllPermissions');
        await getConnection();
        const permissions: CatPermission[]  = await CatPermission.getAllPermissions();
        console.log('DAO: Ending getAllPermissions');
        return permissions;
    }

}