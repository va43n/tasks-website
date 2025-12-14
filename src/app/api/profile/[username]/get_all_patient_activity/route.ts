import {NextRequest, NextResponse} from "next/server";
import supabase from "../../../../../../lib/supabase";
import {isLoginValid} from "../../../../../../lib/jwt";


export async function POST(req: NextRequest) {
	try {
		const { username, patient } = await req.json();

		// Проверка токена пользователя
		const token = req.cookies.get("token")?.value;
		if (!token) {
			return NextResponse.json({error: "Пользователь не залогинен"}, {status: 400});
		}
		if (!isLoginValid(username, token)) {
			return NextResponse.json({error: "Недостаточно прав"}, {status: 400});
		}

		// Поиск заданий доктора
		const {data: all_id, error: all_id_error} = await supabase
			.from("tasks")
			.select("task_id")
			.eq("doctor_username", username);

		if (all_id_error) {
			return NextResponse.json({error: "id заданий доктора не найдены"}, {status: 500});
		}

		let all_id_array = [];
		for (var id of all_id) {
			all_id_array.push(id.task_id);
		}

		// Получение всех активностей пациентов по любым заданиям доктора
		const {data: allPatientActivities, error: allPatientActivitiesError} = await supabase
			.from("patient_activities")
			.select("task_id, patient_username, time, activity, tasks (title), all_times, user_points, figures_for_graph")
			.in("task_id", all_id_array)
			.order('time', { ascending: false });

		if (allPatientActivitiesError) {
			return NextResponse.json({error: "Не удалось найти имена пользователей, которые недавно совершали активность с Вашими заданиями"}, {status: 500});
		}

		// Получение активности только одного пациента
		let certainPatientActivities = [];

		for (let patientActivity of allPatientActivities) {
				if (patient !== patientActivity.patient_username) continue;
			certainPatientActivities.push(patientActivity);
		}

		// Оформление времени активностей в удобном, читаемом виде
		const currentTime = Date.now();
		for (let i = 0; i < certainPatientActivities.length; i++) {
			let activityTime = "";

			const diffTime = currentTime - certainPatientActivities[i].time;
			let seconds = Math.round(diffTime / 1000);
			let minutes = Math.floor(seconds / 60);
			let hours = Math.floor(minutes / 60);
			let days = Math.floor(hours / 24);

			seconds -= minutes * 60;
			minutes -= hours * 60;
			hours -= days * 24;

			activityTime += days === 0 ? "" : `${days} д. `;
			activityTime += hours === 0 ? "" : `${hours} ч. `
			activityTime += minutes === 0 ? "" : `${minutes} мин. `
			activityTime += seconds === 0 ? "" : `${seconds} сек. `

			certainPatientActivities[i].time = activityTime;
		}

		console.log(certainPatientActivities);

		return NextResponse.json({"patientActivities": certainPatientActivities}, {status: 200});
	} catch (err) {
		return NextResponse.json({error: "Профиль доктора не найден"}, {status: 500});
	}
}