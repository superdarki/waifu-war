import {
    SlashCommandBuilder,
    SlashCommandHandler,
    SlashCommandSubcommandBuilder,
    SlashCommandSubcommandGroupBuilder,
} from '@discordjs/builders';
import {
    APIApplicationCommandInteractionDataOption,
    APIApplicationCommandInteractionDataSubcommandGroupOption,
    APIApplicationCommandInteractionDataSubcommandOption,
    APIChatInputApplicationCommandInteraction,
    ApplicationCommandOptionType
} from 'discord-api-types/v10';

// HELPER FUNCTION
function parseSubCommand(
    options: APIApplicationCommandInteractionDataOption[]
): string {
    const [sub] = options;
    if (!sub) throw new Error("Missing options in interaction data");

    if (
        sub.type === ApplicationCommandOptionType.Subcommand ||
        sub.type === ApplicationCommandOptionType.SubcommandGroup
    ) {
        return sub.name
    }

    throw new Error("Expected subcommand or subcommand group");
}

// ADD ADMIN FLAG
if (!SlashCommandBuilder.prototype.setAdmin) {
    (SlashCommandBuilder as any).prototype.setAdmin = function (isAdmin: boolean) {
        this.admin = isAdmin;
        return this;
    };
}

// SET HANDLER
SlashCommandSubcommandBuilder.prototype.setHandler = function (handler: SlashCommandHandler) {
    this.handle = handler;
    return this;
};

(SlashCommandBuilder as any).prototype.setHandler = function (handler: SlashCommandHandler) {
    this.handle = handler;
    return this;
};


// ADD SUBCOMMAND
const originalGroupAddSubcommand = SlashCommandSubcommandGroupBuilder.prototype.addSubcommand;
SlashCommandSubcommandGroupBuilder.prototype.addSubcommand = function (input) {
    if (!this.subcommands) this.subcommands = new Map();

    const built = typeof input === "function" ? input(new SlashCommandSubcommandBuilder()) : input;
    this.subcommands.set(built.name, built);

    return originalGroupAddSubcommand.call(this, built);
};

const originalAddSubcommandGroup = SlashCommandBuilder.prototype.addSubcommandGroup;
SlashCommandBuilder.prototype.addSubcommandGroup = function (input) {
    if (!this.subcommands) this.subcommands = new Map();

    const built = typeof input === "function" ? input(new SlashCommandSubcommandGroupBuilder()) : input;
    this.subcommands.set(built.name, built);

    return originalAddSubcommandGroup.call(this, built);
};

const originalAddSubcommand = SlashCommandBuilder.prototype.addSubcommand;
SlashCommandBuilder.prototype.addSubcommand = function (input) {
    if (!this.subcommands) this.subcommands = new Map();

    const built = typeof input === "function" ? input(new SlashCommandSubcommandBuilder()) : input;
    this.subcommands.set(built.name, built);

    return originalAddSubcommand.call(this, built);
};

// HANDLE SUBCOMMANDS
SlashCommandSubcommandGroupBuilder.prototype.handle = async function(
    interaction: APIChatInputApplicationCommandInteraction,
    options: APIApplicationCommandInteractionDataSubcommandOption[],
    env: Env,
    ctx: ExecutionContext
) {
    const subcommandName = parseSubCommand(options);
    const subcommand = this.subcommands?.get(subcommandName);

    if (!subcommand || typeof subcommand.handle !== 'function') {
        throw new Error(`Subcommand handler for '${subcommandName}' not found`);
    }

    const sub_options = options![0]
    return subcommand.handle(interaction, sub_options.options || [], env, ctx);
}

;(SlashCommandBuilder as any).prototype.handle = async function(
    interaction: APIChatInputApplicationCommandInteraction,
    options: APIApplicationCommandInteractionDataSubcommandGroupOption[] | APIApplicationCommandInteractionDataSubcommandOption[],
    env: Env,
    ctx: ExecutionContext
) {
    const sub_option = options[0];

    const subcommandName = parseSubCommand(options);
    const subcommand = this.subcommands?.get(subcommandName);

    if (!subcommand || typeof subcommand.handle !== 'function') {
        throw new Error(`Subcommand handler for '${subcommandName}' not found`);
    }

    const typedSubOption = sub_option as
        | APIApplicationCommandInteractionDataSubcommandOption
        | APIApplicationCommandInteractionDataSubcommandGroupOption;
    return subcommand.handle(interaction, typedSubOption.options || [], env, ctx);
};
