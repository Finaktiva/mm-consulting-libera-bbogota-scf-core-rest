import { UnAuthorizedException, ForbiddenException, ConflictException, BadRequestException } from 'commons/exceptions';
import { UserDAO } from 'dao/user.dao';
import { UserStatus } from 'commons/enums/user-status.enum';
import { User } from 'entities/user';
import { EnterpriseStatusEnum } from 'commons/enums/enterprise-status.enum';

export class CognitoService{

    static async getUserIdentifierByEmail(email:string):Promise<number> {
        
        console.log(`SERVICE: starting getUserIdentifierByEmail method`);        
        const user:User = await UserDAO.getUserByEmail(email);

        if(!user || (user && user.status == UserStatus.DELETED))
            throw new UnAuthorizedException('SFC.LIBERA.401');
        console.log(`SERVICE: finished getUserIdentifierByEmail method`);
        return user.id;
    
    }

    static async verifyUserIdentityByEmail(email:string) {
        console.log(`SERVICE: starting verifyUserIdentityByEmail method`);

        if(!email) throw new BadRequestException('SCF.LIBERA.400', { errors: "no email provided"});

        console.log(`provided email: ${email}`);

        const user = await UserDAO.getUserByEmail(email);

        if(!user) throw new ConflictException('SCF.LIBERA.01');

        console.log('user exists');

        if(user.status === UserStatus.DELETED) throw new UnAuthorizedException('SCF.LIBERA.401');

        console.log('user status is not DELETED');

        if(user.status === UserStatus.DISABLED) throw new ForbiddenException('SCF.LIBERA.403');

        console.log('user status is not DISABLED');

        if(user.ownerEnterprise && user.ownerEnterprise.status === EnterpriseStatusEnum.REJECTED) 
            throw new UnAuthorizedException('SCF.LIBERA.401');
        
        if(user.userEnterprises && user.userEnterprises.filter(userEnterprise => userEnterprise.enterprise.status  === EnterpriseStatusEnum.REJECTED).length)
            throw new UnAuthorizedException('SCF.LIBERA.401');
        
        console.log('owner is not REJECTED');

        console.log("user",user);
        console.log('SERVICE: Finished verifyUserIdentityByEmail method');
    }
    
 }