import { Entity, BaseEntity, PrimaryColumn, Column, OneToMany } from 'typeorm';
import { UserToken } from './user-token';

@Entity({name: 'CAT_TOKEN_TYPE'})
export class CatTokenType extends BaseEntity {

    @PrimaryColumn({name: 'TYPE'})
    type: string;

    @Column({name: 'DESCRIPTION'})
    description: string;
    
    @OneToMany(type => UserToken, userToken => userToken.tokenType)
    userTokens: UserToken[];

    static getType(type : string){
        return this.createQueryBuilder('catTokenType')
            .where('catTokenType.type = :type', {type})
            .getOne();
    }
}