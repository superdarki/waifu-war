import { 
    APIApplicationCommandInteractionDataOption,
    APIApplicationCommandInteractionDataSubcommandGroupOption,
    APIApplicationCommandInteractionDataSubcommandOption,
    APIApplicationCommandOptionChoice,
    APIInteractionResponse,
    ApplicationCommandOptionType,
    InteractionResponseType
} from "discord-api-types/v10";
import { createChatCommand } from "../../interfaces/command";
import * as extraCommands from "../extra";

export const SUBMIT_COMMAND = createChatCommand({
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
                        name: 'extra',
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
                                min_length: 10,
                                max_length: 100
                            }
                        ]
                    }
                ]
            },
            {
                name: 'image',
                description: 'Submit new image for something',
                type: ApplicationCommandOptionType.SubcommandGroup,
                options: [
                    {
                        name: 'extra',
                        description: 'Submit a new image for an extra command',
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
                                name: 'attachment',
                                description: 'The image you want to submit',
                                type: ApplicationCommandOptionType.Attachment,
                                required: true
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
        const color = (await env.CONFIG.prepare("SELECT color FROM user WHERE id=?1").bind(userId).first())?.color as number | undefined;

        const sub = (subcommand as APIApplicationCommandInteractionDataSubcommandGroupOption)?.options![0] as APIApplicationCommandInteractionDataSubcommandOption

        switch (subcommand.name) {
            case 'text':
                switch (sub.name) {
                    case 'extra':
                        const id = crypto.randomUUID()
                        const cmd = sub.options?.find(opt => opt.name === 'command')!.value as string
                        const val = sub.options?.find(opt => opt.name === 'text')!.value as string

                        await env.SUBMISSIONS.prepare(`INSERT INTO ${cmd} (id, value) VALUES (?1, ?2)`).bind(id, val).run()

                        return {
                            type: InteractionResponseType.ChannelMessageWithSource,
                            data: {
                                embeds: [
                                    {
                                        title: 'Submission Recap',
                                        description: `Command: /${cmd}\nSubmited phrase: \`${val}\``,
                                        footer: {
                                            text: `${id}`
                                        },
                                        color: color
                                    }
                                ]
                            }
                        } satisfies APIInteractionResponse
                }
            case 'image':
                switch (sub.name) {
                    case 'extra':
                        const id = crypto.randomUUID()
                        const cmd = sub.options?.find(opt => opt.name === 'command')!.value as string
                        const img = sub.options?.find(opt => opt.name === 'attachment')!.value  as string
                        
                        console.log(img)
                }  
        }

        return {
            type: InteractionResponseType.ChannelMessageWithSource,
            data: {
                content: `${subcommand.name}`
            }
        } satisfies APIInteractionResponse;
    }
})