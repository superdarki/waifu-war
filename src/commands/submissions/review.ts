import { 
    APIApplicationCommandInteractionDataOption,
    APIApplicationCommandInteractionDataSubcommandGroupOption,
    APIApplicationCommandInteractionDataSubcommandOption,
    APIApplicationCommandOptionChoice,
    APIInteractionResponse,
    ApplicationCommandOptionType,
    ApplicationCommandType,
    InteractionResponseType
} from "discord-api-types/v10";
import { ChatCommand } from "../../interfaces/command";

export const REVIEW_COMMAND: ChatCommand = {
    admin: true,
    data: {
        name: 'review',
        description: 'Submit something new to the bot',
        options: [

        ],
        type: ApplicationCommandType.ChatInput
    },
    async handle(interaction, env, ctx) {
        const userId = interaction.member!.user.id
        const subcommand = interaction.data.options![0] as APIApplicationCommandInteractionDataOption
        const color = (await env.CONFIG.prepare("SELECT color FROM user WHERE id=?1").bind(userId).first())?.color as number | undefined;

        const sub = (subcommand as APIApplicationCommandInteractionDataSubcommandGroupOption)?.options![0] as APIApplicationCommandInteractionDataSubcommandOption

        return {
            type: InteractionResponseType.ChannelMessageWithSource,
            data: {
                content: `${subcommand.name}`
            }
        } satisfies APIInteractionResponse;
    }
}