import { UserTokenDAO } from 'dao/anonymous.dao';
import { UserStatus } from 'commons/enums/user-status.enum';
import { ForbiddenException, UnAuthorizedException, ConflictException } from 'commons/exceptions';

export class AnonymousService{
    
    static async valitatePasswordUpdateToken(token: string){
        console.log('SERVICE: Starting valitatePasswordUpdateToken...');

        const userToken = await UserTokenDAO.getUserToken(token);

        if(!userToken) throw new ConflictException('SCF.LIBERA.09', {token});

        if(userToken.user.status === UserStatus.DISABLED) throw new ForbiddenException('SCF.LIBERA.COMMON.403');

        if(userToken.user.status === UserStatus.DELETED) throw new UnAuthorizedException('SCF.LIBERA.COMMON.401');

        console.log('SERVICE: Ending valitatePasswordUpdateToken...');
    }

    static async deletePasswordUpdateToken(token: string) { 
        console.log('SERVICE: Starting deletePasswordUpdateToken method');
        const userToken = await UserTokenDAO.getUserToken(token);
        
        if(!userToken) throw new ConflictException('SCF.LIBERA.09', {token});

        if(userToken.user.status === UserStatus.DISABLED) throw new ForbiddenException('SCF.LIBERA.COMMON.403');

        if(userToken.user.status === UserStatus.DELETED) throw new UnAuthorizedException('SCF.LIBERA.COMMON.401');
        
        await UserTokenDAO.deleteUserToken(userToken);
        console.log('SERVICE: Ending deletePasswordUpdateToken method')
    }

}