"use client";

import {useEffect, useState} from "react";
import {useParams, useRouter} from "next/navigation";
import FileUploader from "../../../components/fileUploader";
import "../../../../../styles/globals.css";
import "../../../../../styles/profile_edit.css";

type Task = {
	task_id: string;
	title: string;
	description: string;
	file_url: string;
	image_url: string;
}

export default function EditProfile() {
	const {username} = useParams();

	const [tasks, setTasks] = useState<Task[]>([]);
	
	const [bio, setBio] = useState("");
	const [bioMessage, setBioMessage] = useState<string>("");

	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [file, setFile] = useState<File | null>(null)
	const [image, setImage] = useState<File | null>(null);
	const [addTaskMessage, setAddTaskMessage] = useState<string>("");

	const [taskToDelete, setTaskToDelete] = useState("");
	const [deleteTaskMessage, setDeleteTaskMessage] = useState<string>("");

	const [resetTrigger, setResetTrigger] = useState(false);

	useEffect(() => {
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

				setBio(data.profile.bio || "");
				setTasks(data.profile.tasks || []);
				if (tasks) {
					console.log(tasks);
				} else setTaskToDelete("");
			} catch (err) {
				console.error("Ошибка загрузки профиля:", err);
			}
		}
		getProfile();
	}, [username]);

	// Обновление описания профиля
	const updateBio = async() => {
		setBioMessage("");
		const response = await fetch(`/api/profile/${username}`, {
			method: "PUT",
			headers: {"Content-Type": "application/json"},
			body: JSON.stringify({username, bio}),
		});

		const data = await response.json();
		console.log(data);

		if (!response.ok) {
			setBioMessage(data.error);
			return;
		}
		setBioMessage(data.message);
	};

	// Загрузка файла в облачное хранилище
	const uploadFile = async (file: File | null, type: "file" | "image") => {
		console.log(username, file);

		const formData = new FormData();

		if (file === null) {
			console.log(`file null`);
			return null;
		}
		if (!username) {
			console.log(`username null`);
			return null;
		}

		formData.append("file", file!);

		const usernameStr = Array.isArray(username) ? username[0] : username;
		formData.append("username", usernameStr);

		const res = await fetch(`/api/profile/${username}/upload`, {
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

	// Добавление задания
	const addTask = async() => {
		setAddTaskMessage("");

		const file_url = await uploadFile(file, "file");
		const image_url = await uploadFile(image, "image");

		const res = await fetch(`/api/profile/${username}`, {
			method: "POST",
			headers: {"Content-Type": "application/json"},
			body: JSON.stringify({username, title, description, file_url, image_url}),
		});

		const data = await res.json();
		if (!res.ok) {
			setAddTaskMessage(data.error);
			return;
		}
		setAddTaskMessage(data.message);

		const new_task_id = data.task_id;

		setTasks([...tasks, {task_id: new_task_id, title: title, description: description, file_url: file_url, image_url: image_url}]);
		setTitle("");
		setDescription("");
		setImage(null);
		setFile(null);

		setResetTrigger(true);
		setTimeout(() => setResetTrigger(false), 1000);
	};

	// Удаление задания
	const deleteTask = async() => {
		setDeleteTaskMessage("");

		console.log(`taskToDelete ${taskToDelete}`); 

		const deleteTaskId = taskToDelete ? taskToDelete : tasks[0].task_id;

		if (tasks.length === 0) {
			setDeleteTaskMessage("Заданий нет");
			return;
		}

		const res = await fetch(`/api/profile/${username}`, {
			method: "DELETE",
			headers: {"Content-Type": "application/json"},
			body: JSON.stringify({username, task_id: deleteTaskId}),
		});

		const data = await res.json();
		if (!res.ok) {
			setDeleteTaskMessage(data.error);
			return;
		}
		setDeleteTaskMessage(data.message);

		setTasks(tasks.filter((task) => task.task_id !== deleteTaskId));
		if (tasks) {
			setTaskToDelete(tasks[0].task_id);
		} else setTaskToDelete("");
	};

	return (
		<div className="edit-centered-container edit-centered-container-width">
			<h1 className="edit-profile-title">Редактирование профиля пользователя {username}</h1>

			<div className="edit-objects-gap">
				<h3>Изменение описания:</h3>
				<textarea className="edit-rounded-box edit-textarea" value={bio} onChange={(e) => setBio(e.target.value)} />
				{bioMessage !== "" && <p>{bioMessage}</p>}
				<button className="edit-rounded-box edit-box-size edit-save-button-edit" onClick={updateBio}>Сохранить</button>
			</div>

			<div className="edit-objects-gap">
				<h3>Добавление нового задания:</h3>
				<input className="edit-rounded-box edit-box-size" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Название задания" />
				<textarea className="edit-rounded-box edit-textarea" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Описание задания" />
				<p>Прикрепите картинку:</p>
				<FileUploader onFileSelect={(image) => setImage(image)} resetTrigger={resetTrigger} />
				<p>Прикрепите файл:</p>
				<FileUploader onFileSelect={(file) => setFile(file)} resetTrigger={resetTrigger} />
				{addTaskMessage !== "" && <p>{addTaskMessage}</p>}
				<button className="edit-rounded-box edit-box-size edit-save-button-edit" onClick={addTask}>Добавить задание</button>
			</div>

			<div className="edit-objects-gap">
				<h3>Удаление задания:</h3>
				<div className="edit-select-container edit-box-size">
					<select className="edit-select-edit edit-rounded-box" value={taskToDelete} onChange={(e) => setTaskToDelete(e.target.value)}>
						{tasks.map((task) => (
							<option key={task.task_id} value={task.task_id}>
								{task.title}
							</option>
						))}
					</select>
				</div>
				{deleteTaskMessage !== "" && <p>{deleteTaskMessage}</p>}
				<button className="edit-rounded-box edit-box-size edit-save-button-edit" onClick={deleteTask}>Удалить задание</button>
			</div>
		</div>
	);
}