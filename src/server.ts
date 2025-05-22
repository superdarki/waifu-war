import { AutoRouter } from 'itty-router';
import {
	APIChatInputApplicationCommandInteraction,
	APIInteractionResponse,
	ApplicationCommandType,
	InteractionResponseType,
	InteractionType
} from 'discord-api-types/v10';

import { verifyDiscordRequest } from './utils/discord';

import './override-discord';
import { SlashCommandBuilder } from '@discordjs/builders';
import * as commands from './commands';

class JsonResponse extends Response {
	constructor(
		body: APIInteractionResponse | { error: string },
		init?: ResponseInit,
	) {
		const jsonBody = JSON.stringify(body);
		init = init || {
			headers: {
				'content-type': 'application/json;charset=UTF-8',
			},
		};
		super(jsonBody, init);
	}
}

const router = AutoRouter();

const SLASH_COMMANDS: Map<string, SlashCommandBuilder> = new Map(Object.values(commands).map(cmd => {
	const command = cmd as SlashCommandBuilder;
	return [command.name.toLowerCase(), command];
}))

router.get('/', (_, env: Env) => {
	return new Response(`👋 ${env.DISCORD_APPLICATION_ID}`);
});

router.post('/', async (request, env: Env, ctx: ExecutionContext) => {
	const { isValid, interaction } = await verifyDiscordRequest(request, env);
	if (!isValid || !interaction) {
		return new JsonResponse({ error: 'Bad request signature.' }, { status: 401 });
	}

	if (interaction.type === InteractionType.Ping) {
		return new JsonResponse({
			type: InteractionResponseType.Pong,
		})
	}

	if (interaction.type === InteractionType.ApplicationCommand) {
		switch (interaction.data.type) {
			case ApplicationCommandType.ChatInput:
				const command = SLASH_COMMANDS.get(interaction.data.name.toLowerCase())				
				if (!command) {
					return new JsonResponse(
						{ error: 'Unknown Command' },
						{ status: 400 }
					);
				}
				return new JsonResponse(
					await command.handle(interaction as APIChatInputApplicationCommandInteraction, env, ctx)
				);
			// case ApplicationCommandType.User:
			// 	response = await (command as UserCommand).handle(interaction as APIUserApplicationCommandInteraction, env, ctx);
			// 	break;
			// case ApplicationCommandType.Message:
			// 	response = await (command as MessageCommand).handle(interaction as APIMessageApplicationCommandInteraction, env, ctx);
			// 	break;
			default:
				return new JsonResponse(
					{ error: 'Unsupported Command Type' }, 
					{ status: 400 }
				);
		}
	}

	if (interaction.type === InteractionType.MessageComponent) {
		return new JsonResponse({ error: 'Components are not yet implemented' }, { status: 400 });
	}

	return new JsonResponse({ error: 'Unknown Type' }, { status: 400 });
});

router.all('*', () => new JsonResponse({ error: 'Not Found.' }, { status: 404 }));

const server = {
	fetch: async (request: Request, env: Env, ctx: ExecutionContext) => {
		const response = await router.fetch(request, env, ctx);
		
		if (response instanceof JsonResponse) {
			const cloned = response.clone();
			const text = await cloned.text();
			
			try {
				const body = JSON.parse(text);
				if ('error' in body) {
					console.error(`${request.method} ${new URL(request.url).pathname}:`, body.error);
				} else {
					console.log(`${request.method} ${new URL(request.url).pathname}`);
					console.debug(`Response body:`, body)
				}
			} catch (err) {
				console.log(err)
			}
		} else {
			console.log(`${request.method} ${new URL(request.url).pathname}`);
		}

		return response;
	}
};

export default server;
