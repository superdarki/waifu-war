import {
	APIApplicationCommandInteraction
} from "discord-api-types/v10";

export async function sendFollowup(interaction: APIApplicationCommandInteraction, env: Env, payload: any, files?: { name: string; data: ArrayBuffer }[]) {
    if (files) {
        const form = new FormData();
        form.append('payload_json', JSON.stringify(payload));

        for (let i = 0; i < files.length; i++) {
            form.append(`files[${i}]`, new Blob([files[i].data]), files[i].name);
        }

        await fetch(`https://discord.com/api/webhooks/${env.DISCORD_APPLICATION_ID}/${interaction.token}`, {
            method: 'POST',
            body: form
        });
    } else {
        await fetch(`https://discord.com/api/webhooks/${env.DISCORD_APPLICATION_ID}/${interaction.token}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
    }
}