"use client";

import {useEffect, useState} from "react";
import {useParams, useRouter} from "next/navigation";
import "../../../../../styles/globals.css";
import "../../../../../styles/active_patients.css";

type PatientActivity = {
	patient_username: string;
	activity: string;
	time: string;
}

export default function ShowActivePatients() {
	const router = useRouter();
	
	const {username} = useParams();

	const [patientActivities, setPatientActivities] = useState<PatientActivity[]>([]);

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

				console.log(data.allPatientActivities);

				setPatientActivities(data.allPatientActivities);
			} catch (err) {
				console.error("Ошибка загрузки активных пациентов:", err);
			}
		}
		getActiveUsernames();
	}, [username]);

	const getDetails = async (patient_username: string) => {
		console.log(patient_username);
		router.push(`/profile/${username}/activities/${patient_username}`);
	}

	if (!patientActivities) {
		return (
			<div className="actpat-centered-container actpat-centered-container-width">
				<p>Загрузка пациентов...</p>
			</div>
		);
	}

	return (
		<div className="actpat-centered-container actpat-centered-container-width">
			<h1>Недавняя активность пациентов в Ваших заданиях</h1>
			{patientActivities && patientActivities.length > 0 && (
				<div className="actpat-gap-between-tasks">
					{patientActivities.map((patientActivity, index) => (
						<div key={index} className="actpat-patient-activity">
							<p className="actpat-text">Пациент: {patientActivity.patient_username}</p>
							<p className="actpat-text">Активность: {patientActivity.activity}</p>
							<p className="actpat-text">{patientActivity.time} назад</p>
							<button className="actpat-button actpat-box-size actpat-rounded-box" onClick={() => getDetails(patientActivity.patient_username)}>Подробнее</button>
						</div>
					))}
				</div>
			)}
		</div>
	);
}