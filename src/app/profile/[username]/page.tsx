"use client";

import {useEffect, useState} from "react";
import {useParams} from "next/navigation";
import "../../../../styles/globals.css";
import "../../../../styles/profile.css";

interface Task {
	title: string;
	description: string;
	fileUrl: string;
	imageUrl: string;
};

type Profile = {
  doctor_username: string;
  bio: string;
  tasks: Task[];
};

export default function Profile() {
	const {username} = useParams();
	const [profile, setProfile] = useState<Profile | null>(null);

	useEffect(() => {
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
			} catch (err) {
				console.error("Ошибка загрузки профиля:", err);
			}
		}
		getProfile();
	}, [username]);

	if (!profile) return (
		<div className="centered-container">
			<p>Загрузка профиля...</p>
		</div>
		);

	return (
		<div className="centered-container">
			<h1 className="profile-title">Профиль доктора {profile.doctor_username}</h1>

			<div>
				<h3>Описание:</h3>
				{profile.bio ? (
					<>
						<p>{profile.bio}</p>
					</>
				) : <p>Описание отсутствует</p>}
			</div>

			<div>
				<h3>Список заданий:</h3>
				{profile.tasks && profile.tasks.length > 0 ? (
					<>
						{profile.tasks.map((task, index) => (
							<div key={index}>
								<h3>{task.title}</h3>
								<p>{task.description}</p>
								{task.imageUrl && <img src={task.imageUrl} alt={task.title} width="200" />}
								{task.fileUrl && (
									<a href={task.fileUrl} download>
										<button>Скачать</button>
									</a>
								)}
							</div>
						))}
					</>
				) : (
				<p>Заданий пока нет.</p>
			)}
			</div>
		</div>
	);
}