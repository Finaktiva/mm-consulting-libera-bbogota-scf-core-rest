 import 'reflect-metadata';
import  { createConnection,Connection } from 'typeorm';
import { Role } from 'entities/role';
import { User } from 'entities/user';
import { CatTokenType } from 'entities/cat-token-type';
import { UserToken } from 'entities/user-token';
import { S3Metadata } from 'entities/s3-metadata';
import { CatDocumentType } from 'entities/cat-document-type';
import { CatModule } from 'entities/cat-module';
import { Enterprise } from 'entities/enterprise';
import { EnterpriseModule } from 'entities/enterprise-module';
import { EnterpriseDocumentation } from 'entities/enterprise-documentation';
import { UserProperties } from 'entities/user-properties';
import { UserRole } from 'entities/user-role';
import { UserEnterprise } from 'entities/user-enterprise';
import { UserModule } from 'entities/user-module';
import { Notification } from 'entities/notification';
import { CatNotificationType } from 'entities/cat-notification-type';
import { Ping } from 'entities/Ping';
import { CatModuleDocumentation } from 'entities/cat-module-documentation';
import { EnterpriseBranding } from 'entities/enterprise-branding';
import { EnterpriseRequest } from 'entities/enterprise-request';
import { EnterpriseLinks } from 'entities/enterprise-links';
import { CatLada } from 'entities/cat-lada';
import { CatSector } from 'entities/cat-sector';
import { EnterpriseRequestBulk } from 'entities/enterprise-request-bulk';
import { TemporalTokens } from 'entities/temporal-tokens';
import { CatCustomAttributes } from 'entities/cat-custom-attributes';
import { EnterpriseCustomAttributes } from 'entities/enterprise-custom-attributes';
import { EnterpriseInvoice } from 'entities/enterprise-invoice';
import { EnterpriseInvoiceCustomAttributes } from 'entities/enterprise-invoice-custom-attributes';
import { InvoiceNegotiationProcess } from 'entities/enterprise-invoice-negotiation-process';
import { CatCurrency } from 'entities/cat-currency';
import { EnterpriseInvoiceFiles } from 'entities/enterprise-invoice-files';
import { EnterpriseInvoiceBulk } from 'entities/enterprise-invoice-bulk';
import { EnterpriseInvoiceFundingProcess } from 'entities/enterprise-invoice-funding-process';
import { EnterpriseFundingLink } from 'entities/enterprise-funding-link';
import { EnterpriseFundingRequest } from 'entities/enterprise-funding-request';
import { CatLanguage } from 'entities/cat-language';
import { EnterpriseQuotaRequest } from 'entities/enterprise-quota-request';
import { EnterpriseFundingTransactions } from 'entities/enterprise-funding-transaccions';
import { AnswerCustomAttributes } from 'entities/answer-custom-attributes';
import { LenderCustomAttributes } from 'entities/lender-custom-attributes';
import { LenderCustomAttributesLink } from 'entities/lender-custom-attributes-link';
import { OptionCustomAttributes } from 'entities/option-custom-attributes';
import { AnswerOptions } from 'entities/answer-options';
import { EnterpriseInvoiceBulkNegotiation } from 'entities/enterprise-invoice-bulk-negotiation';
import { RelationBulkNegotiation } from 'entities/rel-enterprise-invoice-bulk-negotiation-request';
import { CodesCiiu } from 'entities/codes-ciiu';
import { CitiesDepartments } from 'entities/cities-departments';
import { Banks } from 'entities/banks';
import { EnterpriseLinksDisbursementContract } from 'entities/enterprise-links-disbursement-contract';
import { CatEconomicActivity } from 'entities/cat-ciiu-economic-activity';
import { CatEconomicSector } from 'entities/cat-ciiu-economic-sector';
import { CatRatePeriodicityType } from 'entities/cat_rate_periodicity_type';
import { CatBankRegion } from 'entities/cat-bank-regions';
import { CatBaseRateType } from 'entities/cat-base-rate-type';
import { RelBaseRatePeriodicity } from 'entities/rel_base_rate_periodicity';
import { EnterpriseFinancingPlan } from 'entities/enterprise-financing-plan';
import { EnterpriseEconomicGroup } from 'entities/enterprise-economic-group';
import { FinancingPlanClientPermission } from 'entities/financing-plan-client-permission';
import { CatPermission } from 'entities/cat-permissions';
import { RelRolePermission } from 'entities/rel-role-permission';
import { CatPermissionSegment } from 'entities/cat-permission-segment';
import {RelUserBankRegion} from 'entities/rel-user-bank-region';
import { RelEnterpriseTerms } from 'entities/rel-enterprise-terms';
import {Terms} from 'entities/terms';


const host:string = process.env.DB_HOST;
const port:number = +process.env.DB_PORT;
const username:string = process.env.DB_USER;
const password:string = process.env.DB_PASSWORD;
const database:string = process.env.DB_NAME;
let connection:Connection = null;

export async function getConnection(){

    if(!connection || !connection.isConnected){
        console.log('attempt to create new connection');

        connection = await createConnection({
            type: 'mysql',
            host : host,
            port : port,
            username: username,
            password : password,
            database: database,
            entities : [
                Ping,
                Role,
                User,
                CatTokenType,
                UserToken,
                S3Metadata,
                CatDocumentType,
                CatModule,
                Enterprise,
                EnterpriseModule,
                EnterpriseDocumentation,
                EnterpriseBranding,
                UserProperties,
                UserEnterprise,
                UserRole,
                UserModule,
                CatNotificationType,
                Notification,
                CatModuleDocumentation,
                EnterpriseBranding,
                EnterpriseRequest,
                EnterpriseLinks,
                CatLada,
                CatSector,
                CatDocumentType,
                CatModule,
                Enterprise,
                EnterpriseModule,
                EnterpriseRequestBulk,
                TemporalTokens,
                EnterpriseCustomAttributes,
                CatCustomAttributes,
                EnterpriseInvoice,
                EnterpriseInvoiceCustomAttributes,
                InvoiceNegotiationProcess,
                CatCurrency,
                EnterpriseInvoiceFiles,
                EnterpriseInvoiceBulk,
                EnterpriseInvoiceFundingProcess,
                EnterpriseFundingLink,
                EnterpriseFundingRequest,
                CatLanguage,
                EnterpriseFundingTransactions,
                EnterpriseQuotaRequest,
                AnswerCustomAttributes,
                LenderCustomAttributes,
                LenderCustomAttributesLink,
                OptionCustomAttributes,
                AnswerOptions,
                EnterpriseInvoiceBulkNegotiation,
                RelationBulkNegotiation,
                CodesCiiu,
                CitiesDepartments,
                Banks,
                EnterpriseLinksDisbursementContract,
                CatEconomicActivity,
                CatEconomicSector,
                CatBaseRateType,
                CatBankRegion,
                CatRatePeriodicityType,
                RelBaseRatePeriodicity,
                EnterpriseFinancingPlan,
                EnterpriseEconomicGroup,
                FinancingPlanClientPermission,
                CatPermission,
                RelRolePermission,
                CatPermissionSegment,
                RelUserBankRegion,
                RelEnterpriseTerms,
                Terms
            ], 
            synchronize: false,
            bigNumberStrings: true,
            supportBigNumbers: true
        });
    }else{
        console.log('connection succesfully recycled');
    }

    return connection;

};