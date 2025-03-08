import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import supabase from "../../../../lib/supabase";

export async function POST(req: NextRequest) {
	try {
		const { full_name, username, email, role, password, confirmPassword } = await req.json();

		if (!full_name || !username || !email || !role || !password || !confirmPassword) {
			return NextResponse.json({error: "Вы не заполнили все поля"}, {status: 400});
		}

		const { data: existingUser } = await supabase
			.from("users")
			.select("id")
			.eq("username", username)
			.single();

		if (existingUser) {
			return NextResponse.json({error: "Пользователь с таким логином уже существует"}, {status: 400});
		}

		if (password !== confirmPassword) {
			return NextResponse.json({error: "Пароли не совпадают"}, {status: 400});
		}

		const hashedPassword = await bcrypt.hash(password, 11);

		const { data, error } = await supabase
			.from('users')
			.insert({
				full_name: full_name,
				username: username,
				email: email,
				role: role,
				password: hashedPassword
			});

		if (error) {
			return NextResponse.json({error: "Не удалось зарегистрироваться " + error}, {status: 500});
		}

		return NextResponse.json({ success: true });
	} catch (err) {
		return NextResponse.json({error: "Ошибка сервера"}, {status: 500});
	}
}