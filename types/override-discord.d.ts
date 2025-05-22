import "@discordjs/builders";
import {
    APIInteractionResponse,
    APIChatInputApplicationCommandInteraction,
    APIApplicationCommandInteractionDataBasicOption,
    APIApplicationCommandInteractionDataSubcommandGroupOption,
    APIApplicationCommandInteractionDataSubcommandOption
} from "discord-api-types/v10";

declare module '@discordjs/builders' {
    type SlashCommandGroupHandler = (
        interaction: APIChatInputApplicationCommandInteraction,
        options: APIApplicationCommandInteractionDataSubcommandGroupOption[],
        env: Env,
        ctx: ExecutionContext
    ) => Promise<APIInteractionResponse>;

    type SlashCommandSubHandler = (
        interaction: APIChatInputApplicationCommandInteraction,
        options: APIApplicationCommandInteractionDataSubcommandOption[],
        env: Env,
        ctx: ExecutionContext
    ) => Promise<APIInteractionResponse>;

    type SlashCommandHandler = (
        interaction: APIChatInputApplicationCommandInteraction,
        options: APIApplicationCommandInteractionDataBasicOption[],
        env: Env,
        ctx: ExecutionContext
    ) => Promise<APIInteractionResponse>;

    type GenericSlashCommandHandler = SlashCommandHandler | SlashCommandSubHandler | SlashCommandGroupHandler

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
        handle: SlashCommandHandler;
        setHandler(handler: SlashCommandHandler): TypeAfterAddingOptions;
    }

    interface SharedSlashCommandSubcommands<TypeAfterAddingSubcommands extends SharedSlashCommandSubcommands<TypeAfterAddingSubcommands>> {
        subcommands: Map<string, SlashCommandSubcommandBuilder | SlashCommandSubcommandGroupBuilder>;
        handle: SlashCommandGroupHandler | SlashCommandSubHandler;
    }
}