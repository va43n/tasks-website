import {NextRequest, NextResponse} from "next/server";
import supabase from "../../../../../lib/supabase";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
	const {username, password} = await req.json();
	
	if (!username || !password) {
		console.log("Не удалось получить username или password");
		return NextResponse.json({message: "Не удалось получить username или password"}, {status: 400});
	}

	// Поиск пользователя с таким логином
	const {data: user, error: userError} = await supabase
		.from("users")
		.select("*")
		.eq("username", username)
		.single();

	console.log(user);

	if (!user) {
		return NextResponse.json({message: "Не удалось найти пользователя"}, {status: 500});
	}

	// Проверка пароля
	const passwordMatch = await bcrypt.compare(password, user.password);
	if (!passwordMatch) {
		return NextResponse.json({message: "Не удалось найти пользователя"}, {status: 400});
	}

	// Поиск пациента с таким логином
	const {data: patient, error: patientError} = await supabase
		.from("patients")
		.select("*")
		.eq("patient_username", username)
		.single();

		console.log(patient);

	if (!patient) {
		return NextResponse.json({message: "Не удалось найти пациента"}, {status: 500});
	}

	return NextResponse.json({message: "Пациент найден!"}, {status: 200});
}