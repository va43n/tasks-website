"use client";

import {useEffect, useState} from "react";
import {useParams} from "next/navigation";

import "../../../../styles/globals.css";
import "../../../../styles/patient-files.css";

type User = {
  username: string;
  role: string;
};

type File = {
	title: string;
  fileUrl: string;
};

export default function PatientFiles() {
	const [selfUser, setSelfUser] = useState<User | null>(null);

	const {username} = useParams();
	const [files, setFiles] = useState([]);

	useEffect(() => {
		const fetchUser = async () => {
			const res = await fetch("/api/auth/me");
			if (!res.ok) return setSelfUser(null);
			const data = await res.json();
			setSelfUser(data.user);
		};

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

				setFiles(data.files.files);
			} catch (err) {
				console.error("Ошибка загрузки списка файлов:", err);
			}
		}

		fetchUser();
		getFiles();
	}, [username]);

	const handleDelete = async (fileName: string) => {
		setFiles(files.filter(file => file.fileName !== fileName));

		const response = await fetch(`/api/patient-files/${username}`, {
			method: "DELETE",
			headers: {"Content-Type": "application/json"},
			body: JSON.stringify({username, fileName}),
		});

		if (!response.ok) {
			console.error("Не удалось удалить файл");
			return;
		}
	}

	if (files === [] || !username) return (
		<div className="files-centered-container files-centered-container-width">
			<p>Загрузка списка файлов...</p>
		</div>
	);

	return (
		<div className="files-centered-container files-centered-container-width">
			<h1 className="files-patient-title">Еще не скачанные файлы пациента {username}</h1>

			{files && (
				<div className="files-gap-between-files">
					{files.map((file, index) => (
						<div className="files-file-content" key={index}>
							<p className="files-title files-space-text">{file.fileName}</p>
							<button className="files-delete-button" onClick={() => handleDelete(file.fileName)}>✕</button>
						</div>
					))}
				</div>
			)}
		</div>
	);
}