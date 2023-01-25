export interface IVariable {
    name?: string,
    value: string
}

export interface IProcessInstance {
    processDefinitionKey: string,
    businessKey?: string,
    tenantId?: string,
    variables: IVariable[]
}

export interface ISpecificProcessInstance {
    processInstanceId: string,
    event_id: string,
    variable?: IVariable[],
    status?: string,
    reply?: object
}