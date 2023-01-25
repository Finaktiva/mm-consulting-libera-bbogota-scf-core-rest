import { Entity, BaseEntity, JoinColumn, ManyToOne } from 'typeorm';
import { EnterpriseInvoice } from './enterprise-invoice';
import { EnterpriseInvoiceBulkNegotiation } from './enterprise-invoice-bulk-negotiation';

@Entity({ name: 'REL_ENTERPRISE_INVOICE_BULK_NEGOTIATION_REQUEST' })
export class RelationBulkNegotiation extends BaseEntity {

    @ManyToOne(type => EnterpriseInvoice, invoice => invoice.realtionBulkNegotiation, { primary:  true })
    @JoinColumn({
        name: 'ENTERPRISE_INVOICE_ID'
    })
    enterpriseInvoice: EnterpriseInvoice;

    @ManyToOne(type => EnterpriseInvoiceBulkNegotiation, negotiationBulk => negotiationBulk.realtionBulkNegotiation, { primary:  true })
    @JoinColumn({
        name: 'ENTERPRISE_INVOICE_BULK_NEGOTIATION_REQUEST_ID'
    })
    invoiceBulkNegotiation: EnterpriseInvoiceBulkNegotiation;

    static rollbackRelationNegotiationBulk(negotiationBulkId: number) {
        return this.createQueryBuilder('relationNegotiationBulk')
            .leftJoin('relationNegotiationBulk.invoiceBulkNegotiation','invoiceBulkNegotiation')
            .delete()
            .where('invoiceBulkNegotiation.id = :negotiationBulkId', { negotiationBulkId })
            .execute();
    }

    static saveBulkRelations(negotiations: RelationBulkNegotiation[]){
        const queryBuilder = this.createQueryBuilder()
        .insert()
        .into(RelationBulkNegotiation)
        .values(negotiations)
        .execute();
    }
}