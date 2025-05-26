import {NextRequest, NextResponse} from "next/server";
import supabase from "../../../../../lib/supabase";
import {isLoginValid} from "../../../../../lib/jwt";


type Task = {
	task_id: string;
	title: string;
	description: string;
	fileUrl: string;
	imageUrl: string;
};


export async function PUT(req: NextRequest) {
	const { username, bio } = await req.json();

	const token = req.cookies.get("token")?.value;
	if (!token) {
		return NextResponse.json({error: "Пользователь не залогинен"}, {status: 400});
	}
	if (!isLoginValid(username, token)) {
		return NextResponse.json({error: "Недостаточно прав"}, {status: 400});
	}


	const {data: doctor, error: doctorNotFound} = await supabase
		.from("doctors")
		.select("*")
		.eq("doctor_username", username)
		.single();

	if (!doctor) {
		return NextResponse.json({error: "Доктор не найден"}, {status: 404});
	}

	const {error: notUpdated} = await supabase
		.from("doctors")
		.update({bio: bio})
		.eq("doctor_username", username);

	if (notUpdated) {
		return NextResponse.json({error: "Ошибка обновления профиля"}, {status: 500});
	}

	return NextResponse.json({message: "Профиль обновлен"}, {status: 200});
}

export async function POST(req: NextRequest) {
	const {username, title, description, file_url, image_url} = await req.json();

	console.log(`|${username}|${title}|${description}|${file_url}|${image_url}|`);

	if (!title || !description || !image_url || !file_url) {
		console.log("Вы не заполнили все поля");
		return NextResponse.json({error: "Вы не заполнили все поля"}, {status: 400});
	}

	const token = req.cookies.get("token")?.value;
	if (!token) {
		return NextResponse.json({error: "Пользователь не залогинен"}, {status: 400});
	}
	if (!isLoginValid(username, token)) {
		return NextResponse.json({error: "Недостаточно прав"}, {status: 400});
	}

	const {data: doctor, error: doctorNotFound} = await supabase
		.from("doctors")
		.select("*")
		.eq("doctor_username", username)
		.single();

	if (!doctor) {
		return NextResponse.json({error: "Доктор не найден"}, {status: 404});
	}

	const { error: addError, data: newRow } = await supabase
		.from("tasks")
		.insert({
			doctor_username: username,
			title: title,
			description: description,
			image_url: image_url,
			file_url: file_url
		})
		.select();

	if (addError) {
		return NextResponse.json({error: "Не удалось добавить задание"}, {status: 500});
	}

	return NextResponse.json({task_id: newRow[0].task_id}, {status: 200});
}

export async function DELETE(req: NextRequest) {
	const {username, task_id} = await req.json();

	const token = req.cookies.get("token")?.value;
	if (!token) {
		return NextResponse.json({error: "Пользователь не залогинен"}, {status: 400});
	}
	if (!isLoginValid(username, token)) {
		return NextResponse.json({error: "Недостаточно прав"}, {status: 400});
	}

	const {data: doctor, error: doctorNotFound} = await supabase
		.from("doctors")
		.select("*")
		.eq("doctor_username", username)
		.single();

	if (!doctor) {
		return NextResponse.json({error: "Доктор не найден"}, {status: 404});
	}

	const {data: task, error: taskNotFound} = await supabase
		.from("tasks")
		.select("*")
		.eq("task_id", task_id)
		.single();

	if (taskNotFound) {
		return NextResponse.json({error: "Не удалось найти задание"}, {status: 500});
	}

	const image_path = `tasks/${username}/${task.image_url.split("/").pop()}`;
	const file_path = `tasks/${username}/${task.file_url.split("/").pop()}`;

	const { error: deleteFilesError } = await supabase.storage
		.from("profiles-files")
		.remove([image_path, file_path])

	if (deleteFilesError) {
		return NextResponse.json({error: "Не удалось удалить файлы задания"}, {status: 500});
	}

	const {error: deleteError} = await supabase
		.from("tasks")
		.delete()
  		.eq('task_id', task_id)

	if (deleteError) {
		return NextResponse.json({error: "Не удалось удалить задание"}, {status: 500});
	}

	return NextResponse.json({message: "Задание удалено"}, {status: 200});
}