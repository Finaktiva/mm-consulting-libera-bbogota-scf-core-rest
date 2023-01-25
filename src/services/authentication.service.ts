import fetch from 'node-fetch';
import * as jwk from 'jsonwebtoken';
import jwkToPem from 'jwk-to-pem';
import { InternalServerException, UnAuthorizedException, ForbiddenException } from 'commons/exceptions';
import customPolicy from '../../resources/custom-policy.json';
import { RoleEnum } from 'commons/enums/role.enum';
import { UserDAO } from 'dao/user.dao';
import { PermissionEnum } from 'commons/enums/permission.enum';
import { UserRoleDAO } from 'dao/user-role.dao';

const issuer = `${process.env.COGNITO_ISS}/${process.env.COGNITO_USER_POOL_ID}`;

const generateIamPolicy = (Resource, context) => {
    customPolicy.policyDocument.Statement[0]['Resource'] = Resource;

    /**
     * Context format does not support complex objects
     * Props within context should be simple key-value pairs.
     */
    if (context?.identities)
        context.identities = JSON.stringify(context.identities);
    if (context['cognito:groups'])
        context['cognito:groups'] = JSON.stringify(context['cognito:groups']);

    customPolicy['context'] = context;
    console.log('>>>> customPolicy parsed: ', customPolicy);
    return customPolicy;
};

export class AuthenticationService {

    static async getPrincipal(token: string, resource: string): Promise<any> {
        console.log('SERVICE: Starting getPrincipal...');
        const result = await fetch(`${issuer}/.well-known/jwks.json`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        })
            .then(res => res.json());

        if (!result.keys) {
            throw new InternalServerException('SCF.LIBERA.COMMON.500', { errors: "" });
        }
        const k = result.keys[0];
        const jwkArray = {
            kty: k.kty,
            n: k.n,
            e: k.e
        };

        const pem = jwkToPem(jwkArray);

        console.log('SERVICE: Ending getPrincipal...');
        return new Promise((resolve, reject) => {
            jwk.verify(token, pem, { issuer }, (err: any, decoded: any) => {
                if (err) {
                    console.log('ERRROR');
                    console.log(err);
                    return reject(new UnAuthorizedException('SCF.LIBERA.COMMON.401'));
                }

                console.log('return policy');

                return resolve(generateIamPolicy(resource, decoded));
            });
        });

    }

    static async verifyRoles(userId: number, roles: RoleEnum[]) {
        console.log('SERVICE: Starting verifyRoles method');
        console.log('roles', roles);
        console.log('userId', userId);
        const user = await UserDAO.getUserByIdAndRoles(userId, roles);
        console.log(user);
        if (!user)
            throw new ForbiddenException('SCF.LIBERA.COMMON.403');

        console.log('SERVICE: Ending verifyRoles method');
    }

    static async verifyPermissions(userId: number, permissions: PermissionEnum[]) {
        console.log('SERVICE: Starting verifyPermissions method');
        console.log('permissions', permissions);
        console.log('userId', userId);
        const user = await UserRoleDAO.getUserByIdAndPermissions(userId, permissions);
        console.log(user);
        if (!user)
            throw new ForbiddenException('SFC.LIBERA.373');

        console.log('SERVICE: Ending verifyPermissions method');
    }

}