import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import supabase from "@/lib/supabase";
import { createJWT } from "@/lib/jwt";

export async function POST(req: NextRequest) {
	try {
		const {username, password} = await req.json();

		const {data: user, error} = await supabase
			.from("users")
			.select("id, username, password")
			.eq("username", username)
			.single();

		if (!user || error) {
			return NextResponse.json({error: "Неправильно введен логин или пароль"}, {status: 400});
		}

		const passwordMatch = await bcrypt.compare(password, user.password);
		if (!passwordMatch) {
			return NextResponse.json({error: "Неправильно введен логин или пароль"}, {status: 400});
		}

		const token = createJWT({id: user.id, username: user.username});

		const response = NextResponse.json({success: true});
		response.cookies.set("token", token, {httpOnly: true, secure: true, path: "/"});

		return response;
	} catch (err) {
		return NextResponse.json({error: "Ошибка сервера"}, {status: 500});
	}
}