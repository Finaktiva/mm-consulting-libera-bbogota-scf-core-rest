import { HttpStatus } from 'commons/http.status';
import _ from 'lodash';
import { Response } from 'lambda-proxy-utils';
import  templateCodes from '../../../resources/template-codes.json';

export class LiberaException extends Error {
    public statusCode = null;
    public code = null;
    public mergeVariables = null;
    public message = null;

    constructor(){
        super();
    }

}
export class UnAuthorizedException extends LiberaException {

    constructor(code:string,mergeVariable?:any){
        super();
        this.statusCode = HttpStatus.UNAUTHORIZED;
        this.code = code;
        this.mergeVariables = mergeVariable;
    }


};
export class ForbiddenException extends LiberaException {

    constructor(code:string,mergeVariable?:any){
        super();
        this.statusCode = HttpStatus.FORBIDDEN;
        this.code = code;
        this.mergeVariables = mergeVariable;
    }

};

export class BadRequestException extends LiberaException {
    
    constructor(code:string,mergeVariable?:any){
        super();
        this.statusCode = HttpStatus.BAD_REQUEST;
        this.code = code;
        this.mergeVariables = mergeVariable;
    }

}

export class NotFoundException extends LiberaException {
    
    constructor(code:string,mergeVariable?:any){
        super();
        this.statusCode = HttpStatus.NOT_FOUND;
        this.code = code;
        this.mergeVariables = mergeVariable;
    }

}

export class ConflictException extends LiberaException {
    
    constructor(code:string,mergeVariable?:any){
        super();
        this.statusCode = HttpStatus.CONFLICT;
        this.code = code;
        this.mergeVariables = mergeVariable;
    }

}

export class InternalServerException extends LiberaException {
    constructor(code: string, mergeVariables?: any) {
        super();
        this.code = code;
        this.mergeVariables = mergeVariables;
        this.statusCode = HttpStatus.INTERNAL_ERROR_SERVER;
    }
}

export const handleException = (liberaException: LiberaException) => {
    const { statusCode, code, mergeVariables } = liberaException;
    delete liberaException.statusCode;
    
    const compiled = _.template(templateCodes[code]);

    let message = !mergeVariables ?  compiled() : compiled(mergeVariables);
    return new Response({cors:true,statusCode}).send({
        code,
        message
        });
    
}