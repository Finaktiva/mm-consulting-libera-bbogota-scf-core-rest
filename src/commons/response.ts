import { HttpStatus } from '../commons/enums/http.status';
import {Response} from 'lambda-proxy-utils';

export default class Res {

    static Ok(data: any = {}, headers?: any) {
        return  this.parser(HttpStatus.OK,data, headers)
    }
    
    static Created(data?: any, headers?: any) {
        return this.parser(HttpStatus.CREATED, data, headers);
    }
    
    static NoContent() {
        return this.parser(HttpStatus.NO_CONTENT);
    }

    static parser(statusCode: number, data?: any, headers?: any) {
        data = data || {};
        headers =  headers || {};
        headers = {
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Access-Control-Expose-Headers': 'X-Total-Count, Authorization',
            ...headers
        };
        return new Response({statusCode, cors: true, headers}).send(JSON.stringify(data));
    }
}
