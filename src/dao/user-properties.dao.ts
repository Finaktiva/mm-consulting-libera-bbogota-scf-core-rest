import { UserProperties } from 'entities/user-properties';
import { getConnection } from 'commons/connection';

export class UserPropertiesDAO {

    static async save(userProperties: UserProperties): Promise<UserProperties> {
        console.log('DAO: Starting save user properties');
        await getConnection();

        await userProperties.save();
        console.log('DAO: Ending save user properties');
        return userProperties;
    }

    static async getUserPropertiesById(userId: number) {
        console.log('DAO: Starting getUserPropertiesById');
        await getConnection();
        const userProperties = await UserProperties.getUserPropertiesById(userId);
        console.log('DAO: Ending getUserPropertiesById');
        return userProperties;
    }

    static async updateUserPropertiesById(userProperties: UserProperties, id: number) {
        console.log('DAO: Starting updateUserPropertiesById');
        await getConnection();
        const updatedUserProperties = await UserProperties.update(id, userProperties);
        console.log('DAO: Ending updateUserPropertiesById');
        return updatedUserProperties;
    }

}