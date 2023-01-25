import { Entity, BaseEntity, ManyToOne, JoinColumn } from "typeorm";
import { User } from "./user";
import { CatModule } from "./cat-module";
import { CatModuleEnum } from "commons/enums/cat-module.enum";


@Entity({name: 'USER_MODULE'})
export class UserModule extends BaseEntity {

    @ManyToOne(type => User, user => user.userModules, {primary: true})
    @JoinColumn({
        name: 'USER_ID'
    })
    user: User;

    @ManyToOne(type => CatModule, catModule => catModule.userModules, {primary: true})
    @JoinColumn({
        name: 'MODULE'
    })
    catModule: CatModule;

    static deleteUserModuleById(userId: number){
        return this.createQueryBuilder('userModule')
            .leftJoinAndSelect('userModule.user', 'user')
            .delete()
            .where('user.id = :userId', { userId })
            .execute();
    }

    static getModulesByUserId(userId: number) {
        return this.createQueryBuilder('userModules')
        .leftJoinAndSelect('userModules.user', 'user')
        .andWhere('user.id = :userId', {userId})
        .getMany();
    }

    static deleteModuleByUserIdAndName(userId: number, catModule: CatModuleEnum) {
        return this.createQueryBuilder('userModule')
            .leftJoinAndSelect('userModule.user', 'user')
            .leftJoinAndSelect('userModule.catModule', 'catModule')
            .delete()
            .where('user.id = :userId', {userId})
            .andWhere('catModule.name = :catModule', {catModule})
            .execute();
    }
}