import { getConnection } from "commons/connection";
import { EnterpriseFundingLink } from "entities/enterprise-funding-link";
import { EnterpriseFundingTransactionStatusEnum } from 'commons/enums/enterprise-funding-transactions-status.enum';
import { EnterpriseFundingTransactionsTypeEnum } from 'commons/enums/enterprise-funding-transactions-type.enum';
import { EnterpriseFundingLinkStatusEnum } from 'commons/enums/enterprise-funding-link-status.enum';
import { BasicFilter, LenderPayersFilterBy, EnterpriseQuotaRequestFilterBy, EnterpriseQuotaRequestOrderBy } from 'commons/filter';
import { EnterpriseFundingLinkRateType } from "commons/enums/enterprise-funding-link-rate-type.enum";


export class EnterpriseFundingLinkDAO {
    static async getLinkByLenderIdAndPayerId(payerId: number, lenderId: number) {
        console.log('DAO: Starting getLinkByLenderIdAndPayerId');
        await getConnection();
        const link = await EnterpriseFundingLink.getLinkByPayerAndLenderId(payerId, lenderId);
        console.log('DAO: Ending getLinkByLenderIdAndPayerId');
        return link;
    }

    static async getBasicByLenderIdAndPayerId(lenderId: number, payerId: number,) {
        console.log('DAO: Starting getBasicByLenderIdAndPayerId method');
        await getConnection();
        const result = await EnterpriseFundingLink.getBasicByLenderIdAndPayerId(lenderId, payerId);
        console.log('DAO: Ending getBasicByLenderIdAndPayerId method');
        return result;
    }

    static async getGeneralBalance(enterpriseFundingLinkId: number) {
        console.log('DAO: Starting getGeneralBalance method');
        await getConnection();
        const data = await EnterpriseFundingLink.getGeneralBalanceData(enterpriseFundingLinkId);
        console.log('data', data);
        const { paymentA, withdrawlA, withdrawlPA, totalFundingAmount } = data;
        console.log('paymentA', +paymentA);
        console.log('withdrawlA', +withdrawlA);
        console.log('withdrawlPA', +withdrawlPA);
        const balance = +paymentA - (+withdrawlA + +withdrawlPA);
        console.log('balance', balance);
        console.log('totalFundingAmount', totalFundingAmount);
        const generalBalance = +totalFundingAmount + balance;
        console.log('availableQuota',generalBalance);
        console.log('DAO: Ending getGeneralBalance method');
        return  { paymentA: +paymentA, withdrawlA: +withdrawlA, withdrawlPA: +withdrawlPA, balance, totalFundingAmount: +totalFundingAmount, generalBalance}
    }

    static async getEnterprisePayersByLender(lenderId: number, filter: BasicFilter<LenderPayersFilterBy, string>) {
        console.log('DAO: Starting getEnterprisePayersByLender method');
        await getConnection();
        const enterprisePayersPage = await EnterpriseFundingLink.getEnterprisePayersByLender(lenderId, filter);
        console.log('enterprisePayersPage', enterprisePayersPage);
        console.log('DAO: Ending getEnterprisePayersByLender method');
        return enterprisePayersPage;
    }

    static async getByLenderIdAndPayerId(lenderId: number, payerId: number) {
        console.log('DAO: Starting getByLenderIdAndPayerId method');
        await getConnection();
        const result = await EnterpriseFundingLink.getByLenderIdAndPayerId(lenderId, payerId);
        console.log('DAO: Ending getByLenderIdAndPayerId method');
        return result;
    }

    static async getEnterpriseLendersByPayer(payerId: number,
        filter: BasicFilter<EnterpriseQuotaRequestFilterBy, EnterpriseQuotaRequestOrderBy>) {
        console.log('DAO: Starting getEnterpriseLendersByPayer method');
        const enterpriseLendersPage = await EnterpriseFundingLink.getEnterpriseLendersByPayer(payerId, filter);
        console.log('enterpriseLendersPage', JSON.stringify(enterpriseLendersPage));
        console.log('DAO: Ending getEnterpriseLendersByPayer method');
        return enterpriseLendersPage;
    }

    static async saveEnterpriseFundingLink(fundingLink: EnterpriseFundingLink): Promise<EnterpriseFundingLink> {
        console.log('DAO: Starting saveEnterpriseFundingLink');
        await getConnection();
        const createdQuotaRequest = await fundingLink.save();
        console.log('DAO: Ending saveEnterpriseFundingLink');
        return createdQuotaRequest;
    }

    static async getLinkByLenderIdAndPayerIdexist(payerId: number, lenderId: number) {
        console.log('DAO: Starting getLinkByLenderIdAndPayerId');
        await getConnection();
        const link = await EnterpriseFundingLink.getLinkByPayerAndLenderIdexist(payerId, lenderId);
        console.log('DAO: Ending getLinkByLenderIdAndPayerId');
        return link;
    }

    static async getEnterpriseLendersByHint(enterpriseId: number, hint:string):Promise<EnterpriseFundingLink[]>{
        console.log('DAO: Starting getEnterpriseLendersByHint');
        await getConnection();
        const lenders =  await EnterpriseFundingLink.getEnterpriseLendersByHint(enterpriseId, hint);
        console.log('DAO: Ending getEnterpriseLendersByHint');
        return lenders;
    }

    static async getRequestByEnterpriseIdAndLinkedId(enterpriseId: number, lenderId: number) {
        console.log('DAO: Starting getRequestByEnterpriseIdAndLinkedId');
        await getConnection();
        const link = EnterpriseFundingLink.getLenderByEnterpriseAndLinkId(enterpriseId, lenderId);
        console.log('DAO: Ending getRequestByEnterpriseIdAndLinkedId');
        return link;
    }

    static async updateByIdFundingLinkPayer(IdfundingLinkPayer: number, rateType: EnterpriseFundingLinkRateType, ratePercentage, totalFundingAmount) {
        console.log('DAO: Starting update method');
        await getConnection();
        await EnterpriseFundingLink.updateByIdFundingLinkPayer(IdfundingLinkPayer, rateType, ratePercentage, totalFundingAmount);
        console.log('DAO: Ending update method');
    }

}