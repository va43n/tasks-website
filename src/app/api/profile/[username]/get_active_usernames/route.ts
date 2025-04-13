import {NextRequest, NextResponse} from "next/server";
import supabase from "../../../../../../lib/supabase";

export async function POST(req: NextRequest) {
	try {
		const { username } = await req.json();

		const {data: all_id, error: all_id_error} = await supabase
			.from("tasks")
			.select("task_id")
			.eq("doctor_username", username);

		if (all_id_error) {
			return NextResponse.json({error: "id заданий доктора не найдены"}, {status: 500});
		}

		console.log(all_id);

		return NextResponse.json({profile}, {status: 200});
	} catch (err) {
		return NextResponse.json({error: "Профиль доктора не найден"}, {status: 500});
	}
}