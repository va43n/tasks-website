import {NextRequest, NextResponse} from "next/server";
import supabase from "../../../../../../lib/supabase";

export async function POST(req: NextRequest) {
	let username_req = "";
	try {
		const { username } = await req.json();
		username_req = username;

		const {error, data: profile} = await supabase
			.from("profiles")
			.select("*")
			.eq("doctor_username", username)
			.single();

		if (error) {
			return NextResponse.json({error: "Не удалось найти профиль"}, {status: 500});
		}

		if (!profile) {
			return NextResponse.json({error: "Профиля не существует"}, {status: 404});
		}

		return NextResponse.json({profile}, {status: 200});
	} catch (err) {
		return NextResponse.json({error: `Профиль доктора не найден |${username_req}|`}, {status: 500});
	}
}