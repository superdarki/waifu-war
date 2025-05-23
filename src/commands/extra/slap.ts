import {
    APIApplicationCommandInteractionDataUserOption,
    InteractionResponseType
} from "discord-api-types/v10";
import { compile } from "../../utils/replace";
import { getRandomFromFolder } from "../../utils/r2";
import { sendFollowup } from "../../utils/discord";
import { SlashCommandBuilder } from "@discordjs/builders";
import { Slap } from "../../../schema/generated/content";

export const SLAP_COMMAND = new SlashCommandBuilder()
    .setName('slap')
    .setDescription('Slap someone! (that\'s mean but you do what you want)')
    .addUserOption((opt) => opt
        .setName('target')
        .setDescription('Who do you want to slap?')
        .setRequired(false))
    .setHandler(async (interaction, options, env, ctx) => {
        const userId = interaction.member!.user.id;
        const targetOpt = options!.find(opt => opt.name === 'target') as APIApplicationCommandInteractionDataUserOption | undefined
        const targetId = targetOpt?.value ?? userId;

        ctx.waitUntil((async () => {
            try {
                const template = (await env.CONTENT.$queryRaw<Slap[]>`SELECT * FROM slap ORDER BY RANDOM() LIMIT 1`)[0]?.value
                    ?? "An error occurred, no template phrase available";
                                
                const color = (await env.CONFIG.user.findUnique({where: {id: userId}, select: {color: true}}))?.color;

                const image = await getRandomFromFolder(env.MEDIA_BUCKET, 'slap');

                const payload = {
                    embeds: [
                        {
                            title: 'Slap!',
                            description: compile(template, {
                                1: `<@${targetId}>`
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