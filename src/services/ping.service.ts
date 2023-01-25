import { PingDAO } from 'dao/ping.dao'; 

export class PingServices {

    static async getPing() {
        return PingDAO.doPing();
    }

}