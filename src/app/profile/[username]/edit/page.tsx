"use client";

import {useEffect, useState} from "react";
import {useParams, useRouter} from "next/navigation";
import FileUploader from "../../../components/fileUploader";
import "../../../../../styles/globals.css";
import "../../../../../styles/profile_edit.css";

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
	const [image, setImage] = useState<File | null>(null);

	const [taskToDelete, setTaskToDelete] = useState("");

	const [resetTrigger, setResetTrigger] = useState(false);

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

				setBio(data.profile.bio || "");
				setTasks(data.profile.tasks || []);
				if (tasks) {
					console.log(tasks);
					// setTaskToDelete(tasks[0].title);
				} else setTaskToDelete("");
			} catch (err) {
				console.error("Ошибка загрузки профиля:", err);
			}
		}
		getProfile();
	}, [username]);

	const updateBio = async() => {
		const response = await fetch(`/api/profile/${username}`, {
			method: "PUT",
			headers: {"Content-Type": "application/json"},
			body: JSON.stringify({username, bio}),
		});

		if (!response.ok) {
			console.error("Не удалось обновить описание");
			return;
		}
	};

	const uploadFile = async (file: File | null, type: "file" | "image") => {
		console.log(username, file);

		const formData = new FormData();

		if (file === null) {
			console.error("Не удалось обработать файл");
			return null;
		}
		if (!username) {
			console.error("username не определен");
			return null;
		}

		formData.append("file", file!);

		const usernameStr = Array.isArray(username) ? username[0] : username;
		formData.append("username", usernameStr);

		const res = await fetch("/api/upload", {
			method: "POST",
			body: formData,
		});

		const data = await res.json();
		if (data.error) {
			console.log(`Ошибка загрузки ${type}: ${data.error}`);
			return null;
		}

		return data.publicUrl;
	}

	const addTask = async() => {
		const fileUrl = await uploadFile(file, "file");
		const imageUrl = await uploadFile(image, "image");

		const res = await fetch(`/api/profile/${username}`, {
			method: "POST",
			headers: {"Content-Type": "application/json"},
			body: JSON.stringify({username, title, description, fileUrl, imageUrl}),
		});

		if (!res.ok) {
			console.error("Не удалось добавить задание");
			return;
		}

		setTasks([...tasks, {title, description, fileUrl, imageUrl}]);
		setTitle("");
		setDescription("");
		setImage(null);
		setFile(null);

		setResetTrigger(true);
		setTimeout(() => setResetTrigger(false), 1000);
	};

	const deleteTask = async() => {
		if (!taskToDelete) {
			console.log("taskToDelete undefined");
		}
		await fetch(`/api/profile/${username}`, {
			method: "DELETE",
			headers: {"Content-Type": "application/json"},
			body: JSON.stringify({username, taskToDelete}),
		});

		setTasks(tasks.filter((task) => task.title !== taskToDelete));
		if (tasks) {
			setTaskToDelete(tasks[0].title);
		} else setTaskToDelete("");
	};

	return (
		<div className="centered-container">
			<h1 className="edit-profile-title">Редактирование профиля пользователя {username}</h1>

			<div className="objects-gap">
				<h3>Изменение описания:</h3>
				<textarea className="rounded-box edit-textarea" value={bio} onChange={(e) => setBio(e.target.value)} />
				<button className="rounded-box edit-box-size save-button-edit" onClick={updateBio}>Сохранить</button>
			</div>

			<div className="objects-gap">
				<h3>Добавление нового задания:</h3>
				<input className="rounded-box edit-box-size" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Название задания" />
				<textarea className="rounded-box edit-textarea" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Описание задания" />
				<p>Прикрепите картинку:</p>
				<FileUploader onFileSelect={(image) => setImage(image)} resetTrigger={resetTrigger} />
				<p>Прикрепите файл:</p>
				<FileUploader onFileSelect={(file) => setFile(file)} resetTrigger={resetTrigger} />
				<button className="rounded-box edit-box-size save-button-edit" onClick={addTask}>Добавить задание</button>
			</div>

			<div className="objects-gap">
				<h3>Удаление задания:</h3>
				<div className="select-container edit-box-size">
					<select className="select-edit rounded-box" value={taskToDelete} onChange={(e) => setTaskToDelete(e.target.value)}>
						{tasks.map((task) => (
							<option key={task.title} value={task.title}>
								{task.title}
							</option>
						))}
					</select>
				</div>
				<button className="rounded-box edit-box-size save-button-edit" onClick={deleteTask}>Удалить задание</button>
			</div>
		</div>
	);
}