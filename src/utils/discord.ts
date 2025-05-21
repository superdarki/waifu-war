import {
	APIApplicationCommandInteraction,
    APIInteraction,
    InteractionType,
    Routes
} from "discord-api-types/v10";
import { REST } from "@discordjs/rest";
import { verifyKey } from "discord-interactions";
import { RequestLike } from "itty-router/types";

export const rest = new REST({ version: '10' });

export async function verifyDiscordRequest<T extends InteractionType, U>(
	request: RequestLike,
	env: Env,
): Promise<
	{
		isValid: true;
		interaction: APIInteraction | null;
	} | {
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


export async function sendFollowup(interaction: APIApplicationCommandInteraction, env: Env, payload: any, files?: { name: string; data: ArrayBuffer }[]) {
    if (files) {
        const form = new FormData();
        form.append('payload_json', JSON.stringify(payload));

        for (let i = 0; i < files.length; i++) {
            form.append(`files[${i}]`, new Blob([files[i].data]), files[i].name);
        }
        
        await rest.post(Routes.webhook(env.DISCORD_APPLICATION_ID, interaction.token), {
            body: form
        });
    } else {
        await rest.post(Routes.webhook(env.DISCORD_APPLICATION_ID, interaction.token), {
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
    }
}