import {NextRequest, NextResponse} from "next/server";
import supabase from "../../../../../lib/supabase";

type File = {
	task_id: string
	title: string;
 	file_url: string;
};

export async function POST(req: NextRequest) {
	const {username} = await req.json();

	console.log(username);

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

	for (var id of all_id) {
		const {data: file, error} = await supabase
			.from("tasks")
			.select("task_id, title, file_url")
			.eq("task_id", id.task_id);	

		if (error) {
			return NextResponse.json({error: "Не удалось получить файл"}, {status: 500});
		}

		files.push(file[0]);
	}

	return NextResponse.json({files}, {status: 200});
}

export async function DELETE(req: NextRequest) {
	const {username, task_id} = await req.json();

	console.log(username, task_id);

	if (!username || !task_id) {
		console.log("Не удалось получить username или task_id");
		return NextResponse.json({error: "Не удалось получить username или task_id"}, {status: 400});
	}

	const {error: deleteError} = await supabase
		.from("files_to_download")
		.delete()
		.eq("patient_username", username)
		.eq("task_id", task_id);

	if (deleteError) {
		return NextResponse.json({error: "Не удалось удалить файл"}, {status: 500});
	}

	return NextResponse.json({message: "Файл удален"});
}
