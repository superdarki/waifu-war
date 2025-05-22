import {
	APIApplicationCommandInteraction,
    APIInteraction,
    InteractionType,
    Routes
} from "discord-api-types/v10";
import { verifyKey } from "discord-interactions";
import { RequestLike } from "itty-router/types";

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
        
        await fetch(`https://discord.com/api/v10${Routes.webhook(env.DISCORD_APPLICATION_ID, interaction.token)}`, {
			method: 'POST',
            body: form
        });
    } else {
		await fetch(`https://discord.com/api/v10${Routes.webhook(env.DISCORD_APPLICATION_ID, interaction.token)}`, {
			method: 'POST',
            body: JSON.stringify(payload)
        });
    }
}