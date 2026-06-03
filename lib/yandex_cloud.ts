import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const yandex_cloud = new S3Client({
    region: "ru-central1",
    endpoint: "https://storage.yandexcloud.net",
    credentials: {
        accessKeyId: process.env.YANDEX_ACCESS_KEY_ID!,
        secretAccessKey: process.env.YANDEX_SECRET_ACCESS_KEY!,
    },
});

export async function uploadFileYandex(file: File, folder: string) {
    const fileExt = file.name.split(".").pop();
    const randomNum = Math.floor(Math.random() * 999999);
    const fileName = `${randomNum}_${Date.now()}.${fileExt}`;

    const filePath = `${folder}/${fileName}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const command = new PutObjectCommand({
        Bucket: "tasks-website-bucket",
        Key: filePath,
        Body: buffer,
        ContentType: file.type,
    });

    try {
        await yandex_cloud.send(command);
    } catch (error: any) {
        console.log("Не удалось добавить файл в облачное хранилище", error.message);
        throw new Error(error.message);
    }

    const publicUrl = `https://storage.yandexcloud.net/tasks-website-bucket/${filePath}`;
    console.log(publicUrl);
    return publicUrl;
}

export default yandex_cloud;