import {NextRequest, NextResponse} from "next/server";
import supabase from "../../../../../lib/supabase";

export async function POST(req: NextRequest) {
	const {username, password} = await req.json();

	if (!username || !password) {
		console.log("Не удалось получить username или password");
		return NextResponse.json({error: "Не удалось получить username или password"}, {status: 400});
	}

	const {data: user, error: userError} = await supabase
		.from("users")
		.select("*")
		.eq("username", username)
		.eq("password", password);

	if (!user) {
		return NextResponse.json({error: "Такого пользователя не существует"}, {status: 500});
	}

	const {data: patient, error: patientError} = await supabase
		.from("users")
		.select("*")
		.eq("patient_username", username);

	if (!patient) {
		return NextResponse.json({error: "Такого пациента не существует"}, {status: 500});
	}

	return NextResponse.json({message: "Такой пациент есть!"}, {status: 200});
}