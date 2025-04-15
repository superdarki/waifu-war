import { AllowedMentionsTypes, APIApplicationCommandInteractionDataUserOption, APIApplicationCommandOption, ApplicationCommandOptionType, InteractionResponseType } from "discord-api-types/v10";
import { createChatCommand } from "../../utils/command";

const KISS_COMMAND = createChatCommand({
    data: {
        name: 'kiss',
        description: 'Kiss someone! (I smell love in the air :heart:)',
        options: [
            {
                name: 'target',
                description: 'Who do you want to kiss?',
                type: ApplicationCommandOptionType.User,
                required: true
            }
        ] satisfies APIApplicationCommandOption[]
    },
    async handle(interaction) {
        const targetUserId = (interaction.data.options?.find(opt => opt.name === 'target') as APIApplicationCommandInteractionDataUserOption | undefined)?.value as string | undefined

        return {
            type: InteractionResponseType.ChannelMessageWithSource,
            data: {
                embeds: [
                    {
                        title: 'Kiss!',
                        description: `<@${interaction.member?.user.id}> kissed <@${targetUserId}>! :heart:`
                    }
                ],
                allowed_mentions: {parse: [AllowedMentionsTypes.User]}
            }
        }
    }
})
export default KISS_COMMAND