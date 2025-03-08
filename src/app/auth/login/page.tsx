"use client";

import {useState} from "react";
import {useRouter} from "next/navigation";

import "../../../../styles/globals.css";
import "../../../../styles/form.css";

export default function LoginPage() {
	const router = useRouter();
	const [form, setForm] = useState({
		username: "",
		password: "",
	});
	const [error, setError] = useState("");

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setForm({...form, [e.target.name]: e.target.value});
	};

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
		<div className="centered-container">
			<h3>Вход</h3>
			<input className="form-box-size rounded-box" type="text" name="username" placeholder="Логин" onChange={handleChange} />
			<input className="form-box-size rounded-box" type="text" name="password" placeholder="Пароль" onChange={handleChange} />
			{error && <p color="red">{error}</p>}
			<button className="form-box-size rounded-box button-form" onClick={handleLogin}>Войти</button>
		</div>
	);
}
