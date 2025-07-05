## Сайт с заданиями
Веб-приложение, позволяющее пациентам самостоятельно загружать задания для [комплекса](https://github.com/va43n/carpet), а докторам - добавлять задания и отслеживать активность пациентов в добавленных заданиях.  
![image](https://github.com/user-attachments/assets/f2fd110b-cb79-4379-b72b-3654bd0d50c5)  
![image](https://github.com/user-attachments/assets/7b9288dd-6848-4c35-8f04-b51c65c06c84)
![image](https://github.com/user-attachments/assets/4a4b2d1f-5ff9-4df4-bbca-891d81d581b5)
## Начало работы
Веб-приложение доступно [по ссылке](https://tasks-website.vercel.app/).  
Также можно развернуть локальный сервер:
```bash
# Клонирование репозитория
git clone https://github.com/va43n/tasks-website.git
cd tasks-website
# Запуск локального сервера
npm run dev
# или
yarn dev
# или
pnpm dev
# или
bun dev
```
Результат можно будет увидеть по ссылке [http://localhost:3000](http://localhost:3000).
## Основные функции
- Аутентификация пользователей;
- Изменение профиля доктора (добавление и удаление заданий);
- Просмотр активности пациентов, занимающихся по заданиям конкретного доктора;
- Скачивание заданий;
- Просмотр скачанных заданий.
## Стек технологий
**Backend, Frontend** Next.js, React, Typescript;  
**БД**: Supabase (PostgreSQL);  
**Deploy**: Vercel.
