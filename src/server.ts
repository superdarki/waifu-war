import { RequestLike, AutoRouter } from 'itty-router';
import { verifyKey } from 'discord-interactions';
import * as commands from './commands';
import {
	APIChatInputApplicationCommandInteraction,
	APIInteraction,
	APIInteractionResponse,
	APIMessageApplicationCommandInteraction,
	APIUserApplicationCommandInteraction,
	ApplicationCommandType,
	InteractionResponseType,
	InteractionType
} from 'discord-api-types/v10';
import { ChatCommand, Command, MessageCommand, UserCommand } from './utils/command';

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

const COMMANDS: Map<string, Command> = new Map(Object.values(commands).map(cmd => [cmd.data.name.toLowerCase(), cmd]))

router.get('/', (_, env: Env) => {
	return new Response(`👋 ${env.DISCORD_APPLICATION_ID}`);
});

router.post('/', async (request, env: Env, ctx: ExecutionContext) => {
	const { isValid, interaction } = await server.verifyDiscordRequest(request, env);
	if (!isValid || !interaction) {
		return new Response('Bad request signature.', { status: 401 });
	}

	if (interaction.type === InteractionType.Ping) {
		return new JsonResponse({
			type: InteractionResponseType.Pong,
		})
	}

	if (interaction.type === InteractionType.ApplicationCommand) {
		const command = COMMANDS.get(interaction.data.name.toLowerCase())

		if (!command) {
			return new JsonResponse({ error: 'Unknown Command' }, { status: 400 });
		}

		let response: APIInteractionResponse;
		switch (interaction.data.type) {
			case ApplicationCommandType.ChatInput:
				response = await (command as ChatCommand).handle(interaction as APIChatInputApplicationCommandInteraction, env, ctx);
				break
			case ApplicationCommandType.User:
				response = await (command as UserCommand).handle(interaction as APIUserApplicationCommandInteraction, env, ctx);
				break
			case ApplicationCommandType.Message:
				response = await (command as MessageCommand).handle(interaction as APIMessageApplicationCommandInteraction, env, ctx);
				break
			default:
				return new JsonResponse(
					{ error: 'Unsupported Command Type' }, 
					{ status: 400 }
				);
		}
		return new JsonResponse(response);
	}

	console.error('Unknown Type');
	return new JsonResponse({ error: 'Unknown Type' }, { status: 400 });
});
router.all('*', () => new Response('Not Found.', { status: 404 }));

async function verifyDiscordRequest<T extends InteractionType, U>(
	request: RequestLike,
	env: Env,
): Promise<
	| {
			isValid: true;
			interaction: APIInteraction | null;
		}
	| {
			isValid: false;
			interaction: null;
		}
> {
	const signature = request.headers.get('x-signature-ed25519');
	const timestamp = request.headers.get('x-signature-timestamp');
	const body = await request.text();
	const isValidRequest =
		signature &&
		timestamp &&
		await verifyKey(body, signature, timestamp, env.DISCORD_PUBLIC_KEY);
	if (!isValidRequest) {
		return { isValid: false, interaction: null };
	}

	return { interaction: JSON.parse(body), isValid: true };
}

const server = {
	verifyDiscordRequest,
	fetch: router.fetch,
};

export default server;
