"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
	const router = useRouter();
	const [form, setForm] = useState({
		full_name: "",
		username: "",
		email: "",
		role: "Пациент",
		password: "",
		confirmPassword: "",
	});
	const [error, setError] = useState("");

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setForm({...form, [e.target.name]: e.target.value});
	};

	const handleRegister = async () => {
		setError("");

		if (form.password !== form.confirmPassword) {
			setError("Пароли не совпадают");
			return;
		}

		const response = await fetch("/api/register", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(form),
		});

		const data = await response.json();
		if (!response.ok) {
			setError(data.error);
			return;
		}

		router.push("auth/login");
	};

	return (
		<div>
			<h1>Регистрация</h1>
			<input type="text" name="full_name" placeholder="ФИО" onChange={handleChange} />
			<input type="text" name="username" placeholder="Логин" onChange={handleChange} />
			<input type="text" name="email" placeholder="Электронная почта" onChange={handleChange} />
			<select name="role" onChange={handleChange}>
				<option value="Пациент">Пациент</option>
				<option value="Доктор">Доктор</option>
			</select>
			<input type="text" name="password" placeholder="Пароль" onChange={handleChange} />
			<input type="text" name="confirmPassword" placeholder="Повторите пароль" onChange={handleChange} />
			{error && <p style={{color: red}}>{error}</p>}
			<button onClick={handleRegister}>Зарегистрироваться</button>
		</div>
	)
}