"use client";

import {useEffect, useState} from "react";
import {useParams, useRouter} from "next/navigation";
import "../../../../../../styles/globals.css";
import "../../../../../../styles/active_patients.css";
import { CartesianGrid, Line, Text, LineChart, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts';


type TaskInfo = {
    title: string;
}

type PatientActivity = {
    patient_username: string;
    activity: string;
    time: string;
    tasks: TaskInfo;
    all_times: string[];
}

type TimeStatItem = {
    name: string;
    g1: number;
};


export default function ShowAllPatientActivity() {
    const router = useRouter();

    const {username, patient} = useParams();

    const [patientActivities, setPatientActivities] = useState<PatientActivity[]>([]);
    const [activitiesWithStatistics, setActivitiesWithStatistics] = useState<PatientActivity[]>([]);

    const [openedStatistics, setOpenedStatistics] = useState<boolean[]>([]);
    const [openedMainStatistic, setOpenedMainStatistic] = useState<boolean>(false);

    const [timeStats, setTimeStats] = useState<TimeStatItem[][]>([]);

    // Выполнение действия при загрузке страницы
    useEffect(() => {
        // Получение всех активностей одного конкретного пациента
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

                console.log("data.patientActivities", data.patientActivities);

                const isStats = Array(data.patientActivities.length).fill(false);
                let stats = [];
                let statNumber = 0;
                for (let i = 0; i < data.patientActivities.length; i++) {
                    if (!(data.patientActivities[i].all_times !== undefined && data.patientActivities[i].all_times.length !== 0)) {
                        stats.push([])
                        continue;
                    }
                    isStats[i] = true;
                    const statArray = [];

                    for (let j = 0; j < data.patientActivities[i].all_times.length; j++) {
                        const str: string = `${j + 1}`;
                        const graph_name: string = `g${statNumber + 1}`;
                        statArray.push({"name": str, "g1": parseFloat(data.patientActivities[statNumber].all_times[j].toFixed(3))});
                    }

                    statNumber++;
                    
                    stats.push(statArray)
                }
                setActivitiesWithStatistics(isStats);

                if (statNumber !== 0) {
                    console.log("stats", stats);
                    setTimeStats(stats);
                }

                setPatientActivities(data.patientActivities);
                setOpenedStatistics(Array(data.patientActivities.length).fill(false))
            } catch (err) {
                console.error("Ошибка загрузки активности пациента:", err);
            }
        }
        getActiveUsernames();
    }, [username, patient]);

    const generateColor = (index: number, total: number, saturation = 50, lightness = 55, alpha = 1) => {
        return `hsla(${(index * 285 / (total) + 200) % 360}, ${saturation}%, ${lightness}%, ${alpha})`;
    };

    const changeVisibility = async (index: number) => {
        setOpenedStatistics(openedStatistics.map((val, i) => i === index ? !val : val));
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
                <div>
                    <div className="actpat-gap-between-tasks">
                        {patientActivities.map((patientActivity, index) => (
                            <div className="actpat-border" key={index}>
                                <div className="actpat-patient-activity">
                                    <p className="actpat-text">Задание: {patientActivity.tasks.title}</p>
                                    <p className="actpat-text">Активность: {patientActivity.activity}</p>
                                    <p className="actpat-text">{patientActivity.time} назад</p>
                                    {activitiesWithStatistics[index] &&
                                        <button className="actpat-button actpat-box-size actpat-rounded-box" onClick={() => {
                                            changeVisibility(index);
                                        }}>Статистика</button>
                                    }
                                </div>
                                {openedStatistics[index] && activitiesWithStatistics[index] &&
                                    <div className="actpat-stat">
                                        <LineChart style={{ width: '100%', aspectRatio: 1.816, maxWidth: 800, margin: 'auto' }} data={timeStats[index]}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" label={{ value: 'Номер задачи',  offset: 0 }} />
                                            <YAxis label={{ value: 'Время', angle: -90, position: 'insideLeft' }} />
                                            <Tooltip />
                                            <Legend />
                                            <Line type="monotone" dataKey="g1" stroke="#8884d8" strokeWidth={4} name="Текущий результат"/>
                                        </LineChart>
                                    </div>
                                }
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}