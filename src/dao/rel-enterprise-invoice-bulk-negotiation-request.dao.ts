import { getConnection } from "commons/connection";
import { RelationBulkNegotiation } from "entities/rel-enterprise-invoice-bulk-negotiation-request";

export class RelationNegotiationBulkDAO {

    static async rollbackRelationNegotiationBulk(negotiationBulkId: number) {
        console.log('DAO: Starting rollbackRelationNegotiationBulk...');
        await getConnection();
        await RelationBulkNegotiation.rollbackRelationNegotiationBulk(negotiationBulkId);
        console.log('DAO: Ending rollbackRelationNegotiationBulk...');
    }

    static async saveRelationBulkNegotiations(relBulkNegotiations: RelationBulkNegotiation[]) {
        console.log('DAO: Starting saveRelationBulkNegotiations...');
        await getConnection();
        await RelationBulkNegotiation.saveBulkRelations(relBulkNegotiations);
        console.log('DAO: Ending saveRelationBulkNegotiations...');
    }
}
