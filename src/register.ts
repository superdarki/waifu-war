import { 
	RESTPutAPIApplicationCommandsJSONBody,
	Routes
} from 'discord-api-types/v10';
import dotenv from 'dotenv';
import process from 'node:process';

import './override-discord';
import { SlashCommandBuilder } from '@discordjs/builders';

import * as commands from './commands';

dotenv.config({ path: '.dev.vars' });

const token = process.env.DISCORD_TOKEN;
const applicationId = process.env.DISCORD_APPLICATION_ID;
const adminGuildId = process.env.ADMIN_GUILD;

if (!token) throw new Error('The DISCORD_TOKEN environment variable is required.');
if (!applicationId) throw new Error('The DISCORD_APPLICATION_ID environment variable is required.');
if (!adminGuildId) throw new Error('The ADMIN_GUILD environment variable is required.');

const allCommands = Object.values(commands)
.map(cmd => {
	const command = cmd as SlashCommandBuilder;
	return command;
})

// Separate commands
const globalCommands = allCommands
.filter(cmd => !cmd.admin)
.map(cmd => cmd.toJSON());

const adminCommands = allCommands
.filter(cmd => cmd.admin)
.map(cmd => cmd.toJSON());

// Define a function to register commands
async function registerCommands(
	commands: RESTPutAPIApplicationCommandsJSONBody,
	label: string,
	app_id: string,
	guild_id?: string
): Promise<void> {
	const url = `https://discord.com/api/v10${
		guild_id
		? Routes.applicationGuildCommands(app_id, guild_id)
		: Routes.applicationCommands(app_id)
	}`

	const response = await fetch(url, {
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bot ${token}`,
		},
		method: 'PUT',
		body: JSON.stringify(commands),
	});

	if (response.ok) {
		console.log(`✅ Registered ${label} commands`);
		const data = await response.json();
		console.log(JSON.stringify(data, null, 2));
	} else {
		console.error(`❌ Error registering ${label} commands`);
		let errorText = `${response.url}: ${response.status} ${response.statusText}`;
		try {
			const error = await response.text();
			if (error) {
				errorText += `\n\n${error}`;
			}
		} catch (err) {
			console.error('Error reading response body:', err);
		}
		console.error(errorText);
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