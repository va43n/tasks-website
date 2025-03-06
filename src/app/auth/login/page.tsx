"use client";

import {useState} from "react";
import {useRouter} from "next/navigation";

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
			body: JSON:stringify(form),
		});

		const data = await response.json();
		if (!response.ok) {
			setError(data.error);
			return;
		}

		router.push("/");
	};

	return (
		<div>
			<h1>Вход</h1>
			<input type="text", name="username" placeholder="Логин" onChange={handleChange} />
			<input type="text", name="password" placeholder="Пароль" onChange={handleChange} />
			{error && <p style={{color: red}}>{error}</p>}
			<button onCLick={handleRegister}>Войти</button>
		</div>
	);
}