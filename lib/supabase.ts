import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
	throw new Error("Отсутствуют Supabase URL или Supabase KEY.");
}

const supabase = createClient(supabaseUrl, supabaseKey);

export async function uploadFile(file: File, folder: string) {
	const fileExt = file.name.split(".").pop();
	const randomNum: number = Math.floor(Math.random() * (99999 - 0 + 1) + 0);
	const fileName = `${randomNum}_${Date.now()}.${fileExt}`;

	const filePath = `${folder}/${fileName}`;

	const {data, error} = await supabase.storage
		.from("profiles-files")
		.upload(filePath, file);

	if (error) throw error;

	return data.path;
}

export default supabase;