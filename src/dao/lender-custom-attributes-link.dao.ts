import { getConnection } from 'commons/connection';
import { ICustomAttribute } from 'commons/interfaces/lender-payer.interface';
import { LenderCustomAttributesLink } from 'entities/lender-custom-attributes-link';

export class LenderCustomAttributesLinkDAO {

    static async getByFundingLinkIdAndCustomAttributeId(enterpriseFundingLinkId: number, lenderCustomAttributeId: number) {
        console.log('DAO: Starting getByFundingLinkIdAndCustomAttributeId method');
        await getConnection();
        const lenderCustomAttributesLink = await LenderCustomAttributesLink
            .getByFundingLinkIdAndCustomAttributeId(enterpriseFundingLinkId, lenderCustomAttributeId);
        console.log('DAO: Ending getByFundingLinkIdAndCustomAttributeId method');
        return lenderCustomAttributesLink;
    }

    static async getAllByEnterpriseFundingLinkId(enterpriseFundingLinkId: number): Promise<ICustomAttribute[]> {
        console.log('DAO: Starting getAllByEnterpriseFundingLinkId method');
        await getConnection();
        const lenderCustomAttributesLink: ICustomAttribute[] = await LenderCustomAttributesLink
            .getAllByEnterpriseFundingLinkId(enterpriseFundingLinkId);
        console.log('DAO: Ending getAllByEnterpriseFundingLinkId method');
        return lenderCustomAttributesLink;
    }

    static async delete(lenderCustomAttributesLink: LenderCustomAttributesLink) {
        console.log('DAO: Starting delete method');
        await getConnection();
        await lenderCustomAttributesLink.remove();
        console.log('DAO: Ending delete method');
    }

    static async save(lenderCustomAttributesLink: LenderCustomAttributesLink) {
        console.log(`DAO: Starting save`);
        await getConnection();
        await lenderCustomAttributesLink.save();
        console.log(`DAO: Ending save`);
        return lenderCustomAttributesLink;
    }

    static async getById(lenderCustomAttributesLinkId: number) {
        console.log(`DAO: Starting getById method`);
        await getConnection();
        const lenderCustomAttributesLink: LenderCustomAttributesLink =
            await LenderCustomAttributesLink.getById(lenderCustomAttributesLinkId);
        console.log(`DAO: Ending getById method`);
        return lenderCustomAttributesLink;
    }

    static async getBasicByCatCustomAttributeId(catCustomAttributeId: number): Promise<LenderCustomAttributesLink[]> {
        console.log(`DAO: Starting getIdsByCatCustomAttributeId method`);
        await getConnection();
        const lenderCustomAttrLinkIds: LenderCustomAttributesLink[] =
            await LenderCustomAttributesLink.getBasicByCatCustomAttributeId(catCustomAttributeId);
        console.log(`DAO: Ending getIdsByCatCustomAttributeId method`);
        return lenderCustomAttrLinkIds;
    }

    static async deleteByIds(lenderCustomAttrsLinkIds: number[]) {
        console.log(`DAO: Starting deleteByIds method`);
        await getConnection();
        await LenderCustomAttributesLink.deleteByIds(lenderCustomAttrsLinkIds);
        console.log(`DAO: Ending deleteByIds method`);
    }
}