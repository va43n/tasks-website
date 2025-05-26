"use client";

import {useEffect, useState} from "react";
import {useParams} from "next/navigation";
import Image from "next/image";

import "../../../../styles/globals.css";
import "../../../../styles/patient-files.css";

type User = {
  username: string;
  role: string;
};

type File = {
	task_id: string
	title: string;
 	file_url: string;
};

export default function PatientFiles() {
	const [selfUser, setSelfUser] = useState<User | null>(null);

	const {username} = useParams();
	const [files, setFiles] = useState<File[]>([]);

	// Выполнение действия при запуске страницы
	useEffect(() => {
		const fetchUser = async () => {
			const res = await fetch("/api/auth/me");
			if (!res.ok) return setSelfUser(null);
			const data = await res.json();
			setSelfUser(data.user);
		};

		// Получение данных об очереди заданий 
		const getFiles = async () => {
			try {
				const response = await fetch(`/api/patient-files/${username}`, {
					method: "POST",
					headers: {"Content-Type": "application/json"},
					body: JSON.stringify({username}),
				});

				const data = await response.json();
				if (!response.ok) {
					console.error("Не удалось получить список файлов");
					return;
				}

				console.log(data.files);

				setFiles(data.files);
			} catch (err) {
				console.error("Ошибка загрузки списка файлов:", err);
			}
		}

		fetchUser();
		getFiles();
	}, [username]);

	// Обработка нажатия на крестик - удаления задания из очереди
	const handleDelete = async (task_id: string) => {
		setFiles(files.filter(file => file.task_id !== task_id));

		const response = await fetch(`/api/patient-files/${username}`, {
			method: "DELETE",
			headers: {"Content-Type": "application/json"},
			body: JSON.stringify({username, task_id}),
		});

		if (!response.ok) {
			console.error("Не удалось удалить файл");
			return;
		}
	}

	if (!files || !username) return (
		<div className="files-centered-container files-centered-container-width">
			<p>Загрузка списка файлов...</p>
		</div>
	);

	return (
		<div className="files-centered-container files-centered-container-width">
			<h1 className="files-patient-title">Еще не скачанные файлы пациента {username}</h1>

			{files && files.length > 0 && (
				<div className="files-gap-between-files">
					{files.map((file, index) => (
						<div className="files-file-content" key={index}>
							<p className="files-title files-space-text">{file.title}</p>
							<button className="files-delete-button" onClick={() => handleDelete(file.task_id)}>
								<Image alt="Удалить задание" src="/icons/cross.svg" width={16} height={16} />
							</button>
						</div>
					))}
				</div>
			)}
		</div>
	);
}