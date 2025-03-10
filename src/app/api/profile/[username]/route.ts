import {NextRequest, NextResponse} from "next/server";
import supabase from "../../../../../lib/supabase";

export async function GET(req: NextRequest) {
	const { username } = await req.json();

	const {data: profile} = await supabase
		.from("profiles")
		.select("*")
		.eq("doctor_username", username)
		.maybeSingle();

	if (!profile) {
		return NextResponse.json({error: "Профиль доктора не найден"}, {status: 404});
	}

	return NextResponse.json({...profile, username: username});
}

export async function PUT(req: NextRequest) {
	const { username, bio } = await req.json();

	const {error} = await supabase
		.from("profiles")
		.update({bio: bio})
		.eq("doctor_username", username);

	if (error) {
		return NextResponse.json({error: "Ошибка обновления профиля"}, {status: 500});
	}

	return NextResponse.json({message: "Профиль обновлен"});
}

export async function POST(req: NextRequest) {
	const {username, title, description, fileUrl, imageUrl} = await req.json();

	if (!title || !description || !imageUrl || !fileUrl) {
		return NextResponse.json({error: "Вы не заполнили все поля"}, {status: 400});
	}

	const {data, error: findError} = await supabase
		.from("profiles")
		.select("tasks")
		.eq("doctor_username", username);

	if (findError) {
		return NextResponse.json({error: "Задания доктора не найдены"}, {status: 500});
	}

	const updatedTasks = [...(data || []), {title, description, imageUrl, fileUrl}];

	const {error: addError} = await supabase
		.from("profiles")
		.update({tasks: updatedTasks})
		.eq("doctor_username", username);

	if (addError) {
		return NextResponse.json({error: "Не удалось добавить задание"}, {status: 500});
	}

	return NextResponse.json({message: "Задание добавлено"});
}

export async function DELETE(req: NextRequest) {
	const {username, title} = await req.json();

	const {data, error: findError} = await supabase
		.from("profiles")
		.select("tasks")
		.eq("doctor_username", username);

	if (findError) {
		return NextResponse.json({error: "Задания доктора не найдены"}, {status: 500});
	}

	const updatedTasks = [...(data || []).filter((task: any) => task.title !== title)];

	const {error: deleteError} = await supabase
		.from("profiles")
		.update({tasks: updatedTasks})
		.eq("doctor_username", username);

	if (deleteError) {
		return NextResponse.json({error: "Не удалось удалить задание"}, {status: 500});
	}

	return NextResponse.json({message: "Задание удалено"});
}