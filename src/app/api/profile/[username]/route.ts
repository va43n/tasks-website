import {NextRequest, NextResponse} from "next/server";
import supabase from "../../../../../lib/supabase";


type Task = {
	task_id: string;
	title: string;
	description: string;
	fileUrl: string;
	imageUrl: string;
};


export async function PUT(req: NextRequest) {
	const { username, bio } = await req.json();

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
	const {username, title, description, fileUrl, imageUrl} = await req.json();

	console.log(`|${username}|${title}|${description}|${fileUrl}|${imageUrl}|`);

	if (!title || !description || !imageUrl || !fileUrl) {
		console.log("Вы не заполнили все поля");
		return NextResponse.json({error: "Вы не заполнили все поля"}, {status: 400});
	}

	const {data: doctor, error: doctorNotFound} = await supabase
		.from("doctors")
		.select("*")
		.eq("doctor_username", username)
		.single();

	if (!doctor) {
		return NextResponse.json({error: "Доктор не найден"}, {status: 404});
	}

	const { error: addError } = await supabase
		.from("tasks")
		.insert({
			doctor_username: username,
			title: title,
			description: description,
			image_url: imageUrl,
			file_url: fileUrl
		});

	if (addError) {
		return NextResponse.json({error: "Не удалось добавить задание"}, {status: 500});
	}

	return NextResponse.json({message: "Задание добавлено"});
}

export async function DELETE(req: NextRequest) {
	const {username, task_id} = await req.json();

	const {data: doctor, error: doctorNotFound} = await supabase
		.from("doctors")
		.select("*")
		.eq("doctor_username", username)
		.single();

	if (!doctor) {
		return NextResponse.json({error: "Доктор не найден"}, {status: 404});
	}

	const {error: deleteError} = await supabase
		.from("tasks")
		.delete()
  		.eq('task_id', task_id)

	if (deleteError) {
		return NextResponse.json({error: "Не удалось удалить задание"}, {status: 500});
	}

	return NextResponse.json({message: "Задание удалено"});
}