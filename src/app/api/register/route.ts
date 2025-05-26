import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import supabase from "../../../../lib/supabase";

export async function POST(req: NextRequest) {
	try {
		const { full_name, username, email, role, password, confirmPassword } = await req.json();

		if (!full_name || !username || !email || !role || !password || !confirmPassword) {
			return NextResponse.json({error: "Вы не заполнили все поля"}, {status: 400});
		}

		// Поиск пользователя с таким же логином
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

		// Хеширование пароля
		const hashedPassword = await bcrypt.hash(password, 11);

		// Добавление новой строки в users
		const { data: newRow, error: error } = await supabase
			.from("users")
			.insert({
				full_name: full_name,
				username: username,
				email: email,
				role: role,
				password: hashedPassword
			})
			.select();

		if (error) {
			return NextResponse.json({error: "Не удалось зарегистрироваться " + error}, {status: 500});
		}

		// Добавление строки в таблицу doctors или patients в зависимости от роли
		if (role === "Доктор") {
			const { error } = await supabase
			.from("doctors")
			.insert({
				doctor_username: newRow[0].username,
				bio: ""
			});

			if (error) {
				return NextResponse.json({error: "Не удалось добавить доктора в базу данных"}, {status: 500});
			}
		}
		else {
			const { error } = await supabase
			.from("patients")
			.insert({
				patient_username: newRow[0].username
			});

			if (error) {
				return NextResponse.json({error: "Не удалось добавить пациента в базу данных"}, {status: 500});
			}
		}

		return NextResponse.json({ success: true });
	} catch (err) {
		return NextResponse.json({error: "Ошибка сервера"}, {status: 500});
	}
}