import { APIApplicationCommandInteractionDataBasicOption, APIApplicationCommandInteractionDataSubcommandOption, APIApplicationCommandSubcommandOption, ApplicationCommandOptionType, ApplicationCommandType, InteractionResponseType, MessageFlags } from "discord-api-types/v10";
import { isValidHexColor } from "../utils/validators";
import { SlashCommandBuilder } from "@discordjs/builders";

export const USER_CONFIG_COMMAND = new SlashCommandBuilder()
    .setName('config')
    .setDescription('Configure settings')
    .addSubcommand((sub) => sub
        .setName('color')
        .setDescription('Set the color of the embeds used by the bot to respond to you')
        .addStringOption((opt) => opt
            .setName('hex')
            .setDescription('The hex code of the color')
            .setRequired(false))
        .setHandler(async (interaction, options, env, ctx) => {
            const userId = interaction.member!.user.id
            const hex = (options as APIApplicationCommandInteractionDataBasicOption[])!.find(opt => opt.name === 'hex')!.value as string
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
        }))