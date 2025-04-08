import {NextRequest, NextResponse} from "next/server";
import supabase from "../../../../../../lib/supabase";

export async function POST(req: NextRequest) {
	try {
		const { username } = await req.json();

		const {error: tasksNotFound, data: tasks} = await supabase
			.from("tasks")
			.select("*")
			.eq("doctor_username", username);

		if (tasksNotFound) {
			return NextResponse.json({error: "Не удалось найти профиль"}, {status: 500});
		}

		if (!tasks) {
			return NextResponse.json({error: "Профиля не существует"}, {status: 404});
		}

		const {error: bioNotFound, data: bio} = await supabase
			.from("doctors")
			.select("bio")
			.eq("doctor_username", username);

		if (bioNotFound) {
			return NextResponse.json({error: "Не удалось получить информацию о докторе"}, {status: 500});
		}

		const profile = {
			doctor_username: username,
			bio: bio[0].bio,
			tasks: tasks
		}

		return NextResponse.json({profile}, {status: 200});
	} catch (err) {
		return NextResponse.json({error: "Профиль доктора не найден"}, {status: 500});
	}
}