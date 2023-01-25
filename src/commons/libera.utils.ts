import moment from 'moment';
import uuid from 'uuid';
import { NPDiscountTypeEnum } from './enums/negotiation-process-discount-type.enum';
import { BadRequestException } from './exceptions';

export default class LiberaUtils {

    static validationEmailFormat(email: string) {
        const regexEmail = /^(?=.{5,256}$)(?=.{5,32}@)[-!#$%&'*+/0-9=?A-Z^_a-z{|}~]+(\.[-!#$%&'*+/0-9=?A-Z^_a-z{|}~]+)*@[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?(\.[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?)*$/;
        return regexEmail.test(email);
    }

    static isNitValid(value: string) {

        //remove dots and hyphens
        // const digits = (value as string).replace(/\D/g, '');

        //must be 10 digits
        // if (digits.length != 10)
        //     return false;

        // let verifier = 41 * parseInt(digits[0])
        //     + 37 * parseInt(digits[1])
        //     + 29 * parseInt(digits[2])
        //     + 23 * parseInt(digits[3])
        //     + 19 * parseInt(digits[4])
        //     + 17 * parseInt(digits[5])
        //     + 13 * parseInt(digits[6])
        //     + 7 * parseInt(digits[7])
        //     + 3 * parseInt(digits[8]);

        // verifier = verifier % 11;

        // if (verifier >= 2)
        //     verifier = 11 - verifier;

        // return verifier == parseInt(digits[9]);
        return true;
    }

    static getFullName(name, firstSurname, secondSurname) {
        let fullName = '';
        if (name)
            fullName += name
        if (firstSurname && firstSurname.trim().length > 0)
            fullName += fullName && fullName.length > 0 ? ` ${firstSurname}` : firstSurname;
        if (secondSurname && secondSurname.trim().length > 0)
            fullName += fullName && fullName.length > 0 ? ` ${secondSurname}` : secondSurname;
        return fullName && fullName.length > 0 ? fullName : null;
    }

    static generatePassword() {
        const uid = uuid().toString().substring(0, 9).replace('-', '&')
        const password = `M${uid.substring(1, 4).toUpperCase()}e${uid.substring(4, 9).toLowerCase()}${(Math.random() * (999 - 100)) + 100}`;
        return password;
    }

    static isValidFormatDate(value: string) {
        return moment(value, moment.ISO_8601).isValid()
    }

    static parseBufferToString(value: Buffer) {
        const bufferString = JSON.stringify(value);
        console.log('bufferString', bufferString);
        const originalBuffer = Buffer.from(JSON.parse(bufferString).data);
        console.log('originalBuffer', originalBuffer);
        const buffer = originalBuffer.toString('utf8');
        console.log('buffer final: ', buffer)
        return originalBuffer.toString('utf8');
    }

    static confirmExpirationDate(date: Date) {
        const now = moment.utc();
        const exp = now.isAfter(date);
        return exp;
    }

    static parseBoolean(value) {
        if (!value)
            return null;

        switch (value) {
            case true:
                return true;
            case false:
                return false;
            default:
                return null;
        }
    }

    static calculateNPDiscountValue(list: any[]) {
        for (const item of list) {
            console.log(item.negotiation);
            console.log(item.payment);
            if (item.negotiation && item.payment) {
                const discountValue = item.negotiation.percentage / 100;
                const discount = item.payment.amount * discountValue;
                item.negotiation.discountValue = discount;
            }
        }
        return list
    }

    static calculateDiscountValue(percentage: number, amount: number) {
        const discount = percentage / 100;
        const discountValue = amount * discount;

        return discountValue;
    }

    static getDiffDates(date: Date) {
        const dateToDiff = moment(date);
        const now = moment(moment.now(), 'x');
        const diff = dateToDiff.diff(now, 'days');
        return diff;
    }

    /*
        EXPIRED_MONTH_RATE
            Días plazo de factura --> (fecha de vencimiento de factura-fecha de emisión)
            Tasa efectiva anual --> (1+ porcentaje de descuento)^12-1
            Tasa mes vencido --> (Valor de la factura *(1-(1/(1+ Tasa efectiva anual)^(días plazo de factura/360)))
            Valor descuento --> Valor factura -tasa mes vencido
    
        ANTICIPATED_MONTH_RATE
            Días plazo de factura --> (fecha de vencimiento de factura-fecha de emisión)
            Tasa efectiva anual --> (((porcentaje de descuento*12)/-12)+1)^(1/(-1/12))-1
            Tasa mes anticipado --> (Valor de la factura *(1-(1/(1+ Tasa efectiva anual)^(días plazo de factura/360)))
            Valor descuento --> Valor factura -tasa mes anticipado
    
        FIXED_RATE
            Tasa fija --> (valor factura* porcentaje de descuento)
            Valor descuento --> Valor factura - Tasa fija
    */

    static calculateDiscountValueByTypeOfDiscount(percentage: number, amount: number, typeOfDiscount: string, expirationDate, emissionDate) {
        let annualEffectiveRate;
        let invoiceTermDays;
        let expirationDateMoment = moment(expirationDate);
        let emissionDateMoment = moment(emissionDate);
        invoiceTermDays = expirationDateMoment.diff(emissionDateMoment, 'days');
        console.log('days', invoiceTermDays);

        if (!typeOfDiscount)
            return null;

        switch (typeOfDiscount) {
            case NPDiscountTypeEnum.EXPIRED_MONTH_RATE:
                annualEffectiveRate = (((((1 + percentage / 100) ** 12) - 1) * 100)).toFixed(2);
                console.log('@@@ Tasa efectiva anual', annualEffectiveRate);
                const expiredMonthRate = amount * (1 - (1 / (1 + annualEffectiveRate / 100) ** (invoiceTermDays / 360)));
                console.log('@@@ Tasa mes vencido', expiredMonthRate);
                return (amount - expiredMonthRate).toFixed(2);

            case NPDiscountTypeEnum.ANTICIPATED_MONTH_RATE:
                annualEffectiveRate = ((((((percentage / 100) * 12) / -12) + 1) ** (1 / (-1 / 12)) - 1) * 100).toFixed(2);
                console.log('@@@ Tasa efectiva anual', annualEffectiveRate);
                const advanceMonthRate = amount * (1 - (1 / (1 + annualEffectiveRate / 100) ** (invoiceTermDays / 360)));
                console.log('@@@ Tasa mes anticipado', advanceMonthRate);
                return (amount - advanceMonthRate).toFixed(2);

            case NPDiscountTypeEnum.FIXED_RATE:
                const fixedRate = amount * percentage / 100;
                console.log('@@@ Tasa fija', fixedRate);
                return (amount - fixedRate).toFixed(2);
            default:
                return null;
        }
    }

    static checkString(value: string) {
        return /^([0-9])*$/.test(value)
    }

    static toFixedTrunc(x: number, n: number) {
        const v = (typeof x === 'string' ? x : x.toString()).split('.');
        if (n <= 0) return v[0];
        let f = v[1] || '';
        if (f.length > n) return `${v[0]}.${f.substr(0, n)}`;
        while (f.length < n) f += '0';
        return `${v[0]}.${f}`
    }
    
    static effectivenessDateGenerator(expeditionDate: Date, monthEffectiveness: number){
        let effectivenessDate = moment(expeditionDate, 'YYYY-MM-DD').add(monthEffectiveness, 'month');
    
        return monthEffectiveness == null ? null : effectivenessDate;
    }

    static getNumberOfDays(start, end) {
        const date1 = new Date(start);
        const date2 = new Date(end);
        
        // One day in milliseconds
        const oneDay = 1000 * 60 * 60 * 24;
    
        // Calculating the time difference between two dates
        const diffInTime = date2.getTime() - date1.getTime();
    
        // Calculating the no. of days between two dates
        const diffInDays = Math.round(diffInTime / oneDay);
    
        return diffInDays;
    }

    static checkOtherDocuments(documentType: string){
        if(documentType === 'Otros documentos'){
            return true
        } else {
            return false
        }
    }

    static parseBooleanFromString(str: string): boolean{
        if(str.toUpperCase() === "TRUE") {
            return true
        } else if(str.toUpperCase() === "FALSE") {
            return false
        } else {
            throw new BadRequestException('SCF.LIBERA.296')
        }
    }

    static roleNameParser (str:String): String {
        const noAccents = str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const spaceToUnderline = noAccents.replace(/ /g, '_');
        return spaceToUnderline.toUpperCase();
    }


}
