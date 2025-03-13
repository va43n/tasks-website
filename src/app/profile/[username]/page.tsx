"use client";

import {useEffect, useState} from "react";
import {useParams} from "next/navigation";

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

	if (!profile) return (<p>Загрузка профиля...</p>);

	return (
		<div>
			<h1>Профиль доктора {profile.doctor_username}</h1>
			<p>{profile.bio}</p>

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
	);
}