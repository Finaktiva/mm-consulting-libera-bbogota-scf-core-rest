import { getConnection } from 'commons/connection';
import { EnterpriseModule } from 'entities/enterprise-module';
import { CatModuleEnum } from 'commons/enums/cat-module.enum';
import { Connection } from 'typeorm';


export class EnterpriseModuleDAO{
    
    static async saveEnterpriseModules(enterpriseModules:EnterpriseModule[]){
        console.log('DAO: Starting saveEnterpriseModules method');
        let connection:Connection = await getConnection();
        enterpriseModules = await connection.manager.save(enterpriseModules);
        console.log('DAO: Finished saveEnterpriseModules method');
        return enterpriseModules;
    }

    static async getEnterpriseModuleByIdAndModuleName(enterpriseId:number,moduleName:CatModuleEnum): Promise<EnterpriseModule>{
        console.log('DAO: Starting getEnterpriseModuleByIdAndModuleName');
        await getConnection();
        const enterpriseModule = await EnterpriseModule.getModuleByEnterpriseIdAndModuleName(enterpriseId,moduleName);
        console.log('DAO: Finished getEnterpriseModuleByIdAndModuleName method');
        return enterpriseModule;
    }

    static async saveEnterpriseModule(eModule:EnterpriseModule):Promise<EnterpriseModule>{
        console.log('DAO: Starting saveEnterpriseModule method');
        await getConnection();
        const mod = await EnterpriseModule.save(eModule);
        console.log('DAO: Ending saveEnterpriseModule method');
        return mod;

    }

    static async getModulesByEnterpriseById(enterpriseId: number){
      console.log('DAO Starting getModulesByEnterpriseById');
      await getConnection();
      const enterpriseModules = await EnterpriseModule.getByEnterpriseId(enterpriseId);
      console.log('DAO Ending getModulesByEnterpriseById');
      return enterpriseModules;
    }

    static async getModuleByEntepriseId(enterpriseId: number){
        console.log('DAO Starting getModuleByEntepriseId');
        await getConnection();
        const enterpriseModules = await EnterpriseModule.getModuleByEntepriseId(enterpriseId);
        console.log('DAO Ending getModuleByEntepriseId');
        return enterpriseModules;
    }
    
    static async deleteEnterpriseModules(enterpriseModules:EnterpriseModule[]){
        console.log('DAO: Starting deleteEnterpriseModules method');
        let connection:Connection = await getConnection();
        enterpriseModules = await connection.manager.remove(enterpriseModules);
        console.log('DAO: Finished deleteEnterpriseModules method');
        return enterpriseModules;
    }

    static async deleteEnterpriseModule(enterpriseModule: EnterpriseModule) {
        console.log('DAO: Starting deleteEnterpriseModule method');
        await getConnection();
        await EnterpriseModule.remove(enterpriseModule);
        console.log('DAO: Ending deleteEnterpriseModule method');        
    }

    static async save(module: EnterpriseModule){
        console.log('DAO: Starting save');
        await getConnection();
        const enterpriseModule = await EnterpriseModule.save(module);
        console.log('DAO: Ending save');
        return enterpriseModule;
    }

}