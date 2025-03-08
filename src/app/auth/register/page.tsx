"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import "../../../../styles/globals.css";
import "../../../../styles/form.css";

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

	const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
		setForm({...form, [e.target.name]: e.target.value});
	};

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
		<div className="centered-container">
			<h3>Регистрация</h3>
			<input className="form-box-size rounded-box" type="text" name="full_name" placeholder="ФИО" onChange={handleChange} />
			<input className="form-box-size rounded-box" type="text" name="username" placeholder="Логин" onChange={handleChange} />
			<input className="form-box-size rounded-box" type="text" name="email" placeholder="Электронная почта" onChange={handleChange} />
			<div className="select-container form-box-size">
				<select className="select-form rounded-box" name="role" onChange={handleChange}>
					<option value="Пациент">Пациент</option>
					<option value="Доктор">Доктор</option>
				</select>
			</div>
			<input className="form-box-size rounded-box" type="text" name="password" placeholder="Пароль" onChange={handleChange} />
			<input className="form-box-size rounded-box" type="text" name="confirmPassword" placeholder="Повторите пароль" onChange={handleChange} />
			{error && <p color="red">{error}</p>}
			<button className="form-box-size rounded-box button-form" onClick={handleRegister}>Зарегистрироваться</button>
		</div>
	)
}