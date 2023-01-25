export enum OrderByEnum {
    ASC = 'ASC',
    DESC = 'DESC'
}

export const parseOrderBy = (value: string) => {
    if(!value) return null;

    switch (value) {
        case OrderByEnum.ASC:
            return OrderByEnum.ASC;

        case OrderByEnum.DESC:
            return OrderByEnum.DESC;

        default:
            return null;
    }
}