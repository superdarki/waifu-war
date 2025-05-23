import "@discordjs/builders";
import {
    APIInteractionResponse,
    APIChatInputApplicationCommandInteraction,
    APIApplicationCommandInteractionDataBasicOption,
    APIApplicationCommandInteractionDataSubcommandGroupOption,
    APIApplicationCommandInteractionDataSubcommandOption
} from "discord-api-types/v10";

declare module '@discordjs/builders' {
    type CommandOption =
        | APIApplicationCommandInteractionDataBasicOption
        | APIApplicationCommandInteractionDataSubcommandOption
        | APIApplicationCommandInteractionDataSubcommandGroupOption;

    type BaseCommandHandler<T extends CommandOption> = (
        interaction: APIChatInputApplicationCommandInteraction,
        options: T[],
        env: Env,
        ctx: ExecutionContext
    ) => Promise<APIInteractionResponse>;

    type SlashCommandHandler       = BaseCommandHandler<APIApplicationCommandInteractionDataBasicOption>;
    type SlashCommandSubHandler    = BaseCommandHandler<APIApplicationCommandInteractionDataSubcommandOption>;
    type SlashCommandGroupHandler  = BaseCommandHandler<APIApplicationCommandInteractionDataSubcommandGroupOption | APIApplicationCommandInteractionDataSubcommandOption>;
    type GenericSlashCommandHandler = BaseCommandHandler<CommandOption>;

    interface SlashCommandSubcommandBuilder {
        handle: SlashCommandHandler;
        setHandler(handler: SlashCommandHandler): this;
    }

    interface SlashCommandSubcommandGroupBuilder {
        subcommands: Map<string, SlashCommandSubcommandBuilder>;
        handle: SlashCommandSubHandler;
    }

    interface SharedSlashCommand {
        readonly admin?: boolean;
        setAdmin(isAdmin: boolean): this;
        handle: GenericSlashCommandHandler;
    }

    interface SharedSlashCommandOptions<TypeAfterAddingOptions extends SharedSlashCommandOptions<TypeAfterAddingOptions>> {
        setHandler(handler: SlashCommandHandler): TypeAfterAddingOptions;
    }

    interface SharedSlashCommandSubcommands<TypeAfterAddingSubcommands extends SharedSlashCommandSubcommands<TypeAfterAddingSubcommands>> {
        subcommands: Map<string, SlashCommandSubcommandBuilder | SlashCommandSubcommandGroupBuilder>;
    }
}