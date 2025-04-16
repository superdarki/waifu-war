import { RESTPutAPIApplicationCommandsJSONBody } from 'discord-api-types/v10';
import * as commands from './commands';
import dotenv from 'dotenv';
import process from 'node:process';

dotenv.config({ path: '.dev.vars' });

const token = process.env.DISCORD_TOKEN;
const applicationId = process.env.DISCORD_APPLICATION_ID;
const adminGuildId = process.env.ADMIN_GUILD;

if (!token) throw new Error('The DISCORD_TOKEN environment variable is required.');
if (!applicationId) throw new Error('The DISCORD_APPLICATION_ID environment variable is required.');
if (!adminGuildId) throw new Error('The ADMIN_GUILD environment variable is required.');

// Separate commands
const globalCommands = Object.values(commands)
	.filter(cmd => !cmd.admin)
	.map(cmd => cmd.data);

const adminCommands = Object.values(commands)
	.filter(cmd => cmd.admin)
	.map(cmd => cmd.data);

// Register global commands
const registerCommands = async (
	url: string,
	commands: RESTPutAPIApplicationCommandsJSONBody,
	label: string
) => {
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

await registerCommands(
	`https://discord.com/api/v10/applications/${applicationId}/commands`,
	globalCommands,
	'global'
);

await registerCommands(
	`https://discord.com/api/v10/applications/${applicationId}/guilds/${adminGuildId}/commands`,
	adminCommands,
	'admin (guild-specific)'
);