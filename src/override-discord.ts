import {
    SlashCommandBuilder,
    SlashCommandHandler,
    SlashCommandSubcommandBuilder,
    SlashCommandSubcommandGroupBuilder
} from '@discordjs/builders';
import {
    APIApplicationCommandInteractionDataSubcommandGroupOption,
    APIChatInputApplicationCommandInteraction,
    APIChatInputApplicationCommandInteractionData,
    ApplicationCommandOptionType
} from 'discord-api-types/v10';

// HELPER FUNCTION
function parseSubCommand(
    data:
        | APIChatInputApplicationCommandInteractionData 
        | APIApplicationCommandInteractionDataSubcommandGroupOption
): string {
    const [sub] = data.options ?? [];
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
    (SlashCommandBuilder as any).prototype.setAdmin = function (isAdmin: boolean = true) {
        this.admin = isAdmin;
        return this;
    };
}

// SET HANDLER
if (!SlashCommandSubcommandBuilder.prototype.setHandler) {
    SlashCommandSubcommandBuilder.prototype.setHandler = function (handler) {
        this.handle = handler;
        return this;
    };
}

if (!SlashCommandBuilder.prototype.setHandler) {
    SlashCommandBuilder.prototype.setHandler = function (handler: SlashCommandHandler) {
        this.handle = handler;
        return this;
    };
}

// ADD SUBCOMMAND
const originalAddSubcommandGroup = SlashCommandSubcommandGroupBuilder.prototype.addSubcommand;
SlashCommandSubcommandGroupBuilder.prototype.addSubcommand = function (input) {
    if (!this.subcommands) this.subcommands = new Map();

    const built = typeof input === "function" ? input(new SlashCommandSubcommandBuilder()) : input;
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
    env: Env,
    ctx: ExecutionContext
) {
    const subcommandName = parseSubCommand(interaction.data);
    const subcommand = this.subcommands?.get(subcommandName);

    if (!subcommand || typeof subcommand.handle !== 'function') {
        throw new Error(`Subcommand handler for '${subcommandName}' not found`);
    }

    return subcommand.handle(interaction, env, ctx);
}

SlashCommandBuilder.prototype.handle = async function(
    interaction: APIChatInputApplicationCommandInteraction,
    env: Env,
    ctx: ExecutionContext
) {
    const subcommandName = parseSubCommand(interaction.data);
    const subcommand = this.subcommands?.get(subcommandName);

    if (!subcommand || typeof subcommand.handle !== 'function') {
        throw new Error(`Subcommand handler for '${subcommandName}' not found`);
    }

    return subcommand.handle(interaction, env, ctx);
};