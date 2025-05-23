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

import { PrismaClient as ConfigClient } from '../schema/generated/config';
import { PrismaClient as ContentClient } from '../schema/generated/content';
import { PrismaClient as SubmissionsClient } from '../schema/generated/submissions';
import { PrismaD1 } from '@prisma/adapter-d1';

declare global {
	interface Env {
		CONFIG: ConfigClient;
		CONTENT: ContentClient;
		SUBMISSIONS: SubmissionsClient;
	}
}

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
				const command = SLASH_COMMANDS.get(interaction.data.name.toLowerCase());
				const typed_interaction = interaction as APIChatInputApplicationCommandInteraction;	
				if (!command) {
					return new JsonResponse(
						{ error: 'Unknown Command' },
						{ status: 400 }
					);
				}
				return new JsonResponse(
					await command.handle(typed_interaction, typed_interaction.data.options || [], env, ctx)
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

export default {
	async fecth (request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		env.CONFIG 		= new ConfigClient({ adapter: new PrismaD1(env.CONFIG_DB) });
		env.CONTENT 	= new ContentClient({ adapter: new PrismaD1(env.CONTENT_DB) });
		env.SUBMISSIONS = new SubmissionsClient({ adapter: new PrismaD1(env.SUBMISSIONS_DB) });

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
	},
};