import {
    APIApplicationCommandOptionChoice,
    InteractionResponseType
} from "discord-api-types/v10";
import * as extraCommands from "../extra";
import { SlashCommandBuilder } from "@discordjs/builders";

export const SUBMIT_COMMAND = new SlashCommandBuilder()
    .setName('submit')
    .setDescription('Submit something new to the bot')
    .setAdmin(true)
    .addSubcommandGroup((grp) => grp
        .setName('extra')
        .setDescription('Submit something new for an extra command')
        .addSubcommand((sub) => sub
            .setName('text')
            .setDescription('Submit a new text phrase for an extra command')
            .addStringOption((opt) => opt
                .setName('command')
                .setDescription('The command you want to submit this for')
                .addChoices(Object.values(extraCommands).map(cmd => ({
                    name: cmd.name,
                    value: cmd.name
                } as APIApplicationCommandOptionChoice<string>)))
                .setRequired(true))
            .addStringOption((opt) => opt
                .setName('text')
                .setDescription('The phrase you want to submit')
                .setMinLength(10)
                .setMaxLength(100)
                .setRequired(true))
            .setHandler(async (interaction, options, env, ctx) => {
                const userId = interaction.member!.user.id;
                const color = (await env.CONFIG.prepare("SELECT color FROM user WHERE id=?1").bind(userId).first())?.color as number | undefined;

                const id = crypto.randomUUID()
                const cmd = options?.find(opt => opt.name === 'command')!.value as string
                const val = options?.find(opt => opt.name === 'text')!.value as string

                await env.SUBMISSIONS.prepare(`INSERT INTO ${cmd} (id, value) VALUES (?1, ?2)`).bind(id, val).run()


                return {
                    type: InteractionResponseType.ChannelMessageWithSource,
                    data: {
                        embeds: [
                            {
                                title: 'Submission Recap',
                                description: `Command: /${cmd}\nSubmited phrase: \`${val}\``,
                                footer: {
                                    text: `${id}`
                                },
                                color: color
                            }
                        ]
                    }
                }
            }))
        .addSubcommand((sub) => sub
            .setName('image')
            .setDescription('Submit a new image for an extra command')
            .addStringOption((opt) => opt
                .setName('command')
                .setDescription('The command you want to submit this for')
                .addChoices(Object.values(extraCommands).map(cmd => ({
                    name: cmd.name,
                    value: cmd.name
                } as APIApplicationCommandOptionChoice<string>)))
                .setRequired(true))
            .addAttachmentOption((opt) => opt
                .setName('attachment')
                .setDescription('The image you want to submit')
                .setRequired(true))
            .setHandler(async (interaction, options, env, ctx) => {
                const userId = interaction.member!.user.id;
                const color = (await env.CONFIG.prepare("SELECT color FROM user WHERE id=?1").bind(userId).first())?.color as number | undefined;

                const id = crypto.randomUUID()
                const cmd = options?.find(opt => opt.name === 'command')!.value as string
                const img = options?.find(opt => opt.name === 'attachment')!.value  as string
                
                console.log(img)

                return {
                    type: InteractionResponseType.ChannelMessageWithSource,
                    data: {
                        content: `Coucou`
                    }
                };
            })))