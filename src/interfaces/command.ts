import {
  APIChatInputApplicationCommandInteraction,
  APIUserApplicationCommandInteraction,
  APIMessageApplicationCommandInteraction,
  APIApplicationCommandOption,
  ApplicationCommandType,
  APIInteractionResponse,
  APIApplicationCommandInteraction,
} from 'discord-api-types/v10'

export interface BaseCommand<T extends APIApplicationCommandInteraction = APIApplicationCommandInteraction> {
    admin?: boolean
    data: {
        name: string
        description: string
        type: ApplicationCommandType
    }
    handle: (interaction: T, env: Env, ctx: ExecutionContext) => Promise<APIInteractionResponse>
}

export interface ChatCommand extends BaseCommand<APIChatInputApplicationCommandInteraction> {
    data: BaseCommand["data"] & {
        options?: APIApplicationCommandOption[]
        type: ApplicationCommandType.ChatInput
    }
}

export interface UserCommand extends BaseCommand<APIUserApplicationCommandInteraction> {
    data: BaseCommand["data"] & {
        type: ApplicationCommandType.User
    }
}

export interface MessageCommand extends BaseCommand<APIMessageApplicationCommandInteraction> {
    data: BaseCommand["data"] & {
        type: ApplicationCommandType.Message
    }
}

export type Command = ChatCommand | UserCommand | MessageCommand