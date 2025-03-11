"use client";

import {useEffect, useState} from "react";
import {useParams, useRouter} from "next/navigation";

interface Task {
	title: string;
	description: string;
	fileUrl: string;
	imageUrl: string;
}

export default function EditProfile() {
	const {username} = useParams();

	const [tasks, setTasks] = useState<Task[]>([]);
	
	const [bio, setBio] = useState("");

	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [file, setFile] = useState<File | null>(null)
	const [image, setImage] = useState<File | null>(null);;

	const [taskToDelete, setTaskToDelete] = useState("");

	useEffect(() => {
		const fetchProfile = async () => {
			const res = await fetch(`api/profile/${username}`);
			const data = await res.json();
			if (data) {
				setBio(data.bio || "");
				setTasks(data.tasks || []);
			}
		};
		fetchProfile();
	}, [username]);

	const updateBio = async() => {
		await fetch(`api/profile/${username}`, {
			method: "PUT",
			headers: {"Content-Type": "application/json"},
			body: JSON.stringify({username, bio}),
		});
	};

	const uploadFile = async (file: File, type: "file" | "image") => {
		const formData = new FormData();
		formData.append("file", file);

		if (username) {
			const usernameStr = Array.isArray(username) ? username[0] : username;
			formData.append("username", usernameStr);
		}
		else {
			console.error("username не определен");
			return null;
		}

		const res = await fetch("{api/upload", {
			method: "POST",
			body: formData,
		});

		const data = await res.json();
		if (data.error) {
			alert(`Ошибка загрузки ${type}: ${data.error}`);
			return null;
		}
		return data.publicUrl;
	}

	const addTask = async() => {
		const fileUrl = await uploadFile(file, "file");
		const imageUrl = await uploadFile(image, "image");

		await fetch(`api/profile/${username}`, {
			method: "POST",
			headers: {"Content-Type": "application/json"},
			body: JSON.stringify({username, title, description, fileUrl, imageUrl}),
		});

		if (!res.ok) {
			alert("Не удалось добавить задание");
			return;
		}

		setAllTitles([...allTitles, {title}]);
		setTitle("");
		setDescription("");
		setImageUrl("");
		setFileUrl("");
	};

	const deleteTask = async() => {
		await fetch(`api/profile/${username}`, {
			method: "DELETE",
			headers: {"Content-Type": "application/json"},
			body: JSON.stringify({username, taskToDelete}),
		});

		setAllTitles(tasks.filter((task) => task.title !== taskToDelete));
		setTaskToDelete("");
	};

	return (
		<div>
			<h1>Редактирование профиля пользователя {username}</h1>

			<h3>Изменение описания:</h3>
			<textarea value={bio} onChange={(e) => setBio(e.target.value)} />
			<button onClick={updateBio}>Сохранить</button>

			<h3>Добавление нового задания:</h3>
			<input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Название задания" />
			<textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Описание задания" />
			<p>Прикрепите картинку:</p>
			<input type="file" accept="image/*" onChange={(e) => setImage(e.target.files?.[0] || null)} className="input-file" />
			<p>Прикрепите файл:</p>
			<input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} className="input-file" />
			<button onClick={addTask}>Добавить задание</button>

			<h3>Удаление задания:</h3>
			<select value={taskToDelete} onChange={(e) => setTaskToDelete(e.target.value)}>
				{tasks.map((task) => (
					<option key={task.title} value={task.title}>
						{task.title}
					</option>
				))}
			</select>
			<button onClick={deleteTask}>Удалить задание</button>
		</div>
	);
}