import {NextResponse} from "next/server";
import supabase from "../../../../../lib/supabase";

export async function GET(req: Request, {params}: {params: {username: string}}) {
	const {username} = params;

	const {data: profile} = await supabase
		.from("profiles")
		.select("*")
		.eq("doctor_username", username);

	if (!profile) {
		return NextResponse.json({error: "Профиль доктора не найден"}, {status: 404});
	}

	return NextResponse.json({...profile, username: user.username});
}

export async function PUT(req: Request, {params}: {params: {username: string}}) {
	const {username} = params;
	const {bio} = await req.json();

	const {error} = await supabase
		.from("profiles")
		.update({bio: bio})
		.eq("doctor_username", username);

	if (error) {
		return NextResponse.json({error: "Ошибка обновления профиля"}, {status: 500});
	}

	return NextResponse.json({message: "Профиль обновлен"});
}

export async function POST(req: Request, {params}: {params: {username: string}}) {
	const {username} = params;
	const {title, description, fileUrl, imageUrl} = await req.json();

	if (!title || !description || !imageUrl || !fileUrl) {
		return NextResponse.json({error: "Вы не заполнили все поля"}, {status: 400});
	}

	const {data: tasks} = await supabase
		.from("profiles")
		.select("tasks")
		.eq("doctor_username", username);

	if (error) {
		return NextResponse.json({error: "Задания доктора не найдены"}, {status: 500});
	}

	const updatedTasks = [...(profile.tasks || []), {title, description, imageUrl, fileUrl}];

	const {error} = await supabase
		.from("profiles")
		.update({tasks: updatedTasks})
		.eq("doctor_username", username);

	if (error) {
		return NextResponse.json({error: "Не удалось добавить задание"}, {status: 500});
	}

	return NextResponse.json({message: "Задание добавлено"});
}

export async function DELETE(req: Request, {params}: {params: {username: string}}) {
	const {username} = params;
	const {title} = await req.json();

	const {data: tasks} = await supabase
		.from("profiles")
		.select("tasks")
		.eq("doctor_username", username);

	if (error) {
		return NextResponse.json({error: "Задания доктора не найдены"}, {status: 500});
	}

	const updatedTasks = [...(profile.tasks || []).filter((task: any) => task.title !== title)];

	const {error} = await supabase
		.from("profiles")
		.update({tasks: updatedTasks})
		.eq("doctor_username", username);

	if (error) {
		return NextResponse.json({error: "Не удалось удалить задание"}, {status: 500});
	}

	return NextResponse.json({message: "Задание удалено"});
}