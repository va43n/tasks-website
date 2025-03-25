import {NextRequest, NextResponse} from "next/server";
import supabase from "../../../../lib/supabase";


export async function POST(req: NextRequest) {
	const {selfUsername, fileUrl} = await req.json();

	console.log(selfUsername, fileUrl);

	if (!selfUsername || !fileUrl) {
		console.log("Не удалось получить username или ссылку на файл");
		return NextResponse.json({error: "Не удалось получить username или ссылку на файл"}, {status: 400});
	}

	const {data, error} = await supabase
		.from("patient_files")
		.select("files")
		.eq("patient_username", selfUsername)
		.single();

	if (!data) {
		return NextResponse.json({error: "Запись о файлах пациента не найдена"}, {status: 500});
	}

	const updatedFiles = [...data.files, fileUrl];

	const {error: addError} = await supabase
		.from("patient_files")
		.update({files: updatedFiles})
		.eq("patient_username", selfUsername);

	if (addError) {
		return NextResponse.json({error: "Не удалось добавить ссылку на задание"}, {status: 500});
	}

	return NextResponse.json({message: "Файл сохранен"});
}