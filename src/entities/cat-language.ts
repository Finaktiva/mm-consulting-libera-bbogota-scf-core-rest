import { BaseEntity, PrimaryColumn, Column, OneToMany, Entity } from "typeorm";
import { CatLanguageEnum } from "commons/enums/cat-language.enum";
import { User } from "./user";

@Entity({name: 'CAT_LANGUAGE'})
export class CatLanguage extends BaseEntity {

    @PrimaryColumn({ 
        name: 'CODE', 
        type: 'enum',
        enum: CatLanguageEnum
    })
    code: CatLanguageEnum;

    @Column({
        name: 'DESCRIPTION'
    })
    description: string;

    @OneToMany(type => User, user => user.preferredLanguage)
    userCatLanguage: User[];

    static getAllLanguages() {
        return this.createQueryBuilder('catLanguage')
            .getManyAndCount();
    }

    static getLanguageByCode(code: string) {
        return this.createQueryBuilder('catLanguage')
            .where('catLanguage.code = :code', {code})
            .getOne();
    }
    
}