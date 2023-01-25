import { Entity, BaseEntity, ManyToOne, JoinColumn, Column } from 'typeorm';
import { CatModule } from './cat-module';
import { Enterprise } from './enterprise';
import { CatModuleEnum } from 'commons/enums/cat-module.enum';
import { EnterpriseModuleStatusEnum } from 'commons/enums/enterprise-module-status.enum';

@Entity({name: 'ENTERPRISE_MODULE'})
export class EnterpriseModule extends BaseEntity{
    
    @ManyToOne(type => Enterprise, enterprise => enterprise.id, {primary: true})
    @JoinColumn({
        name: 'ENTERPRISE_ID'
    })
    enterprise: Enterprise;

    @ManyToOne(type => CatModule, catModule => catModule.name, {primary: true})
    @JoinColumn({
        name: 'MODULE'
    })
    catModule: CatModule;

    @Column({
        name: 'STATUS',
        type: 'enum',
        enum: EnterpriseModuleStatusEnum
    })
    status: EnterpriseModuleStatusEnum;

    @Column({
        name: 'COMMENT'
    })
    comment: string;

    @Column({
        name: 'ACTIVATION_DATE'
    })
    activationDate: Date;

    static getByEnterpriseId(enterpriseId) {
        let query = this.createQueryBuilder('enterpriseModule')
            .leftJoinAndSelect('enterpriseModule.catModule', 'catModule')
            .leftJoinAndSelect('enterpriseModule.enterprise', 'enterprise')
            .leftJoinAndSelect('enterprise.enterpriseDocumentations', 'enterpriseEnterpriseDocumentations')
            .where('enterprise.id = :enterpriseId', { enterpriseId });

        //console.log(`query executed: `, query.getQueryAndParameters());

        return query.getMany();
    }
    
    static getModuleByEnterpriseIdAndModuleName(enterpriseId:number,moduleName:CatModuleEnum){

        return this.createQueryBuilder('enterpriseModule')
            .leftJoinAndSelect('enterpriseModule.enterprise', 'enterprise')
            .leftJoinAndSelect('enterpriseModule.catModule', 'catModule')
            .where('enterprise.id = :enterpriseId',{enterpriseId})
            .andWhere('catModule.name = :moduleName', {moduleName})
            .getOne();
    }

    static deleteEnterpriseModuleById(enterpriseId: number){
        return this.createQueryBuilder('enterpriseModule')
            .leftJoinAndSelect('enterpriseModule.enterprise', 'enterprise')
            .delete()
            .where('enterprise.id = :enterpriseId', { enterpriseId })
            .execute();
    }

    static getByEnterpriseIdAndModuleName(enterpriseId:number, moduleName:CatModuleEnum){
        return this.createQueryBuilder('enterpriseModule')
            .leftJoinAndSelect('enterpriseModule.enterprise', 'enterprise')
            .leftJoinAndSelect('enterpriseModule.catModule', 'catModule')
            .where('enterprise.id = :enterpriseId',{enterpriseId})
            .andWhere('catModule.name = :moduleName', {moduleName})
            .getOne();
    }

    static getModuleByEntepriseId(enterpriseId) {
        return this.createQueryBuilder('enterpriseModule')
            .leftJoinAndSelect('enterpriseModule.enterprise', 'enterprise')
            .leftJoinAndSelect('enterpriseModule.catModule', 'catModule')
            .where('enterprise.id = :enterpriseId', { enterpriseId })
            .getMany();
    }

    static getModulesByEntepriseId(enterpriseId) {
        return this.createQueryBuilder('enterpriseModule')
            .leftJoinAndSelect('enterpriseModule.catModule', 'catModule')
            .where('enterpriseModule.enterprise = :enterpriseId', { enterpriseId })
            .getMany();
    }

}