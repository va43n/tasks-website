import {NextRequest, NextResponse} from "next/server";
import supabase from "../../../../../lib/supabase";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
	const {username, password} = await req.json();

	if (!username || !password) {
		console.log("Не удалось получить username или password");
		return NextResponse.json({error: "Не удалось получить username или password"}, {status: 400});
	}

	const hashedPassword = await bcrypt.hash(password, 11);

	const {data: user, error: userError} = await supabase
		.from("users")
		.select("*")
		.eq("username", username)
		.eq("password", hashedPassword);

	if (!user) {
		return NextResponse.json({error: "Пользователя " + username + " " + password + "не существует"}, {status: 500});
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