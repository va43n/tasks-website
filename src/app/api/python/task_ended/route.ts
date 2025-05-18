import {NextRequest, NextResponse} from "next/server";
import supabase from "../../../../../lib/supabase";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
	const {username, password, task_id, result} = await req.json();

	if (!username || !task_id || !result) {
		console.log("Не удалось получить username или task_id или результат");
		return NextResponse.json({error: "Не удалось получить username или task_id или результат"}, {status: 400});
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
		return NextResponse.json({message: "Не удалось найти пользователя"}, {status: 400});
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

	const {data: task, error: taskError} = await supabase
		.from("tasks")
		.select("*")
		.eq("task_id", task_id)
		.single();

	console.log(task);

	if (!task) {
		return NextResponse.json({message: "Задание не найдено"}, {status: 500});
	}

	const time = Date.now();
	const activity = (result === "Success" ? "Пациент выполнил задание" : "Пациент не справился с заданием") + task.title;

	const {error: insertError} = await supabase
		.from("patient_activities")
		.insert({
			patient_username: username,
			task_id: task_id,
			activity: activity,
			time: time
		});

	if (insertError) {
		return NextResponse.json({error: `Не удалось вставить строку об активности ${username}`}, {status: 500});
	}

	return NextResponse.json({status: 200});
}