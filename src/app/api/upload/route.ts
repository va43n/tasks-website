import {NextResponse} from "next/server";
import {uploadFile} from "../../../../lib/supabase";

export async function POST(req: Request) {
	const formData = await req.formData();
	const file = formData.get("file") as File | null;
	const username = formData.get("username") as string;

	if (!file) {
		return NextResponse.json({error: "Файл не найден"}, {status: 400});
	}

	try {
		const filePath = await uploadFile(file, `tasks/${username}`);
		return NextResponse.json({filePath}, {status: 200});
	} catch (err) {
		return NextResponse.json({error: "Ошибка загрузки"}, {status: 500});
	}
}