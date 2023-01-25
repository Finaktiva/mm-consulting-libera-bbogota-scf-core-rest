import { getConnection } from "commons/connection";
import { UserModule } from "entities/user-module";
import { CatModuleEnum } from "commons/enums/cat-module.enum";
import { Connection } from "typeorm";

export class UserModuleDAO {

    static async save(uModule: UserModule){
        console.log('DAO: Starting save');
        await getConnection();
        const userModule = await UserModule.save(uModule);
        console.log('DAO: Ending save');
        return userModule;
    }

    static async deleteUserModuleById(userId: number) {
        console.log('DAO: Starting deleteUserModuleById');
        await getConnection();
        await UserModule.deleteUserModuleById(userId);
        console.log('DAO: Ending deleteUserModuleById')
    }

    static async getUserModulesByUserId(userId: number) {
        console.log('DAO: Starting getUserModulesByUserId');
        await getConnection();
        const modules = await UserModule.getModulesByUserId(userId);
        console.log('DAO: Ending getUserModulesByUserId');
        return modules;
    }

    static async deleteUserModuleByNameAndUserId(userId: number, catModule: CatModuleEnum) {
        console.log('DAO: Starting deleteUserModuleByNameAndUserId');
        await getConnection();
        await UserModule.deleteModuleByUserIdAndName(userId, catModule);
        console.log('DAO: Ending deleteUserModuleByNameAndUserId');
    }

    static async saveUserModules(userModules: UserModule[]){
        console.log('DAO: Starting saveEnterpriseModules method');
        let connection: Connection = await getConnection();
        userModules = await connection.manager.save(userModules);
        console.log('DAO: Finished saveEnterpriseModules method');
        return userModules;
    }

    static async deleteUserModules(userModules: UserModule[]){
        console.log('DAO: Starting saveEnterpriseModules method');
        let connection:Connection = await getConnection();
        userModules = await connection.manager.remove(userModules);
        console.log('DAO: Finished saveEnterpriseModules method');
        return userModules;
    }

    static async deleteUserModule(userModule: UserModule) {
        console.log('DAO: Starting deleteUserRole');
        await getConnection();
        await UserModule.remove(userModule);
        console.log('DAO: Ending deleteUserRole');
    }
}