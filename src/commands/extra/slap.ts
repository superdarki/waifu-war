import {
    APIApplicationCommandInteractionDataUserOption,
    InteractionResponseType
} from "discord-api-types/v10";
import { compile } from "../../utils/replace";
import { getRandomFromFolder } from "../../utils/r2";
import { sendFollowup } from "../../utils/discord";
import { SlashCommandBuilder } from "@discordjs/builders";

export const SLAP_COMMAND = new SlashCommandBuilder()
    .setName('slap')
    .setDescription('Slap someone! (that\'s mean but you do what you want)')
    .addUserOption((opt) => opt
        .setName('target')
        .setDescription('Who do you want to slap?')
        .setRequired(false))
    .setHandler(async (interaction, env, ctx) => {
        const userId = interaction.member!.user.id;
        const targetUserId = (
            interaction.data.options?.find(opt => opt.name === 'target') as APIApplicationCommandInteractionDataUserOption | undefined
        )?.value as string | undefined;
        const target = targetUserId ?? userId;

        ctx.waitUntil((async () => {
            try {
                const template = (
                    await env.CONTENT.prepare("SELECT value FROM slap ORDER BY RANDOM() LIMIT 1").first()
                )?.value as string ?? "An error occurred, no template phrase available";
                
                const color = (await env.CONFIG
                    .prepare("SELECT color FROM user WHERE id=?1")
                    .bind(userId)
                    .first())?.color as number | undefined;

                const image = await getRandomFromFolder(env.MEDIA_BUCKET, 'slap');

                const payload = {
                    embeds: [
                        {
                            title: 'Slap!',
                            description: compile(template, {
                                1: `<@${target}>`
                            }),
                            image: {
                                url: `attachment://${image.name}`
                            },
                            color
                        }
                    ],
                    attachments: [
                        {
                            id: 0,
                            filename: image.name
                        }
                    ]
                };

                await sendFollowup(interaction, env, payload, [image]);
            } catch (err) {
                await sendFollowup(interaction, env, {
                    content: '💔 Something went wrong while sending your slap.'
                });
            }
        })());

        return {
            type: InteractionResponseType.DeferredChannelMessageWithSource
        };
    });