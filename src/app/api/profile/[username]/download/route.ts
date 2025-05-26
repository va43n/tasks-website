import {NextRequest, NextResponse} from "next/server";
import supabase from "../../../../../../lib/supabase";
import {isLoginValid} from "../../../../../../lib/jwt";


export async function POST(req: NextRequest) {
	const {selfUsername, task_id} = await req.json();

	if (!selfUsername || !task_id) {
		console.log("Не удалось получить username пользователя или task_id");
		return NextResponse.json({error: "Не удалось получить username пользователя или task_id"}, {status: 400});
	}

	// Проверка токена пользователя
	const token = req.cookies.get("token")?.value;
	if (!token) {
		return NextResponse.json({error: "Пользователь не залогинен"}, {status: 400});
	}
	if (!isLoginValid(selfUsername, token)) {
		return NextResponse.json({error: "Недостаточно прав"}, {status: 400});
	}

	// Поиск пациента с таким логином
	const {data: patient, error: patientNotFound} = await supabase
		.from("patients")
		.select("*")
		.eq("patient_username", selfUsername)
		.single();

	if (!patient) {
		return NextResponse.json({error: "Запись о пациенте не найдена"}, {status: 500});
	}

	// Поиск записи о файлах пациента для скачивания
	const {data: all_id, error: idNotFound} = await supabase
		.from("files_to_download")
		.select("*")
		.eq("patient_username", selfUsername);

	if (!all_id) {
		return NextResponse.json({error: "Запись о файлах пациента на скачивание не найдена"}, {status: 500});
	}

	for (let id of all_id) {
		if (id.task_id === task_id) {
			return NextResponse.json({message: "Такой файл уже есть в очереди на скачивание"});
		}
	}

	// Добавление нового задания в очередь на скачивание
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