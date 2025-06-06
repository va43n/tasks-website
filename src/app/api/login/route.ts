import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import supabase from "../../../../lib/supabase";
import { createJWT } from "../../../../lib/jwt";

export async function POST(req: NextRequest) {
	try {
		const {username, password} = await req.json();

		if (!username || !password) {
			return NextResponse.json({error: "Вы не заполнили все поля"}, {status: 400});
		}

		// Поиск пользователя в users с таким же username
		const {data: user, error} = await supabase
			.from("users")
			.select("user_id, username, password, role")
			.eq("username", username)
			.single();

		if (!user || error) {
			return NextResponse.json({error: "Неправильно введен логин или пароль"}, {status: 400});
		}

		// Проверка пароля
		const passwordMatch = await bcrypt.compare(password, user.password);
		if (!passwordMatch) {
			return NextResponse.json({error: "Неправильно введен логин или пароль"}, {status: 400});
		}

		// Создание JWT токена для дальнейшей работы пользователя с сайтом: авторизация
		const token = createJWT({id: user.user_id, username: user.username, role: user.role});

		const response = NextResponse.json({success: true});
		response.cookies.set("token", token, {httpOnly: true, secure: true, path: "/"});

		return response;
	} catch (err) {
		return NextResponse.json({error: "Ошибка сервера"}, {status: 500});
	}
}