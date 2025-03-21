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
		<div className="profile-centered-container profile-centered-container-width">
			<p>Загрузка профиля...</p>
		</div>
		);

	return (
		<div className="profile-centered-container profile-centered-container-width">
			<h1 className="profile-title">Профиль доктора {profile.doctor_username}</h1>

			<div>
				<h3>Описание:</h3>
				{profile.bio ? (
					<>
						<p className="profile-space-text">{profile.bio}</p>
					</>
				) : <p>Описание отсутствует</p>}
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
										{task.imageUrl && <img src={task.imageUrl} alt={task.title} className="profile-img-size" />}
										{task.fileUrl && (
											<a className="profile-button-download-container" href={task.fileUrl} download>
												<button className="profile-button-download">Скачать</button>
											</a>
										)}
									</div>
								</div>
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