import {NextRequest, NextResponse} from "next/server";
import supabase from "../../../../../../lib/supabase";

export async function POST(req: NextRequest) {
	const { username } = await req.json();

	const {data: profile} = await supabase
		.from("profiles")
		.select("*")
		.eq("doctor_username", username)
		.maybeSingle();

	if (!profile) {
		return NextResponse.json({error: "Профиль доктора не найден"}, {status: 404});
	}

	return NextResponse.json({profile});
}