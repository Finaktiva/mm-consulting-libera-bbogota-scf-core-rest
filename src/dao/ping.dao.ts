import { getConnection } from 'commons/connection';
import { Ping } from '../entities/Ping';
import { Connection } from 'typeorm/connection/Connection'
const uuidv4 = require('uuid/v4');

export class PingDAO {

    static async doPing() {
        let connection:Connection = await getConnection();
        let ping:Ping =  new Ping();
        ping.creationDate = new Date();
        ping.uuid = uuidv4();
        return connection.manager.save(ping);
    }

}