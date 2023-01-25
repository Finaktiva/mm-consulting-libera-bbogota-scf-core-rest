import { Entity, BaseEntity, PrimaryColumn, Column, OneToMany } from 'typeorm';
import { EnterpriseModule } from './enterprise-module';
import { CatModuleEnum } from 'commons/enums/cat-module.enum';
import { UserModule } from './user-module';
import { CatModuleDocumentation } from './cat-module-documentation';

@Entity({ name: 'CAT_MODULE' })
export class CatModule extends BaseEntity {

    @PrimaryColumn({ 
        name: 'NAME', 
        type: 'enum',
        enum: CatModuleEnum
    })
    name: CatModuleEnum;

    @Column({
        name: 'DESCRIPTION',
        nullable: true
    })
    description: string;

    @OneToMany(type => EnterpriseModule, enterpriseModule => enterpriseModule.catModule)
    enterpriseModules: EnterpriseModule[];

    @OneToMany(type => UserModule, userModule => userModule.catModule)
    userModules: UserModule[];

    @OneToMany(type => CatModuleDocumentation, catModuleDocumentation => catModuleDocumentation.catModule)
    catModuleDocumentations: CatModuleDocumentation[];

    static getCatModules(catModules: CatModule[]): Promise<CatModule[]> {
        return this.createQueryBuilder('catModule')
            .where('catModule.name IN (:catModules)', { catModules })
            .getMany();
    }

    static getModule(name: CatModuleEnum){
        return this.createQueryBuilder('catModule')
            .where('catModule.name =:name', {name})
            .getOne();
    }

    static getCatModulesDistinct(catModules: string[]): Promise<CatModule[]> {
        return this.createQueryBuilder('catModule')
            .where('catModule.name NOT IN (:catModules)', { catModules })
            .getMany();
    }

    static getAllCatModules(): Promise<CatModule[]> {
        return this.createQueryBuilder('catModule')
            .leftJoinAndSelect('catModule.catModuleDocumentations', 'catModuleDocumentations')
            .leftJoinAndSelect('catModuleDocumentations.documentType', 'documentType')
            .leftJoinAndSelect('documentType.enterpriseDocumentations', 'enterpriseDocumentation')
            .getMany();
    }

}
