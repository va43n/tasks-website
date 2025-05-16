import {NextRequest, NextResponse} from "next/server";
import supabase from "../../../../../lib/supabase";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
	const {username, password} = await req.json();

	console.log(username, password);

	if (!username || !password) {
		console.log("Не удалось получить username или password");
		return NextResponse.json({error: "Не удалось получить username или password"}, {status: 400});
	}

	const {data: user, error: userError} = await supabase
		.from("users")
		.select("*")
		.eq("username", username);

	console.log(user);

	if (user.length == 0) {
		return NextResponse.json({error: "Пользователя " + username + " " + password + "не существует"}, {status: 500});
	}

	const passwordMatch = await bcrypt.compare(password, user[0].password);
	if (!passwordMatch) {
		return NextResponse.json({error: "Неправильно введен логин или пароль"}, {status: 400});
	}

	const {data: patient, error: patientError} = await supabase
		.from("patients")
		.select("*")
		.eq("patient_username", username);

		console.log(patient);

	if (patient.length == 0) {
		return NextResponse.json({error: "Такого пациента не существует"}, {status: 500});
	}

	return NextResponse.json({message: "Такой пациент есть!"}, {status: 200});
}