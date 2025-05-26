"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import "../../../../styles/globals.css";
import "../../../../styles/form.css";

export default function RegisterPage() {
	const router = useRouter();
	// Определение формы
	const [form, setForm] = useState({
		full_name: "",
		username: "",
		email: "",
		role: "Пациент",
		password: "",
		confirmPassword: "",
	});
	const [error, setError] = useState("");

	// Изменение формы должно отражаться на экране
	const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
		setForm({...form, [e.target.name]: e.target.value});
	};

	// Обработка нажатия на кнопку "Зарегистрироваться"
	const handleRegister = async () => {
		setError("");

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

		router.push("/auth/login");
	};

	return (
		<div className="centered-container-form centered-container-form-width">
			<h3>Регистрация</h3>
			<input className="form-box-size form-rounded-box" type="text" name="full_name" placeholder="ФИО" onChange={handleChange} />
			<input className="form-box-size form-rounded-box" type="text" name="username" placeholder="Логин" onChange={handleChange} />
			<input type="email" className="form-box-size form-rounded-box" name="email" placeholder="Электронная почта" onChange={handleChange} />
			<div className="form-select-container form-box-size">
				<select className="form-select-form form-rounded-box" name="role" onChange={handleChange}>
					<option value="Пациент">Пациент</option>
					<option value="Доктор">Доктор</option>
				</select>
			</div>
			<input type="password" className="form-box-size form-rounded-box" name="password" placeholder="Пароль" onChange={handleChange} />
			<input type="password" className="form-box-size form-rounded-box" name="confirmPassword" placeholder="Повторите пароль" onChange={handleChange} />
			{error && <p color="red">{error}</p>}
			<button className="form-box-size form-rounded-box form-button-form" onClick={handleRegister}>Зарегистрироваться</button>
		</div>
	)
}