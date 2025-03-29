import {NextRequest, NextResponse} from "next/server";
import supabase from "../../../../../lib/supabase";


type File = {
	title: string;
  fileUrl: string;
};

export async function POST(req: NextRequest) {
	const {username} = await req.json();

	console.log(username);

	if (!username) {
		console.log("Не удалось получить username");
		return NextResponse.json({error: "Не удалось получить username"}, {status: 400});
	}

	const {data: files, error} = await supabase
		.from("patient_files")
		.select("files")
		.eq("patient_username", username)
		.single();

	if (!files) {
		return NextResponse.json({error: "Запись о файлах пациента не найдена"}, {status: 500});
	}

	return NextResponse.json({files}, {status: 200});
}

export async function DELETE(req: NextRequest) {
	const {username, fileName} = await req.json();

	console.log(username, fileName);

	if (!username || !fileName) {
		console.log("Не удалось получить username или fileName");
		return NextResponse.json({error: "Не удалось получить username или fileName"}, {status: 400});
	}

	const {data: files, error} = await supabase
		.from("patient_files")
		.select("files")
		.eq("patient_username", username)
		.single();

	if (!files) {
		return NextResponse.json({error: "Запись о файлах пациента не найдена"}, {status: 500});
	}

	console.log(files);

	const updatedFiles = files.files.filter((file: File) => file.fileName !== fileName);

	console.log(updatedFiles);

	const {error: deleteError} = await supabase
		.from("patient_files")
		.update({files: updatedFiles})
		.eq("patient_username", username);

	if (deleteError) {
		return NextResponse.json({error: "Не удалось файл"}, {status: 500});
	}

	return NextResponse.json({message: "Файл удален"});
}
