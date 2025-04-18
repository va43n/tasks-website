import {NextRequest, NextResponse} from "next/server";
import supabase from "../../../../../lib/supabase";

export async function POST(req: NextRequest) {
	const {username, task_id, result} = await req.json();

	if (!username || !task_id || !result) {
		console.log("Не удалось получить username или task_id или результат");
		return NextResponse.json({error: "Не удалось получить username или task_id или результат"}, {status: 400});
	}

	const time = Date.now();
	const activity = result === "Success" ? "Пациент выполнил задание" : "Пациент не справился с заданием";

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