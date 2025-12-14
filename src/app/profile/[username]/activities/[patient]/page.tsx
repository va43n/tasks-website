"use client";

import {useEffect, useState} from "react";
import {useParams, useRouter} from "next/navigation";
import "../../../../../../styles/globals.css";
import "../../../../../../styles/active_patients.css";
import { CartesianGrid, Line, LineChart, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend, Scatter, ScatterChart, ZAxis, Dot } from 'recharts';


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
    const [movementStats, setMovementStats] = useState<any>([]);

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
                let movement_stats = [];
                let statNumber = 0;
                for (let i = 0; i < data.patientActivities.length; i++) {
                    if (data.patientActivities[i].all_times === null || data.patientActivities[i].all_times === undefined || 
                        data.patientActivities[i].user_points === null || data.patientActivities[i].user_points === undefined ||
                        data.patientActivities[i].figures_for_graph === null || data.patientActivities[i].figures_for_graph === undefined
                    ) {
                        stats.push([]);
                        movement_stats.push([]);
                        continue;
                    }
                    if (data.patientActivities[i].all_times.length === 0 ||
                        data.patientActivities[i].user_points.length === 0 ||
                        data.patientActivities[i].figures_for_graph.length === 0
                    ) {
                        stats.push([]);
                        movement_stats.push([]);
                        continue;
                    }
                    isStats[i] = true;
                    const statArray = [];

                    for (let j = 0; j < data.patientActivities[i].all_times.length; j++) {
                        const str: string = `${j + 1}`;
                        statArray.push({"name": str, "g1": parseFloat(data.patientActivities[i].all_times[j].toFixed(3))});
                    }

                    statNumber++;
                    
                    stats.push(statArray)
                    movement_stats.push([data.patientActivities[i].user_points.map((item: any) => JSON.parse(item)), data.patientActivities[i].figures_for_graph.map((item: any) => JSON.parse(item))])
                }
                setActivitiesWithStatistics(isStats);

                if (statNumber !== 0) {
                    console.log("stats", stats);
                    console.log("movement_stats", movement_stats);
                    setTimeStats(stats);
                    setMovementStats(movement_stats);
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

    const generateEllipseData = (centerX: number, centerY: number, radiusX: number, radiusY: number, rotationDeg = 0, points = 50) => {
        const data = [];
        const rotationRad = rotationDeg * Math.PI / 180;
        
        for (let i = 0; i <= points; i++) {
            const angle = (i / points) * 2 * Math.PI;
            
            const x0 = radiusX * Math.cos(angle);
            const y0 = radiusY * Math.sin(angle);
            
            const xRotated = x0 * Math.cos(rotationRad) - y0 * Math.sin(rotationRad);
            const yRotated = x0 * Math.sin(rotationRad) + y0 * Math.cos(rotationRad);
            
            const x = centerX + xRotated;
            const y = centerY + yRotated;
            
            data.push({ x, y, name: `Ellipse_${centerX}_${centerY}` });
        }
        
        return data;
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
                                        <h1>Время выполнения задания по задачам</h1>
                                        <LineChart style={{ width: '100%', aspectRatio: 1.816, maxWidth: 800, margin: 'auto' }} data={timeStats[index]}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" label={{ value: 'Номер задачи',  offset: 0 }} />
                                            <YAxis label={{ value: 'Время', angle: -90, position: 'insideLeft' }} />
                                            <Tooltip />
                                            <Line type="monotone" dataKey="g1" stroke="#8884d8" strokeWidth={4} name="Текущий результат"/>
                                        </LineChart>
                                        { movementStats[index].length !== 0 && 
                                        <div>
                                            <h1>Траектория движения</h1>
                                            <ScatterChart style={{ width: '100%', aspectRatio: 1.816, maxWidth: 800, margin: 'auto' }}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis type="number" dataKey="x" name="X" />
                                                <YAxis type="number" dataKey="y" name="Y" />
                                                <Scatter 
                                                    data={[{"x": 0, "y": 0}, {"x": 1920, "y": 1080}]} 
                                                    fill="none"
                                                />
                                                <Scatter
                                                    data={movementStats[index][0]} 
                                                    fill="#FF0000"
                                                    line 
                                                    shape={<Dot r={2} />}
                                                    strokeWidth={4}
                                                />
                                                {movementStats[index][1].map((key: any, index: number) => (
                                                    <Scatter 
                                                        key={index} 
                                                        data={generateEllipseData(key["cx"], key["cy"], key["rx"], key["ry"], key["angle"])} 
                                                        fill="#8884d8"
                                                        line 
                                                        shape={<Dot r={2} />}
                                                        strokeWidth={4}
                                                    />
                                                ))}
                                            </ScatterChart>
                                        </div>
                                        }
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