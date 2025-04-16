import {
  APIChatInputApplicationCommandInteraction,
  APIUserApplicationCommandInteraction,
  APIMessageApplicationCommandInteraction,
  APIApplicationCommandOption,
  ApplicationCommandType,
  APIInteractionResponse,
} from 'discord-api-types/v10'

export interface ChatCommand {
    admin?: boolean
    data: {
        name: string
        description: string
        options?: APIApplicationCommandOption[]
    }
    handle: (interaction: APIChatInputApplicationCommandInteraction, env: Env, ctx: ExecutionContext) => Promise<APIInteractionResponse>
}

export interface UserCommand {
    admin?: boolean
    data: {
        name: string
        description: string
    }
    handle: (interaction: APIUserApplicationCommandInteraction, env: Env,  ctx: ExecutionContext) => Promise<APIInteractionResponse>
}

export interface MessageCommand {
    admin?: boolean
    data: {
        name: string
        description: string
    }
    handle: (interaction: APIMessageApplicationCommandInteraction, env: Env,  ctx: ExecutionContext) => Promise<APIInteractionResponse>
}

export type Command = ChatCommand | UserCommand | MessageCommand

export const createChatCommand = (cmd: ChatCommand) => ({
    ...cmd,
    admin: cmd.admin ?? false,
    data: {
        ...cmd.data,
        type: ApplicationCommandType.ChatInput
    }
})

export const createUserCommand = (cmd: UserCommand) => ({
    ...cmd,
    admin: cmd.admin ?? false,
    data: {
        ...cmd.data,
        type: ApplicationCommandType.User
    }
})

export const createMessageCommand = (cmd: MessageCommand) => ({
    ...cmd,
    admin: cmd.admin ?? false,
    data: {
        ...cmd.data,
        type: ApplicationCommandType.Message
    }
})