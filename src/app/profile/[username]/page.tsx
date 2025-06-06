"use client";

import {useEffect, useState} from "react";
import {useParams} from "next/navigation";
import Image from "next/image";

import "../../../../styles/globals.css";
import "../../../../styles/profile.css";

type Task = {
	task_id: string;
	title: string;
	description: string;
	file_url: string;
	image_url: string;
};

type Profile = {
  doctor_username: string;
  bio: string;
  tasks: Task[];
};

type User = {
  username: string;
  role: string;
};

export default function ProfilePage() {
	const [selfUser, setSelfUser] = useState<User | null>(null);

	const {username} = useParams();
	const [profile, setProfile] = useState<Profile | null>(null);

	const [messages, setMessages] = useState<string[]>([]);

	// Выполнение действий при загрузке страницы
	useEffect(() => {
		// Проверка пользователя
		const fetchUser = async () => {
			const res = await fetch("/api/auth/me");
			if (!res.ok) return setSelfUser(null);
			const data = await res.json();
			setSelfUser(data.user);
		};

		// Получение данных о профиле
		const getProfile = async () => {
			try {
				const response = await fetch(`/api/profile/${username}/get`, {
					method: "POST",
					headers: {"Content-Type": "application/json"},
					body: JSON.stringify({username}),
				});

				const data = await response.json();
				if (!response.ok) {
					console.error("Не удалось загрузить профиль");
					return;
				}

				setProfile(data.profile);
				console.log(data.profile);

				if (profile) {
					setMessages(new Array(profile.tasks.length).fill(""));
				}
			} catch (err) {
				console.error("Ошибка загрузки профиля:", err);
			}
		}

		fetchUser();
		getProfile();
	}, [username]);

	// Обработка нажатия на кнопку "Скачать"
	const handleDownload = async (task_id: string, index: number) => {
		setMessages(prev => {
			const updated = [...prev];
			updated[index] = "";
			return updated;
		});

		const selfUsername = selfUser?.username;
		try {
			const response = await fetch(`/api/profile/${username}/download`, {
				method: "POST",
				body: JSON.stringify({selfUsername, task_id}),
			});

			const data = await response.json();
			if (!response.ok) {
				setMessages(prev => {
					const updated = [...prev];
					updated[index] = data.error;
					return updated;
				});
				return;
			}
			setMessages(prev => {
				const updated = [...prev];
				updated[index] = data.message;
				return updated;
			});
		} catch (err) {
			setMessages(prev => {
				const updated = [...prev];
				updated[index] = "Не удалось выполнить запрос";
				return updated;
			});
		}
	}

	if (!profile) return (
		<div className="profile-centered-container profile-centered-container-width">
			<p>Загрузка профиля...</p>
		</div>
	);

	return (
		<div className="profile-centered-container profile-centered-container-width">
			<h1 className="profile-title">Профиль доктора {profile.doctor_username}</h1>

			<div className="profile-text-width">
				<h3 className="profile-text-width">Описание:</h3>
				{profile.bio ? (
					<>
						<p className="profile-space-text profile-text-width">{profile.bio}</p>
					</>
				) : <p className="profile-space-text profile-text-width">Описание отсутствует</p>}
			</div>

			<div>
				<h3>Список заданий:</h3>
				{profile.tasks && profile.tasks.length > 0 ? (
					<div className="profile-gap-between-tasks">
						{profile.tasks.map((task, index) => (
							<div className="tasks-part-profile" key={index}>
								<p className="profile-task-title">{index + 1}. {task.title}</p>
								<div className="profile-task-content">
									<p className="profile-task-text profile-space-text">{task.description}</p>
									<div className="profile-button-img-container">
										{task.image_url && <Image src={task.image_url} alt={task.title} className="profile-img-size" />}
										{task.file_url && (
											<button className="profile-button-download" onClick={() => handleDownload(task.task_id, index)}>Скачать</button>
										)}
									</div>
								</div>
								{messages && messages[index] !== "" && <p className="message">{messages[index]}</p>}
							</div>
						))}
					</div>
				) : (
				<p>Заданий пока нет.</p>
			)}
			</div>
		</div>
	);
}