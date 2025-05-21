export async function getRandomFromFolder(bucket: R2Bucket, folder: string): Promise<{ name: string; data: ArrayBuffer; }> {
    const list = await bucket.list({ prefix: `${folder}/` });
    const objects = list.objects;

    if (!objects.length) throw new Error(`Folder ${folder} is empty`);
  
    const file = objects[Math.floor(Math.random() * objects.length)];
    const res = await bucket.get(file.key);
    const data = await res!.arrayBuffer();
  
    return {
        name: file.key.split('/').pop()!,
        data
    };
}