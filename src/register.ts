import { 
	RESTPutAPIApplicationCommandsJSONBody,
	Routes
} from 'discord-api-types/v10';
import * as commands from './commands';
import dotenv from 'dotenv';
import process, { env } from 'node:process';
import { Command } from './interfaces/command';
import { REST } from '@discordjs/rest';

dotenv.config({ path: '.dev.vars' });

const token = process.env.DISCORD_TOKEN;
const applicationId = process.env.DISCORD_APPLICATION_ID;
const adminGuildId = process.env.ADMIN_GUILD;

if (!token) throw new Error('The DISCORD_TOKEN environment variable is required.');
if (!applicationId) throw new Error('The DISCORD_APPLICATION_ID environment variable is required.');
if (!adminGuildId) throw new Error('The ADMIN_GUILD environment variable is required.');

const rest = new REST({ version: '10' }).setToken(token);

const allCommands = Object.values(commands)
.map(cmd => {
	const command = cmd as Command;
	return command;
})

// Separate commands
const globalCommands = allCommands
.filter(cmd => !cmd.admin)
.map(cmd => cmd.data);

const adminCommands = allCommands
.filter(cmd => cmd.admin)
.map(cmd => cmd.data);

// Define a function to register commands
async function registerCommands(
	commands: RESTPutAPIApplicationCommandsJSONBody,
	label: string,
	app_id: string,
	guild_id?: string
): Promise<void> {
	const url = guild_id
		? Routes.applicationGuildCommands(app_id, guild_id)
		: Routes.applicationCommands(app_id);
	try {
		const data = await rest.put(url, {
			body: commands,
		});
		console.info(`✅ Registered ${label} commands`);
		console.debug(JSON.stringify(data, null, 2));
	} catch (err) {
		console.error(`❌ Error registering ${label} commands:`, err);
	}
};

// Register global commands
await registerCommands(
	globalCommands,
	'global',
	applicationId
);

// Register admin commands
await registerCommands(
	adminCommands,
	'admin (guild-specific)',
	applicationId,
	adminGuildId
);