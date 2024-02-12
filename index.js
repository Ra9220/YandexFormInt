const express = require("express");
const bodyParser = require("body-parser");
const { google } = require("googleapis");
require("dotenv").config();

const app = express();
app.use(bodyParser.json());

// Функция для добавления данных в Google Sheets
async function addFormDataToSheet(formData) {
    try {
        // Создаем аутентификацию
        const auth = new google.auth.GoogleAuth({
            keyFile: "credentials.json", // Указываем путь к файлу с учетными данными
            scopes: "https://www.googleapis.com/auth/spreadsheets", // Указываем требуемые разрешения для доступа к Google Sheets API
        });

        // Получаем клиентский объект для аутентификации
        const client = await auth.getClient();

        // Создаем экземпляр Google Sheets API
        const googleSheets = google.sheets({ version: "v4", auth: client });

        // Идентификатор таблицы Google Sheets
        const spreadsheetId = "1V-bA7G83WiiSVm3l2ZcaGZuQK74DEclLKjhpLkQIUqY";

        // Добавляем данные в Google Sheets
        await googleSheets.spreadsheets.values.append({
            auth,
            spreadsheetId,
            range: "Повестка!A1:G7", // Указываем диапазон, куда будут добавлены данные
            valueInputOption: "USER_ENTERED", // Указываем режим ввода значений
            resource: {
                values: [[
                    formData.Socnetwork,
                    formData.region,
                    formData.url,
                    formData.format,
                    formData.topic,
                    formData.title,
                    formData.date
                ]],
            },
        });

        console.log('Данные успешно добавлены в Google Sheets:', formData); // Логируем успешное добавление данных
    } catch (error) {
        console.error('Ошибка при добавлении данных в Google Sheets:', error); // Выводим ошибку в консоль
        throw error; // Пробрасываем ошибку дальше
    }
}

// Обработчик POST запроса на /submit
app.post('/submit', async (req, res) => {
    try {
        // Выводим содержимое тела запроса в консоль для отладки
        console.log('Тело запроса от Яндекс Формы:', req.body);

        // Извлекаем данные из запроса от YandexForm
        const { socnetwork, region, url, format, topic, title, date } = req.body;

        console.log('Получены данные из запроса от Яндекс Формы:', req.body); // Логируем полученные данные

        // Подготавливаем объект с данными для добавления в Google Sheets
        const formData = {
            Socnetwork: socnetwork,
            region: region,
            url: url,
            format: format,
            topic: topic,
            title: title,
            date: date
        };

        // Добавляем данные в Google Sheets с использованием определенной выше функции
        await addFormDataToSheet(formData);

        // Отправляем успешный ответ клиенту
        res.status(200).send('Данные успешно добавлены в Google Sheets');
    } catch (error) {
        console.error('Не удалось добавить данные в Google Sheets:', error); // Выводим ошибку в консоль
        res.status(500).send('Не удалось добавить данные в Google Sheets'); // Отправляем клиенту ошибку сервера
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Сервер запущен на порту ${PORT}`)); // Запускаем сервер на указанном порту
