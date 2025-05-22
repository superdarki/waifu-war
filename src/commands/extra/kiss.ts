import { 
    APIApplicationCommandInteractionDataUserOption,
    InteractionResponseType
} from "discord-api-types/v10";
import { compile } from "../../utils/replace";
import { getRandomFromFolder } from "../../utils/r2";
import { sendFollowup } from "../../utils/discord";
import { SlashCommandBuilder } from "@discordjs/builders";

export const KISS_COMMAND = new SlashCommandBuilder()
    .setName('kiss')
    .setDescription('Kiss someone! (I smell love in the air ❤️)')
    .addUserOption((opt) => opt
        .setName('target')
        .setDescription('Who do you want to kiss?')
        .setRequired(true))
    .setHandler(async (interaction, options, env, ctx) => {
        const userId = interaction.member!.user.id
        const targetUserId = (options!.find(opt => opt.name === 'target') as APIApplicationCommandInteractionDataUserOption)!.value
        
        ctx.waitUntil((async () => {
            try {
                const template = (
                    await env.CONTENT.prepare("SELECT value FROM kiss ORDER BY RANDOM() LIMIT 1").first()
                )?.value as string ?? "An error occurred, no template phrase available";
                const color = (await env.CONFIG
                    .prepare("SELECT color FROM user WHERE id=?1")
                    .bind(userId)
                    .first())?.color as number | undefined;
                const image = await getRandomFromFolder(env.MEDIA_BUCKET, 'kiss');

                const payload = {
                    embeds: [
                        {
                            title: 'Kiss',
                            description: compile(template, {
                                1: `<@${userId}>`,
                                2: `<@${targetUserId}>`
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
                    content: '💔 Something went wrong while sending your kiss.'
                });
            }
        })());

        return {
            type: InteractionResponseType.DeferredChannelMessageWithSource
        };
    });