import {
    APIApplicationCommandInteractionDataUserOption,
    APIApplicationCommandOption,
    ApplicationCommandOptionType,
    ApplicationCommandType,
    InteractionResponseType
} from "discord-api-types/v10";
import { compile } from "../../utils/replace";
import { ChatCommand } from "../../interfaces/command";
import { getRandomFromFolder } from "../../utils/r2";
import { sendFollowup } from "../../utils/discord";

export const SLAP_COMMAND: ChatCommand = {
    data: {
        name: 'slap',
        description: 'Slap someone! (that\'s mean but you do what you want)',
        options: [
            {
                name: 'target',
                description: 'Who do you want to slap?',
                type: ApplicationCommandOptionType.User,
                required: false
            }
        ] satisfies APIApplicationCommandOption[],
        type: ApplicationCommandType.ChatInput
    },
    async handle(interaction, env, ctx) {
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
                })
            }
        })());

        return {
            type: InteractionResponseType.DeferredChannelMessageWithSource
        };
    }
};
