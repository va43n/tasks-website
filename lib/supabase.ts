import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
	throw new Error("Отсутствуют Supabase URL или Supabase KEY.");
}

const supabase = createClient(supabaseUrl, supabaseKey);

export async function uploadFile(file: File, folder: string) {
	const fileExt = file.name.split(".").pop();
	const randomNum: number = Math.floor(Math.random() * (999999 - 0 + 1) + 0);
	const fileName = `${randomNum}_${Date.now()}.${fileExt}`;

	const filePath = `${folder}/${fileName}`;

	const {data, error} = await supabase.storage
		.from("profiles-files")
		.upload(filePath, file);

	if (error) {
		console.log("Не удалось добавить файл в базу данных", error.message);
		throw new Error(error.message);
	}

	const publicUrl = `${supabaseUrl}/storage/v1/object/public/${data.fullPath}`

	return publicUrl;
}

export default supabase;