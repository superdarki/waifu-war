import {
	APIApplicationCommandInteraction
} from "discord-api-types/v10";

export async function getRandomImageFromFolder(bucket: R2Bucket, folder: string) {
    const list = await bucket.list({ prefix: `${folder}/` });
    const objects = list.objects;

    if (!objects.length) throw new Error(`No images in ${folder}`);
  
    const file = objects[Math.floor(Math.random() * objects.length)];
    const res = await bucket.get(file.key);
    const data = await res!.arrayBuffer();
  
    return {
        name: file.key.split('/').pop()!,
        data
    };
}

export async function sendFollowup(env: Env, interaction: APIApplicationCommandInteraction, payload: any, image: { name: string; data: ArrayBuffer }) {
    const form = new FormData();
    form.append('payload_json', JSON.stringify(payload));
    form.append('files[0]', new Blob([image.data]), image.name);
  
    await fetch(`https://discord.com/api/webhooks/${env.DISCORD_APPLICATION_ID}/${interaction.token}`, {
		method: 'POST',
		body: form
    });
  }