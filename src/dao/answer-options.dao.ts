import { getConnection } from 'commons/connection';
import { AnswerOptions } from "entities/answer-options";

export class AnswerOptionsDAO {

    static async save(answerOption: AnswerOptions) {
        console.log(`DAO: Starting save method`);
        await getConnection();
        const result = await answerOption.save();
        console.log(`DAO: Ending save method`);
        return result;
    }

    static async deletePreviousOptionsByAnswerId(answerId: number) {
        console.log(`DAO: Starting deletePreviousOptionsByAnswerId method`);
        await getConnection();
        await AnswerOptions.deletePreviousOptionsByAnswerId(answerId);
        console.log(`DAO: Ending deletePreviousOptionsByAnswerId method`);
    }

    static async getAnswerByLinkIdAndAttributeId(linkId: number, attributeId: number) {
        console.log(`DAO: Starting getAnswerByLinkIdAndAttributeId method`);
        await getConnection();
        const result = await AnswerOptions.getAnswerByLinkIdAndAttributeId(linkId, attributeId);
        console.log(`DAO: Ending getAnswerByLinkIdAndAttributeId method`);
        return result;
    }

    static async getOptionsByAnswerId(answerId: number) {
        console.log(`DAO: Starting getOptionsByAnswerId method`);
        await getConnection();
        const result = await AnswerOptions.getOptionsByAnswerId(answerId);
        console.log(`DAO: Ending getOptionsByAnswerId method`);
        return result;
    }

    static async deleteByAnswerCustomAttrIds(answerIds: number[]) {
        console.log(`DAO: Starting deleteByAnswerCustomAttrIds method`);
        await getConnection();
        const result = await AnswerOptions.deleteByAnswerCustomAttrIds(answerIds);
        console.log(`DAO: Ending deleteByAnswerCustomAttrIds method`);
    }
}