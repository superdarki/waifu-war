import {
  APIChatInputApplicationCommandInteraction,
  APIUserApplicationCommandInteraction,
  APIMessageApplicationCommandInteraction,
  APIApplicationCommandOption,
  ApplicationCommandType,
  APIInteractionResponse,
} from 'discord-api-types/v10'

export interface ChatCommand {
    data: {
        name: string
        description: string
        options?: APIApplicationCommandOption[]
    }
    handle: (interaction: APIChatInputApplicationCommandInteraction, env: Env, ctx: ExecutionContext) => Promise<APIInteractionResponse>
}

export interface UserCommand {
    data: {
        name: string
        description: string
    }
    handle: (interaction: APIUserApplicationCommandInteraction, env: Env,  ctx: ExecutionContext) => Promise<APIInteractionResponse>
}

export interface MessageCommand {
    data: {
        name: string
        description: string
    }
    handle: (interaction: APIMessageApplicationCommandInteraction, env: Env,  ctx: ExecutionContext) => Promise<APIInteractionResponse>
}

export type Command = ChatCommand | UserCommand | MessageCommand

export const createChatCommand = (cmd: ChatCommand) => ({
    ...cmd,
    data: {
        ...cmd.data,
        type: ApplicationCommandType.ChatInput
    }
})

export const createUserCommand = (cmd: UserCommand) => ({
    ...cmd,
    data: {
        ...cmd.data,
        type: ApplicationCommandType.User
    }
})

export const createMessageCommand = (cmd: MessageCommand) => ({
    ...cmd,
    data: {
        ...cmd.data,
        type: ApplicationCommandType.Message
    }
})