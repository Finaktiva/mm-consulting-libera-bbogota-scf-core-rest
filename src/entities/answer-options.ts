import { BaseEntity, Entity, JoinColumn, ManyToOne, OneToOne } from "typeorm";
import { AnswerCustomAttributes } from "./answer-custom-attributes";
import { OptionCustomAttributes } from "./option-custom-attributes";

@Entity({ name: 'ANSWER_OPTIONS' })
export class AnswerOptions extends BaseEntity {

    @ManyToOne(type => AnswerCustomAttributes, answerCustomAttributes => answerCustomAttributes.answersCustomAttribute, { primary: true })
    @JoinColumn({ name: 'ANSWER_CUSTOM_ATTRIBUTE_ID' })
    answerCustomAttribute: AnswerCustomAttributes;

    @OneToOne(type => OptionCustomAttributes, optionCustomAttributes => optionCustomAttributes.answersOption, { primary: true })
    @JoinColumn({
        name: 'OPTION_ID'
    })
    optionCustomAttributes: OptionCustomAttributes;

    static async deletePreviousOptionsByAnswerId(answerId: number) {
        await this.query(`DELETE FROM ANSWER_OPTIONS WHERE ANSWER_OPTIONS.ANSWER_CUSTOM_ATTRIBUTE_ID = ${answerId}`)
            .then(result => console.log(result))
            .catch(err => console.log(err));
    }

    static getAnswerByLinkIdAndAttributeId(linkId: number, attributeId: number) {
        return this.createQueryBuilder('answerOptions')
            .leftJoinAndSelect('answerOptions.answerCustomAttribute', 'answer')
            .leftJoinAndSelect('answer.lenderCustomAttributeLink', 'link')
            .leftJoinAndSelect('link.lenderCustomAttribute', 'attribute')
            .leftJoinAndSelect('link.enterpriseFundingLink', 'fundingLink')
            .where('attribute.id = :attributeId', { attributeId })
            .andWhere('fundingLink.id = :linkId', { linkId })
            .getMany();
    }

    static getOptionsByAnswerId(answerId: number) {
        return this.createQueryBuilder('answerOptions')
            .select('answerOptions.answerCustomAttribute', 'answerId')
            .addSelect('answerOptions.optionCustomAttributes', 'optionId')
            .where('answerOptions.answerCustomAttribute = :answerId', { answerId })
            .getRawMany();
    }

    static async deleteByAnswerCustomAttrIds(answerIds: number[]) {
        await this.query(`DELETE FROM ANSWER_OPTIONS WHERE ANSWER_OPTIONS.ANSWER_CUSTOM_ATTRIBUTE_ID IN (${answerIds})`)
            .then(result => console.log(result))
            .catch(err => console.log(err));
    }
}