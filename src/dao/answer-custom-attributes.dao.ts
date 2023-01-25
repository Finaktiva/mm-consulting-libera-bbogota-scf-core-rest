import { getConnection } from 'commons/connection';
import { AnswerCustomAttributes } from 'entities/answer-custom-attributes';

export class AnswerCustomAttributesDAO {

    static async getByLenderCustomAttributeLinkId(lenderCustomAttributeLinkId: number) {
        console.log('DAO: Starting getByAttributeLinkId method');
        await getConnection();
        const result = await AnswerCustomAttributes.getByLenderCustomAttributeLinkId(lenderCustomAttributeLinkId);
        console.log('DAO: Starting getByAttributeLinkId method');
        return result;
    }

    static async update(answerCustomAttributes: AnswerCustomAttributes) {
        console.log('DAO: Starting update method');
        await getConnection();
        const result = await AnswerCustomAttributes.update({ id: answerCustomAttributes.id }, answerCustomAttributes);
        console.log('DAO: Ending update method');
        return result;
    }

    static async updateAttributes(answerCustomAttributes: AnswerCustomAttributes[]) {
        console.log('DAO: Starting updateAttributes method');
        await getConnection();
        await AnswerCustomAttributes.save(answerCustomAttributes);
        console.log('DAO: Ending updateAttributes method');
    }

    static async delete(answerCustomAttributes: AnswerCustomAttributes) {
        console.log('DAO: Starting delete method');
        await getConnection();
        await answerCustomAttributes.remove();
        console.log('DAO: Ending delete method');
    }

    static async save(answerCustomAttributes: AnswerCustomAttributes) {
        console.log(`DAO: Starting save method`);
        await getConnection();
        await answerCustomAttributes.save();
        console.log(`DAO: Ending save method`);
        return answerCustomAttributes;
    }

    static async deleteByLenderCustomAttrLinkIds(lenderCustomAttrLinkIds: number[]) {
        console.log(`DAO: Starting deleteByLenderCustomAttrLinkIds method`);
        await getConnection();
        await AnswerCustomAttributes.deleteByLenderCustomAttrLinkIds(lenderCustomAttrLinkIds);
        console.log(`DAO: Ending deleteByLenderCustomAttrLinkIds method`);
    }

    /*
    static async getAnswerByAttributeLinkAndAttributeLenderId(lenderAttributeLinkId: number, lenderAttributeId: number){
        console.log(`DAO: Starting getAnswerByAttributeLinkAndAttributeLenderId method`);
        await getConnection();
        const result = await AnswerCustomAttributes.getAnswerByAttributeLinkAndAttributeLenderId(lenderAttributeLinkId, lenderAttributeId);
        console.log(`DAO: Ending getAnswerByAttributeLinkAndAttributeLenderId method`);
        return result;
    }
    */
}