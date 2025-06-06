"use client";

import {useState} from "react";
import {useRouter} from "next/navigation";

import "../../../../styles/globals.css";
import "../../../../styles/form.css";

export default function LoginPage() {
	const router = useRouter();
	// Определение формы
	const [form, setForm] = useState({
		username: "",
		password: "",
	});
	const [error, setError] = useState("");

	// Изменение формы должно отражаться на экране
	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setForm({...form, [e.target.name]: e.target.value});
	};

	// Обработка нажатия на кнопку "Войти"
	const handleLogin = async () => {
		setError("");

		const response = await fetch("/api/login", {
			method: "POST",
			headers: {"Content-Type": "application/json"},
			body: JSON.stringify(form),
		});

		const data = await response.json();
		if (!response.ok) {
			setError(data.error);
			return;
		}

		router.push("/");
	};

	return (
		<div className="centered-container-form centered-container-form-width">
			<h3>Вход</h3>
			<input className="form-box-size form-rounded-box" type="text" name="username" placeholder="Логин" onChange={handleChange} />
			<input type="password" className="form-box-size form-rounded-box" name="password" placeholder="Пароль" onChange={handleChange} />
			{error && <p color="red">{error}</p>}
			<button className="form-box-size form-rounded-box form-button-form" onClick={handleLogin}>Войти</button>
		</div>
	);
}
