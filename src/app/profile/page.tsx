"use client";

import {useEffect, useState} from "react";
import {useParams} from "next/navigation";

export default function Profile() {
	const {username} = useParams();
	const [profile, setProfile] = useState(null);

	useEffect(() => {
		fetch(`api/profile/${username}`)
			.then((res) => res.json())
			.then((data) => setProfile(data))
			.catch((err) => console.error("Ошибка загрузки профиля:", err));
	}, [username]);

	if (!profile) return <p>Загрузка профиля...</p>;

	return (
		<div>
			<h1>Профиль доктора {profile.username}</h1>
			<p>{profile.bio}</p>

			<h3>Список заданий:</h3>
			{profile.tasks.length > 0 ? (
				profile.tasks.map((task, index) => {
					<div key={index}>
						<h3>{task.title}</h3>
						<p>{task.description}</p>
						{task.image && <img src={task.image} alt={task.title} width="200" />}
						{task.file && (
							<a href={task.file} dowload>
								<button>Скачать</button>
							</a>
						)}
					</div>
				})
			) : (
				<p>Заданий пока нет.</p>
			)}
		</div>
	);
}