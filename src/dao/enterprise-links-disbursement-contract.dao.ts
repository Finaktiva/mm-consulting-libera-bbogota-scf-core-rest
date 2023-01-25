import { EnterpriseLinkTypeEnum } from "commons/enums/enterprise-link-type.enum";
import { InternalServerException } from "commons/exceptions";
import { EnterpriseLinksDisbursementContract } from "entities/enterprise-links-disbursement-contract";
import { getConnection } from "typeorm";

export class EnterpriseLinksDisbursementContractDAO {

    static async save(disbursementContract: EnterpriseLinksDisbursementContract): Promise<EnterpriseLinksDisbursementContract> {
        console.log('DAO: Starting getBankByCode function');
        let disbursementContractEntity: EnterpriseLinksDisbursementContract;

        try {
            await getConnection();
            disbursementContractEntity = await EnterpriseLinksDisbursementContract.save(disbursementContract);
        }
        catch(errors) {
            console.error('DAO ERRORS: ', errors);
            throw new InternalServerException('SCF.LIBERA.COMMON.500', {errors});
        }
        console.log('DAO: Ending getBankByCode method');
        return disbursementContractEntity;
    }

    static async getById(id: number): Promise<EnterpriseLinksDisbursementContract> {
        console.log('DAO: Starting getById function');
        let disbursementContractEntity: EnterpriseLinksDisbursementContract;

        try {
            await getConnection();
            disbursementContractEntity = await EnterpriseLinksDisbursementContract.findOne(id);
        }
        catch(errors) {
            console.error('DAO ERRORS: ', errors);
            throw new InternalServerException('SCF.LIBERA.COMMON.500', {errors});
        }

        console.log('DAO: Ending getById method');
        return disbursementContractEntity;
    }

    static async getByRequestLinkKeys(requestingEnterpriseId: number, requestedEnterpriseId: number,
            linkType: EnterpriseLinkTypeEnum): Promise<EnterpriseLinksDisbursementContract> {
        console.log('DAO: Starting getByRequestLinkKeys function');
        let disbursementContractEntity: EnterpriseLinksDisbursementContract;

        try {
            await getConnection();
            disbursementContractEntity = await EnterpriseLinksDisbursementContract.getByRequestLinkKeys(
                requestingEnterpriseId, requestedEnterpriseId, linkType);
        }
        catch(errors) {
            console.error('DAO ERRORS: ', errors);
            throw new InternalServerException('SCF.LIBERA.COMMON.500', {errors});
        }

        console.log('DAO: Ending getByRequestLinkKeys method');
        return disbursementContractEntity;
    }
}