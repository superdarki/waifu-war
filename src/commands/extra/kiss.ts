import { 
    APIApplicationCommandInteractionDataUserOption,
    ApplicationCommandOptionType,
    InteractionResponseType
} from "discord-api-types/v10";
import { createChatCommand } from "../../interfaces/command";
import { compile } from "../../utils/replace";
import { getRandomImageFromFolder, sendFollowup } from "../../utils/image";

export const KISS_COMMAND = createChatCommand({
    data: {
        name: 'kiss',
        description: 'Kiss someone! (I smell love in the air ❤️)',
        options: [
            {
                name: 'target',
                description: 'Who do you want to kiss?',
                type: ApplicationCommandOptionType.User,
                required: true
            }
        ]
    },
    async handle(interaction, env, ctx) {
        const userId = interaction.member!.user.id
        const targetUserId = (interaction.data.options!.find(opt => opt.name === 'target') as APIApplicationCommandInteractionDataUserOption)!.value as string
        
        ctx.waitUntil((async () => {
            try {
                const template = (
                    await env.CONTENT.prepare("SELECT value FROM kiss ORDER BY RANDOM() LIMIT 1").first()
                )?.value as string ?? "An error occurred, no template phrase available";
                const color = (await env.CONFIG
                    .prepare("SELECT color FROM user WHERE id=?1")
                    .bind(userId)
                    .first())?.color as number | undefined;
                const image = await getRandomImageFromFolder(env.MEDIA_BUCKET, 'kiss');

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
        
                await sendFollowup(env, interaction, payload, image);
            } catch (err) {    
                await fetch(`https://discord.com/api/webhooks/${env.DISCORD_APPLICATION_ID}/${interaction.token}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        content: '💔 Something went wrong while sending your kiss.'
                    })
                });
            }
        })());

        return {
            type: InteractionResponseType.DeferredChannelMessageWithSource
        };
    }
})