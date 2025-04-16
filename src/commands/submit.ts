import { 
    APIApplicationCommandInteractionDataOption,
    APIApplicationCommandInteractionDataSubcommandGroupOption,
    APIApplicationCommandInteractionDataSubcommandOption,
    APIApplicationCommandOptionChoice,
    ApplicationCommandOptionType,
    InteractionResponseType
} from "discord-api-types/v10";
import { createChatCommand } from "../utils/command";
import { compile } from "../utils/replace";
import { getRandomImageFromFolder, sendFollowup } from "../utils/image";
import * as extraCommands from "./extra";

const SUBMIT_COMMAND = createChatCommand({
    admin: true,
    data: {
        name: 'submit',
        description: 'Submit something new to the bot',
        options: [
            {
                name: 'text',
                description: 'Submit new text for something',
                type: ApplicationCommandOptionType.SubcommandGroup,
                options: [
                    {
                        name: 'command',
                        description: 'Submit a new text phrase for an extra command',
                        type: ApplicationCommandOptionType.Subcommand,
                        options: [
                            {
                                name: 'command',
                                description: 'The command you want to submit this for',
                                type: ApplicationCommandOptionType.String,
                                required: true,
                                choices:  Object.values(extraCommands).map(cmd => ({
                                    name: cmd.data.name,
                                    value: cmd.data.name
                                } as APIApplicationCommandOptionChoice<string>))
                            },
                            {
                                name: 'text',
                                description: 'The phrase you want to submit',
                                type: ApplicationCommandOptionType.String,
                                required: true,
                                min_length: 15,
                                max_length: 100
                            }
                        ]
                    }
                ]
            }
        ]
    },
    async handle(interaction, env, ctx) {
        const userId = interaction.member!.user.id
        const subcommand = interaction.data.options![0] as APIApplicationCommandInteractionDataOption

        return {
            type: InteractionResponseType.DeferredChannelMessageWithSource
        };
    }
})
export default SUBMIT_COMMAND