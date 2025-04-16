import { AllowedMentionsTypes, APIApplicationCommandInteractionDataUserOption, APIApplicationCommandOption, ApplicationCommandOptionType, InteractionResponseType } from "discord-api-types/v10";
import { createChatCommand } from "../../utils/command";
import { compile } from "../../utils/replace";

const KISS_COMMAND = createChatCommand({
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
        ] satisfies APIApplicationCommandOption[]
    },
    async handle(interaction, env) {
        const targetUserId = (interaction.data.options!.find(opt => opt.name === 'target') as APIApplicationCommandInteractionDataUserOption)!.value as string
        const q = await env.FUN_DB.prepare("SELECT value FROM kiss ORDER BY RANDOM() LIMIT 1").first()
        const template = (q?.value as string) ?? "An error occured, no template phrase available"

        return {
            type: InteractionResponseType.ChannelMessageWithSource,
            data: {
                embeds: [
                    {
                        description: compile(template, {1:`<@${interaction.member?.user.id}>`,2:`<@${targetUserId}>`})
                    }
                ],
                allowed_mentions: {
                    parse: [AllowedMentionsTypes.User]
                }
            }
        }
    }
})
export default KISS_COMMAND