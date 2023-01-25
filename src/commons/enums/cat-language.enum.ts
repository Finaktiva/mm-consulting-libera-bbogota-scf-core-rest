export enum CatLanguageEnum {
    ES = 'es',
    EN = 'en'
}


export const parseCatLanguage = (value: string) => { 
    if(!value) return null;

    switch (value) {
        case CatLanguageEnum.EN:
            return CatLanguageEnum.EN;
        case CatLanguageEnum.ES:
            return CatLanguageEnum.ES;
        default:
            return null;
    }
}