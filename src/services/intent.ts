export enum Intents {
    None,
    Analyze,
    Query
}

export interface IEntity {
    name: string
    value: string
}

export interface IntentResult {
    intent: Intents
    entities: IEntity[]
}

export function intent (text: string): IntentResult {
    if ([/picture/i, /analyze/i, /photo/i, /snapshot/i].some(r => r.test(text))) {
        return {
            intent: Intents.Analyze,
            entities: []
        }
    }
    else if ([/what/i, /tell/i].some(r => r.test(text))) {
        return {
            intent: Intents.Query,
            entities: []
        }
    }

    return {
        intent: Intents.None,
        entities: []
    }
}