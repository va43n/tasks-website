import {NextResponse} from "next/server";
import {uploadFile} from "../../../../../../lib/supabase";

export async function POST(req: Request) {
	const formData = await req.formData();
	const file = formData.get("file") as File | null;
	const username = formData.get("username") as string;

	if (file === null) {
		console.log("Файл не найден", 400);
		return NextResponse.json({error: "Файл не найден"}, {status: 400});
	}

	try {
		const publicUrl = await uploadFile(file, `tasks/${username}`);

		return NextResponse.json({publicUrl}, {status: 200});
	} catch (err) {
		console.log("Ошибка загрузки", 500);
		return NextResponse.json({error: "Ошибка загрузки"}, {status: 500});
	}
}