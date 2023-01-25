import { getConnection } from "commons/connection";
import { User } from "entities/user";
import { UserProperties } from "entities/user-properties";

export class MeDAO {

    static async getUserDetail(userId: number) {
        console.log('DAO: Starting getUserDetail method');
        await getConnection();
        const user = await User.getUserDetail(userId);
        console.log('DAO: Ending getUserDetail method');
        return user;
    }

    static async getMeById(userId: number) {
        console.log('DAO: Starting getMeById');
        await getConnection();
        const user = await User.getMeById(userId);
        console.log('DAO: Ending getMeById');
        return user;
    }

    static async getMyPropertiesById(userId: number) {
        console.log('DAO: Starting getMyPropertiesById');
        await getConnection();
        const props = await UserProperties.getUserPropertiesById(userId);
        console.log('DAO: Ending getMyPropertiesById');
        return props;
    }
}