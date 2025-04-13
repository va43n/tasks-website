import {NextRequest, NextResponse} from "next/server";
import supabase from "../../../../../lib/supabase";

export async function POST(req: NextRequest) {
	const {username, task_id} = await req.json();

	if (!username || !task_id) {
		console.log("Не удалось получить username или task_id");
		return NextResponse.json({error: "Не удалось получить username или task_id"}, {status: 400});
	}

	const time = Date.now();
	const activity = "Пациент начал выполнение задания";

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