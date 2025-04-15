import { AllowedMentionsTypes, APIApplicationCommandInteractionDataUserOption, APIApplicationCommandOption, ApplicationCommandOptionType, InteractionResponseType } from "discord-api-types/v10";
import { createChatCommand } from "../../utils/command";

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
    async handle(interaction) {
        const targetUserId = (interaction.data.options?.find(opt => opt.name === 'target') as APIApplicationCommandInteractionDataUserOption | undefined)?.value as string | undefined
        const target = targetUserId ? `<@${targetUserId}>` : `<@${interaction.member?.user.id}>`

        return {
            type: InteractionResponseType.ChannelMessageWithSource,
            data: {
                embeds: [
                    {
                        title: 'Slap!',
                        description: `${target} just got slapped! 💥`
                    }
                ],
                allowed_mentions: {parse: [AllowedMentionsTypes.User]}
            }
        }
    }
})
export default SLAP_COMMAND