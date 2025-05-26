import {NextRequest, NextResponse} from "next/server";
import supabase from "../../../../../lib/supabase";
import {isLoginValid} from "../../../../../lib/jwt";

type File = {
	task_id: string
	title: string;
 	file_url: string;
};

export async function POST(req: NextRequest) {
	const {username} = await req.json();

	if (!username) {
		console.log("Не удалось получить username");
		return NextResponse.json({error: "Не удалось получить username"}, {status: 400});
	}

	// Проверка токена пользователя
	const token = req.cookies.get("token")?.value;
	if (!token) {
		return NextResponse.json({error: "Пользователь не залогинен"}, {status: 400});
	}
	if (!isLoginValid(username, token)) {
		return NextResponse.json({error: "Недостаточно прав"}, {status: 400});
	}

	// Поиск очереди файлов на скачивание
	const {data: all_id, error} = await supabase
		.from("files_to_download")
		.select("task_id")
		.eq("patient_username", username);

	if (!all_id) {
		return NextResponse.json({error: "id файлов пациента не найдены"}, {status: 500});
	}

	// Формирование массива файлов для отправки
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

	if (!username || !task_id) {
		console.log("Не удалось получить username или task_id");
		return NextResponse.json({error: "Не удалось получить username или task_id"}, {status: 400});
	}

	// Проверка токена пользователя
	const token = req.cookies.get("token")?.value;
	if (!token) {
		return NextResponse.json({error: "Пользователь не залогинен"}, {status: 400});
	}
	if (!isLoginValid(username, token)) {
		return NextResponse.json({error: "Недостаточно прав"}, {status: 400});
	}

	// Удаление файла из очереди
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
