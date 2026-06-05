"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import "../../../../../../styles/globals.css";
import "../../../../../../styles/active_patients.css";
import {
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Scatter,
  ScatterChart,
  Dot,
} from "recharts";
import { JSONValue } from "next/dist/server/config-shared";

type TaskInfo = {
  title: string;
};

type PatientActivity = {
  patient_username: string;
  activity: string;
  time: string;
  tasks: TaskInfo;
  all_times: string[];
  task_id: string;
  user_points: JSONValue[];
  figures_for_graph: JSONValue[];
};

type TimeStatItem = {
  name: string;
  current: number;
  average?: number | null;
};

type GlobalTaskStat = {
  task_id: string;
  title: string;
  count: number;
  timesData: number[][];
  movementData: { x: number; y: number }[][];
  figures: any[];
  avgTimes: TimeStatItem[];
  avgMovement: { x: number; y: number }[];
};

export default function ShowAllPatientActivity() {
  const router = useRouter();
  const { username, patient } = useParams();

  const [patientActivities, setPatientActivities] = useState<PatientActivity[]>([]);
  const [activitiesWithStatistics, setActivitiesWithStatistics] = useState<boolean[]>([]);
  const [openedStatistics, setOpenedStatistics] = useState<boolean[]>([]);
  const [openedMainStatistic, setOpenedMainStatistic] = useState(false);
  const [timeStats, setTimeStats] = useState<TimeStatItem[][]>([]);
  const [movementStats, setMovementStats] = useState<any>([]);
  const [globalTaskStats, setGlobalTaskStats] = useState<GlobalTaskStat[]>([]);
  const [globalStatMap, setGlobalStatMap] = useState<Record<string, GlobalTaskStat>>({});

  useEffect(() => {
    const getActiveUsernames = async () => {
      try {
        const response = await fetch(
          `/api/profile/${username}/get_all_patient_activity`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, patient }),
          }
        );
        const data = await response.json();
        if (!response.ok) {
          console.error("Не удалось получить активность пациента");
          return;
        }

        const isStats: boolean[] = [];
        const stats: TimeStatItem[][] = [];
        const movement_stats: any[] = [];
        let statNumber = 0;

        const rawActivities: PatientActivity[] = data.patientActivities;

        for (let i = 0; i < rawActivities.length; i++) {
          const act = rawActivities[i];
          if (
            !act.all_times ||
            !act.user_points ||
            !act.figures_for_graph ||
            act.all_times.length === 0 ||
            act.user_points.length === 0 ||
            act.figures_for_graph.length === 0
          ) {
            isStats.push(false);
            stats.push([]);
            movement_stats.push([]);
            continue;
          }
          isStats.push(true);
          const statArray: TimeStatItem[] = [];
          for (let j = 0; j < act.all_times.length; j++) {
            statArray.push({
              name: `${j + 1}`,
              current: parseFloat(parseFloat(act.all_times[j]).toFixed(3)),
            });
          }
          statNumber++;
          stats.push(statArray);
          movement_stats.push([
            act.user_points.map((item: any) => JSON.parse(item)),
            act.figures_for_graph.map((item: any) => JSON.parse(item)),
          ]);
        }

        setActivitiesWithStatistics(isStats);
        if (statNumber !== 0) {
          setTimeStats(stats);
          setMovementStats(movement_stats);
        }
        setPatientActivities(rawActivities);
        setOpenedStatistics(Array(rawActivities.length).fill(false));

        const grouped: Record<string, GlobalTaskStat> = {};
        rawActivities.forEach((act, idx) => {
          if (!isStats[idx]) return;
          const tid = act.task_id;
          if (!grouped[tid]) {
            grouped[tid] = {
              task_id: tid,
              title: act.tasks?.title || "",
              count: 0,
              timesData: [],
              movementData: [],
              figures: movement_stats[idx]?.[1] || [],
              avgTimes: [],
              avgMovement: [],
            };
          }
          grouped[tid].count++;
          grouped[tid].timesData.push(
            act.all_times.map((t) => parseFloat(t))
          );
          if (movement_stats[idx]?.[0]) {
            grouped[tid].movementData.push(movement_stats[idx][0]);
          }
        });

        const globalArray = Object.values(grouped).map((g) => {
          const timesData = g.timesData;
          const movementData = g.movementData;
          const taskCount = g.count;

          const avgTimes: TimeStatItem[] = [];
          if (timesData.length > 0) {
            const minLen = Math.min(...timesData.map((t) => t.length));
            for (let i = 0; i < minLen; i++) {
              const sum = timesData.reduce((acc, cur) => acc + (cur[i] || 0), 0);
              avgTimes.push({
                name: `${i + 1}`,
                current: parseFloat((sum / taskCount).toFixed(3)),
              });
            }
          }

          const avgMovement: { x: number; y: number }[] = [];
          if (movementData.length > 0) {
            const minLen = Math.min(...movementData.map((m) => m.length));
            for (let i = 0; i < minLen; i++) {
              const sumX = movementData.reduce((acc, cur) => acc + (cur[i]?.x || 0), 0);
              const sumY = movementData.reduce((acc, cur) => acc + (cur[i]?.y || 0), 0);
              avgMovement.push({
                x: parseFloat((sumX / taskCount).toFixed(2)),
                y: parseFloat((sumY / taskCount).toFixed(2)),
              });
            }
          }

          return {
            ...g,
            avgTimes,
            avgMovement,
          };
        });

        setGlobalTaskStats(globalArray);
        const map: Record<string, GlobalTaskStat> = {};
        globalArray.forEach((stat) => {
          map[stat.task_id] = stat;
        });
        setGlobalStatMap(map);
      } catch (err) {
        console.error("Ошибка загрузки активности пациента:", err);
      }
    };
    getActiveUsernames();
  }, [username, patient]);

  const generateColor = (
    index: number,
    total: number,
    saturation = 50,
    lightness = 55,
    alpha = 1
  ) =>
    `hsla(${((index * 285) / total + 200) % 360}, ${saturation}%, ${lightness}%, ${alpha})`;

  const generateEllipseData = (
    centerX: number,
    centerY: number,
    radiusX: number,
    radiusY: number,
    rotationDeg = 0,
    points = 50
  ) => {
    const data: { x: number; y: number; name: string }[] = [];
    const rotationRad = (rotationDeg * Math.PI) / 180;
    for (let i = 0; i <= points; i++) {
      const angle = (i / points) * 2 * Math.PI;
      const x0 = radiusX * Math.cos(angle);
      const y0 = radiusY * Math.sin(angle);
      const xRotated = x0 * Math.cos(rotationRad) - y0 * Math.sin(rotationRad);
      const yRotated = x0 * Math.sin(rotationRad) + y0 * Math.cos(rotationRad);
      data.push({
        x: centerX + xRotated,
        y: centerY + yRotated,
        name: `Ellipse_${centerX}_${centerY}`,
      });
    }
    return data;
  };

  const changeVisibility = (index: number) => {
    setOpenedStatistics((prev) =>
      prev.map((val, i) => (i === index ? !val : val))
    );
  };

  if (!patientActivities) {
    return (
      <div className="actpat-centered-container actpat-centered-container-width">
        <p>Загрузка пациентов...</p>
      </div>
    );
  }

  return (
    <div className="actpat-centered-container actpat-centered-container-width">
      <div className="actpat-container-for-statistic actpat-patient-activity">
        <h1 className="actpat-text">
          Активность пациента {patient} в Ваших заданиях
        </h1>
        <button
          className="actpat-button actpat-box-size actpat-rounded-box"
          onClick={() => router.push(`/profile/${username}/activities`)}
        >
          Назад
        </button>
      </div>

      {globalTaskStats.length > 0 && (
        <div className="actpat-container-for-statistic">
          <button
            className="actpat-button global-stat-button actpat-box-size actpat-rounded-box"
            onClick={() => setOpenedMainStatistic((prev) => !prev)}
          >Глобальная статистика</button>
        
          {openedMainStatistic && globalTaskStats.length > 0 && (
            <div className="actpat-gap-between-tasks global-stat-box-offset">
            {globalTaskStats.map((stat) => (
                <div className="actpat-container-for-statistic"
                key={stat.task_id}
                >
                <h2>{stat.title}</h2>
                <p>Количество выполнений: {stat.count}</p>

                <h3>Сравнение времени выполнения по задачам</h3>
                <LineChart
                    width={800}
                    height={400}
                    style={{ margin: "auto" }}
                    margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                    type="category"
                    dataKey="name"
                    allowDuplicatedCategory={false}
                    label={{ value: "Номер задачи", offset: 0 }}
                    />
                    <YAxis
                    label={{
                        value: "Время",
                        angle: -90,
                        position: "insideLeft",
                    }}
                    />
                    <Tooltip />
                    <Legend />
                    {stat.timesData.map((times, idx) => {
                    const lineData = times.map((val, i) => ({
                        name: `${i + 1}`,
                        value: val,
                    }));
                    return (
                        <Line
                        key={idx}
                        data={lineData}
                        type="monotone"
                        dataKey="value"
                        stroke={generateColor(idx, stat.count, 60, 50)}
                        strokeWidth={2}
                        dot={false}
                        legendType="none"
                        name={"" + (idx + 1)}
                        />
                    );
                    })}
                    <Line
                    data={stat.avgTimes.map(item => ({ name: item.name, value: item.current }))}
                    type="monotone"
                    dataKey="value"
                    stroke="#FF0000"
                    strokeWidth={4}
                    name="Среднее"
                    dot={false}
                    />
                </LineChart>

                <h3>Траектории движения</h3>
                <ScatterChart
                    width={800}
                    height={400}
                    style={{ margin: "auto" }}
                    margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" dataKey="x" name="X" />
                    <YAxis type="number" dataKey="y" name="Y" />
                    <Scatter
                    data={[
                        { x: 0, y: 0 },
                        { x: 1920, y: 1080 },
                    ]}
                    fill="none"
                    />
                    {stat.figures.map((fig: any, idx: number) => (
                    <Scatter
                        key={`fig-${idx}`}
                        data={generateEllipseData(
                        fig.cx,
                        fig.cy,
                        fig.rx,
                        fig.ry,
                        fig.angle
                        )}
                        fill="#8884d8"
                        line
                        shape={<Dot r={2} />}
                        strokeWidth={4}
                        legendType="none"
                        name=""
                    />
                    ))}
                    {stat.movementData.map((points, idx) => (
                    <Scatter
                        key={idx}
                        data={points}
                        fill={generateColor(idx, stat.count, 80, 60, 0.8)}
                        line
                        shape={<Dot r={2} />}
                        strokeWidth={2}
                        legendType="none"
                        name=""
                    />
                    ))}
                    <Scatter
                    data={stat.avgMovement}
                    fill="#FF0000"
                    line
                    shape={<Dot r={4} />}
                    strokeWidth={4}
                    name="Средняя траектория"
                    />
                </ScatterChart>
                </div>
            ))}
            </div>
        )}
        </div>
      )}

      {patientActivities.length > 0 && (
        <div>
          <div className="actpat-gap-between-tasks">
            {patientActivities.map((patientActivity, index) => {
              const currentTaskGlobal = globalStatMap[patientActivity.task_id];
              const currentTimeStat = timeStats[index] || [];
              const avgTimes = currentTaskGlobal?.avgTimes || [];

              const combinedTimeData = currentTimeStat.map((item, i) => ({
                name: item.name,
                current: item.current,
                average: avgTimes[i]?.current ?? null,
              }));

              return (
                <div className="actpat-border actpat-container-for-statistic" key={index}>
                  <div className="actpat-patient-activity">
                    <p className="actpat-text">
                      Задание: {patientActivity.tasks.title}
                    </p>
                    <p className="actpat-text">
                      Активность: {patientActivity.activity}
                    </p>
                    <p className="actpat-text">{patientActivity.time} назад</p>
                    {activitiesWithStatistics[index] && (
                      <button
                        className="actpat-button actpat-box-size actpat-rounded-box"
                        onClick={() => changeVisibility(index)}
                      >
                        Статистика
                      </button>
                    )}
                  </div>
                  {openedStatistics[index] && activitiesWithStatistics[index] && (
                    <div className="actpat-stat">
                      <h1>Время выполнения задания по задачам</h1>
                      <LineChart
                        width={800}
                        height={400}
                        data={combinedTimeData}
                        style={{ margin: "auto" }}
                        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="name"
                          label={{ value: "Номер задачи", offset: 0 }}
                        />
                        <YAxis
                          label={{
                            value: "Время",
                            angle: -90,
                            position: "insideLeft",
                          }}
                        />
                        <Tooltip />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="average"
                          stroke="#FF0000"
                          strokeWidth={3}
                          name="Среднее"
                          dot={false}
                          connectNulls={false}
                        />
                        <Line
                          type="monotone"
                          dataKey="current"
                          stroke="#8884d8"
                          strokeWidth={4}
                          name="Текущий результат"
                          dot={false}
                        />
                      </LineChart>
                      {movementStats[index]?.length !== 0 && (
                        <div>
                          <h1>Траектория движения</h1>
                          <ScatterChart
                            width={800}
                            height={400}
                            style={{ margin: "auto" }}
                            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" dataKey="x" name="X" />
                            <YAxis type="number" dataKey="y" name="Y" />
                            <Scatter
                              data={[
                                { x: 0, y: 0 },
                                { x: 1920, y: 1080 },
                              ]}
                              fill="none"
                            />
                            {movementStats[index][1]?.map(
                              (fig: any, idx: number) => (
                                <Scatter
                                  key={idx}
                                  data={generateEllipseData(
                                    fig.cx,
                                    fig.cy,
                                    fig.rx,
                                    fig.ry,
                                    fig.angle
                                  )}
                                  fill="#8884d8"
                                  line
                                  shape={<Dot r={2} />}
                                  strokeWidth={4}
                                  legendType="none"
                                  name=""
                                />
                              )
                            )}
                            {currentTaskGlobal &&
                              currentTaskGlobal.avgMovement.length > 0 && (
                                <Scatter
                                  data={currentTaskGlobal.avgMovement}
                                  fill="#FF0000"
                                  line
                                  shape={<Dot r={4} />}
                                  strokeWidth={4}
                                  name="Средняя траектория"
                                />
                              )}
                            <Scatter
                              data={movementStats[index][0]}
                              fill="#00FF00"
                              line
                              shape={<Dot r={2} />}
                              strokeWidth={3}
                              name="Текущая траектория"
                            />
                          </ScatterChart>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}