import {
    APIApplicationCommandInteractionDataUserOption,
    APIApplicationCommandOption,
    ApplicationCommandOptionType,
    InteractionResponseType
} from "discord-api-types/v10";
import { createChatCommand } from "../../utils/command";
import { compile } from "../../utils/replace";
import { getRandomImageFromFolder, sendFollowup } from "../../utils/image";

const SLAP_COMMAND = createChatCommand({
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
        ] satisfies APIApplicationCommandOption[]
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

                const image = await getRandomImageFromFolder(env.MEDIA_BUCKET, 'slap');

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

                await sendFollowup(env, interaction, payload, image);
            } catch (err) {
                await fetch(`https://discord.com/api/webhooks/${env.DISCORD_APPLICATION_ID}/${interaction.token}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        content: '💔 Something went wrong while sending your slap.'
                    })
                });
            }
        })());

        return {
            type: InteractionResponseType.DeferredChannelMessageWithSource
        };
    }
});
export default SLAP_COMMAND;
