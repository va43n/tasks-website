import {NextRequest, NextResponse} from "next/server";
import supabase from "../../../../../lib/supabase";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
	const {username, password} = await req.json();

	console.log(username, password);

	if (!username || !password) {
		console.log("Не удалось получить username или password");
		return NextResponse.json({error: "Не удалось получить username или password"}, {status: 400});
	}

	const {data: user, error: userError} = await supabase
		.from("users")
		.select("*")
		.eq("username", username)
		.single();

	console.log(user);

	if (!user) {
		return NextResponse.json({message: "Не удалось найти пользователя"}, {status: 500});
	}

	const passwordMatch = await bcrypt.compare(password, user.password);
	if (!passwordMatch) {
		return NextResponse.json({message: "Неправильный пароль"}, {status: 400});
	}

	const {data: patient, error: patientError} = await supabase
		.from("patients")
		.select("*")
		.eq("patient_username", username)
		.single();

	console.log(patient);

	if (!patient) {
		return NextResponse.json({message: "Не удалось найти пациента"}, {status: 500});
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

	console.log(files);

	const {error: deleteError} = await supabase
		.from("files_to_download")
		.delete()
		.eq("patient_username", username);

	if (deleteError) {
		return NextResponse.json({error: "Не удалось удалить очередь скачиваемых файлов"}, {status: 500});
	}

	return NextResponse.json({files: files}, {status: 200});
}