import {NextRequest, NextResponse} from "next/server";
import supabase from "../../../../../../lib/supabase";
import {isLoginValid} from "../../../../../../lib/jwt";


export async function POST(req: NextRequest) {
	try {
		const { username } = await req.json();

		// Проверка токена поользователя
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

		// Поиск всех пациентов, которые проявляли активность в любом задании доктора
		const {data: allPatientActivities, error: allPatientActivitiesError} = await supabase
			.from("patient_activities")
			.select("patient_username, time, activity")
			.in("task_id", all_id_array)
			.order('time', { ascending: false });

		if (allPatientActivitiesError) {
			return NextResponse.json({error: "Не удалось найти имена пользователей, которые недавно совершали активность с Вашими заданиями"}, {status: 500});
		}

		// Выделение только последней активности каждого пациента
		let distinctPatientActivities = [];
		let alreadyUsedPatients = [];

		for (let patientActivity of allPatientActivities) {
			let continueFlag = false;
			for (let usedPatient of alreadyUsedPatients) {
				if (usedPatient === patientActivity.patient_username) {
					continueFlag = true;
					break;
				}
			}
			if (continueFlag) continue;

			alreadyUsedPatients.push(patientActivity.patient_username);
			distinctPatientActivities.push(patientActivity);
		}

		// Оформление времени последней активности в удобном, читаемом виде
		const currentTime = Date.now();
		for (let i = 0; i < distinctPatientActivities.length; i++) {
			let activityTime = "";

			const diffTime = currentTime - distinctPatientActivities[i].time;
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

			distinctPatientActivities[i].time = activityTime;
		}

		console.log(allPatientActivities, distinctPatientActivities);

		return NextResponse.json({"allPatientActivities": distinctPatientActivities}, {status: 200});
	} catch (err) {
		return NextResponse.json({error: "Профиль доктора не найден"}, {status: 500});
	}
}