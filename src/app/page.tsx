"use client";

import { useRouter } from "next/navigation";
import "../../styles/start_page.css";
import Image from "next/image";

export default function HomePage() {
    const router = useRouter();

    return (
        <div className="centered-container-start centered-container-start-width">
            <h1>Сайт для реабилитационного комплекса восстановления ходьбы: &quot;Коврик&quot;</h1>
            <div className="pic-text-container">
                <div>
                    <h1 className="text-title">Можно заниматься не выходя из дома</h1>
                    <p className="text-desc">Все что нужно - немного свободного пространства на полу, подойдет любая комната! Это отличный вариант для начала восстановления - весь реабилитационный центр находится в Вашей комнате!</p>
                </div>
                <Image width={1920} height={200} alt="Картинка меню 1" src="https://asooxovwhivjltdaiozk.supabase.co/storage/v1/object/public/start-page-files//1.jpg" className="landscape-img-size" />
            </div>
            <div className="pic-text-container">
                <Image width={1920} height={200} alt="Картинка меню 2" src="https://asooxovwhivjltdaiozk.supabase.co/storage/v1/object/public/start-page-files//3.jpg" className="landscape-img-size" />
                <div>
                    <h1 className="text-title">Компактная установка</h1>
                    <p className="text-desc">Установка не занимает много места. Она состоит из нескольких основных частей: проектора, миникомпьютера с камерой и штатива. После работы установку можно разобрать, по отдельности установка может поместиться в рюкзаке или сумке.</p>
                </div>
            </div>
            <div className="pic-text-container">
                <div>
                    <h1 className="text-title">Все задания под рукой</h1>
                    <p className="text-desc">На этом сайте можно скачать любое задание от любого зарегистрированного доктора: достаточно зарегистрироваться как пациент, ввести логин доктора и затем скачать любое понравившееся задание. Пользоваться сайтом можно с любого устройства: все скачиваемые задания автоматически скачаются в комплексе.</p>
                </div>
                <Image width={1920} height={200} alt="Картинка меню 3" src="https://asooxovwhivjltdaiozk.supabase.co/storage/v1/object/public/start-page-files//4.2.png" className="landscape-img-size" />
            </div>
        </div>
    );
}
