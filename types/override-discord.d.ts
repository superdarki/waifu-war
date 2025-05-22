import "@discordjs/builders";
import {
    APIApplicationCommandInteraction,
    APIInteractionResponse,
    APIChatInputApplicationCommandInteraction
} from "discord-api-types/v10";

declare module '@discordjs/builders' {
    type CommandHandler<T extends APIApplicationCommandInteraction = APIApplicationCommandInteraction> = (
        interaction: T,
        env: Env,
        ctx: ExecutionContext
    ) => Promise<APIInteractionResponse>;
    type SlashCommandHandler = CommandHandler<APIChatInputApplicationCommandInteraction>;

    interface SlashCommandSubcommandBuilder {
        handle: SlashCommandHandler;
        setHandler(handler: SlashCommandHandler): SlashCommandSubcommandBuilder;
    }

    interface SlashCommandSubcommandGroupBuilder {
        subcommands: Map<string, SlashCommandSubcommandBuilder>;
        handle: SlashCommandHandler;
    }

    interface SharedSlashCommand {
        readonly admin?: boolean;
        setAdmin(isAdmin: boolean): this;
    }

    interface SharedSlashCommandOptions<TypeAfterAddingOptions extends SharedSlashCommandOptions<TypeAfterAddingOptions>> {
        handle: SlashCommandHandler;
        setHandler(handler: SlashCommandHandler): TypeAfterAddingOptions;
    }

    interface SharedSlashCommandSubcommands<TypeAfterAddingSubcommands extends SharedSlashCommandSubcommands<TypeAfterAddingSubcommands>> {
        subcommands: Map<string, SlashCommandSubcommandBuilder | SlashCommandSubcommandGroupBuilder>;
        handle: SlashCommandHandler;
    }
}