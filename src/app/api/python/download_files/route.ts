import {NextRequest, NextResponse} from "next/server";
import supabase from "../../../../../lib/supabase";

export async function POST(req: NextRequest) {
	const {username} = await req.json();

	if (!username) {
		console.log("Не удалось получить username");
		return NextResponse.json({error: "Не удалось получить username"}, {status: 400});
	}

	const {data: all_id, error} = await supabase
		.from("files_to_download")
		.select("task_id")
		.eq("patient_username", username);

	if (!all_id) {
		return NextResponse.json({error: "id файлов пациента не найдены"}, {status: 500});
	}

	let files = [];

	const time = Date.now();

	for (var id of all_id) {
		const {data: file, error} = await supabase
			.from("tasks")
			.select("task_id, title, file_url")
			.eq("task_id", id.task_id);	

		if (error) {
			return NextResponse.json({error: "Не удалось получить файл"}, {status: 500});
		}

		const activity = `Пациент скачал файл ${file[0].title}`;

		const {error: insertError} = await supabase
			.from("patient_activities")
			.insert({
				patient_username: username,
			 	task_id: id.task_id,
				activity: activity,
				time: time
			});

		if (insertError) {
			return NextResponse.json({error: `Не удалось вставить строку об активности ${username}`}, {status: 500});
		}

		files.push(file[0]);
	}

	const {error: deleteError} = await supabase
		.from("files_to_download")
		.delete()
		.eq("patient_username", username);

	if (deleteError) {
		return NextResponse.json({error: "Не удалось удалить очередь скачиваемых файлов"}, {status: 500});
	}

	return NextResponse.json({files: files}, {status: 200});
}