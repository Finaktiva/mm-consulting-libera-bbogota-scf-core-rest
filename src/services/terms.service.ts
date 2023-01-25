import { TermsDAO } from "dao/terms.dao";
import { S3Service } from "./s3.service";
import { EnterpriseDAO } from 'dao/enterprise.dao';
import { ConflictException } from "commons/exceptions";
import { RelEnterpriseTerms } from "entities/rel-enterprise-terms";
import { RelEnterpriseTermsDAO } from "dao/rel-enterprise-terms.dao";
import moment from 'moment-timezone';
import { UserEnterpriseDAO } from 'dao/user-enterprise.dao';

export class TermsService {
    
    static async getLatestTerm() {
        console.log('SERVICE: Starting getLatestTerm');
        const term = await TermsDAO.getLatestTerms();

        const url = await S3Service.getObjectUrl({ bucket: term.s3Metadata.bucket, fileKey: term.s3Metadata.fileKey, hours: 24 } )

        const response = {
            id: term.id,
            file: {
                id: term.s3Metadata.id,
                name: term.s3Metadata.filename,
                url: url
            }
        }
        console.log('SERVICE: Ending getLatestTerm');
        return response;
    }

    static async acceptTerms(termsId: number, userId: number, enterpriseId: number) {
        console.log('SERVICE: Starting acceptTerms');

        let user = null;

        let userEnterprise = await UserEnterpriseDAO.getByUserAndEnterpriseId(userId, enterpriseId);

        if (!userEnterprise) {
            const enterprise = await EnterpriseDAO.getEnterpriseByUserId(userId);
            console.log('enterprise ==========>', enterprise)
            if(+enterprise.id !== enterpriseId) throw new ConflictException('SCF.LIBERA.407');
            user = enterprise.owner;
        }else{
            user = userEnterprise.user;
        }

        const enterprise = await EnterpriseDAO.getEnterpriseById(enterpriseId);
        if (!enterprise) throw new ConflictException('SCF.LIBERA.19', { enterpriseId });

        const terms = await TermsDAO.getLatestTerms();
        if (+terms.id !== termsId) throw new ConflictException('SCF.LIBERA.403');

        const relEnterpriseTerms = new RelEnterpriseTerms();

        relEnterpriseTerms.enterprise = enterprise;
        relEnterpriseTerms.terms = terms;
        relEnterpriseTerms.user = user;
        relEnterpriseTerms.acceptance = moment().tz('UTC').toDate();

        await RelEnterpriseTermsDAO.save(relEnterpriseTerms);

        console.log('SERVICE: Ending acceptTerms');
    }

}