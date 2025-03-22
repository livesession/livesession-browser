import {ApiClient} from "./__generated__"

export * from "./__generated__"

class Option {
    apiKey?: string
}

export default class LiveSession extends ApiClient {
    constructor(...options: Option[]) {
        let apiKey = ""

        if (process.env.LIVESESSION_API_KEY) {
            apiKey = `Bearer ${process.env.LIVESESSION_API}`
        }

        if (options.length > 0) {
            for (const option of options) {
                if (option.apiKey) {
                    apiKey = `Bearer ${option.apiKey}`
                }
            }
        }

        super({
            apiKey,
        })
    }

    public static optionApiKey(apiKey: string): Option {
        const opt = new Option()
        opt.apiKey = apiKey

        return opt
    }
}

