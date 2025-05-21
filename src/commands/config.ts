import { APIApplicationCommandInteractionDataSubcommandOption, APIApplicationCommandSubcommandOption, ApplicationCommandOptionType, ApplicationCommandType, InteractionResponseType, MessageFlags } from "discord-api-types/v10";
import { ChatCommand } from "../interfaces/command";
import { isValidHexColor } from "../utils/validators";

export const USER_CONFIG_COMMAND: ChatCommand = {
    data: {
        name: 'config',
        description: 'Configure your settings',
        options: [
            {
                name: 'color',
                description: 'Set the color of the embeds used by the bot to respond to you',
                type: ApplicationCommandOptionType.Subcommand,
                options: [
                    {
                        name: 'hex',
                        description: 'The hex code of the color',
                        type: ApplicationCommandOptionType.String,
                        required: true
                    }
                ]
            },
            {
                name: 'test',
                description: 'test (does nothing more that reply to the message',
                type: ApplicationCommandOptionType.Subcommand
            }
        ],
        type: ApplicationCommandType.ChatInput
    },
    async handle(interaction, env) {
        const userId = interaction.member!.user.id
        const subcommand = interaction.data.options![0] as APIApplicationCommandInteractionDataSubcommandOption
        switch (subcommand.name) {
            case 'color':
                const hex = subcommand.options!.find(opt => opt.name === 'hex')!.value as string
                if (!isValidHexColor(hex)) {
                    return {
                        type: InteractionResponseType.ChannelMessageWithSource,
                        data: {
                            flags: MessageFlags.Ephemeral,
                            content: 'The provided string is not a valid HEX color code'
                        }
                    }
                } else {
                    await env.CONFIG.prepare(
                        `INSERT INTO user (id, color) 
                        VALUES (?1, ?2)
                        ON CONFLICT(id) DO UPDATE SET color = excluded.color`
                    ).bind(userId, parseInt(hex.replace('#', ''), 16)).run()
                    return {
                        type: InteractionResponseType.ChannelMessageWithSource,
                        data: {
                            embeds: [
                                {
                                    title: 'Color applied !',
                                    description: 'Here is a small preview of your new embed color !',
                                    color: parseInt(hex.replace('#', ''), 16)
                                }
                            ]
                        }
                    }
                }
        }
        return {
            type: InteractionResponseType.ChannelMessageWithSource,
            data: {
                flags: MessageFlags.Ephemeral,
                content: 'An error occured: unknown subcommand'
            }
        }
    }
}