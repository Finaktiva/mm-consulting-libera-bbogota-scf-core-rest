import { CatModule } from 'entities/cat-module';
import { getConnection } from 'commons/connection';
import { CatModuleEnum } from 'commons/enums/cat-module.enum';

export class CatModuleDAO {

    static async getCatModules(modules: CatModule[]){
        console.log('DAO: Starting getCatModules');
        await getConnection();
        const catModules = await CatModule.getCatModules(modules);
        console.log('DAO: Ending getCatModules');
        return catModules;
    }

    static async getModule(name: CatModuleEnum){
        console.log('DAO: Starting getModule');
        await getConnection();
        const iModule = await CatModule.getModule(name);
        console.log('DAO: Ending getModule');
        return iModule;
    }

    static async getCatModulesDistinct(modules: string[]) {
        console.log('DAO: Starting getCatModulesDistinct');
        await getConnection();
        const catModules = await CatModule.getCatModulesDistinct(modules);
        console.log('DAO: Ending getCatModulesDistinct');
        return catModules;
    }

    static async getAllCatModules() {
        console.log('DAO: Starting getAllCatModules');
        await getConnection();
        const catModules = await CatModule.getAllCatModules();
        console.log('DAO: Ending getAllCatModules');
        return catModules;
    }

}