"use client";

import {useEffect, useState} from "react";
import {useParams, useRouter} from "next/navigation";
import "../../../../../styles/globals.css";
import "../../../../../styles/active_patients.css";

type Task = {
	task_id: string;
	title: string;
	description: string;
	file_url: string;
	image_url: string;
}

type PatientActivity = {
	username: string;
	lastActivity: string;
}

export default function ShowActivePatients() {
	const {username} = useParams();

	const [patientActivies, setPatientActivies] = useState<PatientActivity[]>([]);

	useEffect(() => {
		const getActiveUsernames = async () => {
			try {
				const response = await fetch(`/api/profile/${username}/get_active_usernames`, {
					method: "POST",
					headers: {"Content-Type": "application/json"},
					body: JSON.stringify({username}),
				});

				const data = await response.json();
				if (!response.ok) {
					console.error("Не удалось получить список активных пациентов");
					return;
				}

				setPatientActivies(data.patientActivies);
			} catch (err) {
				console.error("Ошибка загрузки активных пациентов:", err);
			}
		}
		getActiveUsernames();
	}, [username]);

	const getDetails = async (username: string) => {
		console.log(username);
	}

	if (patientActivies.length === 0) {
		return (
			<div className="actpat-centered-container actpat-centered-container-width">
				<p>Загрузка пациентов...</p>
			</div>
		);
	}

	return (
		<div className="edit-centered-container edit-centered-container-width">
			{patientActivies && patientActivies.length > 0 && (
				<div className="actpat-gap-between-tasks">
					{patientActivies.map((patientActivity, index) => (
						<div key={index} className="actpat-patient-activity">
							<p>{patientActivity.username}</p>
							<p>{patientActivity.lastActivity}</p>
							<button className="actpat-button" onClick={() => handleDownload(patientActivity.username)}>Подробнее</button>
						</div>
					))}
				</div>
			)}
		</div>
	);
}