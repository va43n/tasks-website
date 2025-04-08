import {NextRequest, NextResponse} from "next/server";
import supabase from "../../../../../../lib/supabase";


export async function POST(req: NextRequest) {
	const {selfUsername, task_id} = await req.json();

	console.log(selfUsername, task_id);

	if (!selfUsername || !task_id) {
		console.log("Не удалось получить username пользователя или task_id");
		return NextResponse.json({error: "Не удалось получить username пользователя или task_id"}, {status: 400});
	}

	const {data: patient, error: patientNotFound} = await supabase
		.from("patients")
		.select("*")
		.eq("patient_username", selfUsername)
		.single();

	if (!patient) {
		return NextResponse.json({error: "Запись о пациенте не найдена"}, {status: 500});
	}

	const {data: all_id, error: idNotFound} = await supabase
		.from("files_to_download")
		.select("*")
		.eq("patient_username", selfUsername);

	for (let id in all_id) {
		if (id.task_id === task_id) {
			return NextResponse.json({message: "Такой файл уже есть в очереди на скачивание"});
		}
	}

	const { error: addError } = await supabase
		.from("files_to_download")
		.insert({
			patient_username: selfUsername,
			task_id: task_id
		});

	if (addError) {
		return NextResponse.json({error: "Не удалось добавить задание в очередь на скачивание"}, {status: 500});
	}

	return NextResponse.json({message: "Файл сохранен"});
}