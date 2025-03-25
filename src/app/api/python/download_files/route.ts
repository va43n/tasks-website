import {NextRequest, NextResponse} from "next/server";
import supabase from "../../../../../lib/supabase";

export async function POST(req: NextRequest) {
	const {username} = await req.json();

	if (!username) {
		console.log("Не удалось получить username");
		return NextResponse.json({error: "Не удалось получить username"}, {status: 400});
	}

	const {data, error} = await supabase
		.from("patient_files")
		.select("files")
		.eq("patient_username", username)
		.single();

	if (!data) {
		return NextResponse.json({error: "Запись о файлах пациента не найдена"}, {status: 500});
	}

	return NextResponse.json({files}, {status: 200});
}