import { getConnection } from 'commons/connection';
import { UserToken } from 'entities/user-token';

export class UserTokenDAO{

    static async getUserToken(token: string) {
        console.log('DAO: Starting getToken...');
        await getConnection();
        const userToken = await UserToken.getUserToken(token);

        console.log('DAO: Starting getToken...');
        return userToken;
    }

    static async deleteUserToken(userToken: UserToken) {
        console.log('DAO: Starting deleteUserToken method');
        await getConnection();
        await userToken.remove();
        console.log('DAO: Ending deleteUserToken method');
    }
}