"use client";

import {useEffect, useState} from "react";
import {useParams, useRouter} from "next/navigation";
import "../../../../../../styles/globals.css";
import "../../../../../../styles/active_patients.css";

type PatientActivity = {
    patient_username: string;
    activity: string;
    time: string;
    title: string;
}

export default function ShowAllPatientActivity() {
    const router = useRouter();
    
    const {username, patient} = useParams();
    console.log(username, patient);

    const [patientActivities, setPatientActivities] = useState<PatientActivity[]>([]);

    useEffect(() => {
        const getActiveUsernames = async () => {
            try {
                const response = await fetch(`/api/profile/${username}/get_all_patient_activity`, {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({username, patient}),
                });

                const data = await response.json();
                if (!response.ok) {
                    console.error("Не удалось получить активность пациента");
                    return;
                }

                console.log(data.patientActivities);

                setPatientActivities(data.patientActivities);
            } catch (err) {
                console.error("Ошибка загрузки активности пациента:", err);
            }
        }
        getActiveUsernames();
    }, [username]);

    const getDetails = async (username: string) => {
        console.log(username);
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
            <div className="actpat-patient-activity">
                <h1 className="actpat-text">Активность пациента {patient} в Ваших заданиях</h1>
                <button className="actpat-button actpat-box-size actpat-rounded-box" onClick={() => {
                    router.push(`/profile/${username}/activities`);
                }}>Назад</button>
            </div>
            {patientActivities && patientActivities.length > 0 && (
                <div className="actpat-gap-between-tasks">
                    {patientActivities.map((patientActivity, index) => (
                        <div key={index} className="actpat-patient-activity">
                            <p className="actpat-text">Задание: {patientActivity.tasks.title}</p>
                            <p className="actpat-text">Активность: {patientActivity.activity}</p>
                            <p className="actpat-text">{patientActivity.time} назад</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}