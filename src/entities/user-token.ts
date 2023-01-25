import { Entity, BaseEntity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { CatTokenType } from './cat-token-type';
import { User } from './user';
import { UserTokenTypeEnum } from 'commons/enums/user-token-type.enum';

@Entity({name: 'USER_TOKEN'})
export class UserToken extends BaseEntity {

    @ManyToOne(type => CatTokenType, token => token.userTokens, {primary: true})
    @JoinColumn({
        name: 'TOKEN_TYPE'
    })
    tokenType: CatTokenType;

    @ManyToOne(type => User, user => user.userTokens, {primary: true})
    @JoinColumn({
        name: 'USER_ID'
    })
    user: User;

    @Column({name: 'TOKEN'})
    value: String;

    @Column({name: 'EXPIRATION_DATE'})
    expirationDate: Date;

    static getUserToken(token: string) {
        return this.createQueryBuilder('userToken')
            .leftJoinAndSelect('userToken.tokenType', 'tokenType')
            .leftJoinAndSelect('userToken.user','user')
            .where('userToken.token = :token', { token })
            .andWhere('tokenType.type = :type', { type: UserTokenTypeEnum.UPDATE_PASSWORD_CHALLENGE })
            .getOne();
    }
}