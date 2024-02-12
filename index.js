const express = require('express');
const bodyParser = require('body-parser');
const { GoogleSpreadsheet } = require('google-spreadsheet');
require('dotenv').config();

// Инициализация Express приложения
const app = express();
app.use(bodyParser.json());

// Инициализация документа Google Sheets
const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID);

(async () => {
    // Аутентификация с использованием учетных данных сервисного аккаунта
    await doc.useServiceAccountAuth({
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: JSON.parse(`"${process.env.GOOGLE_PRIVATE_KEY}"`),
    });

    await doc.loadInfo(); // Загрузка информации о таблице
    console.log(doc.title); // Вывод названия документа для проверки

    // Обработчик для маршрута POST
    app.post('/submit', async (req, res) => {
        try {
            const sheet = doc.sheetsByIndex[0]; // Выбор первого листа в документе
            const { socnetwork, region, url, format, topic, title, date } = req.body; // Получение данных из тела запроса

            // Добавление строки в таблицу
            await sheet.addRow({ Socnetwork: socnetwork, region: region, url: url, format: format, topic: topic, title: title, date: date });

            res.status(200).send('Data added to Google Sheets successfully');
        } catch (error) {
            console.error('Error adding data to Google Sheets:', error);
            res.status(500).send('Failed to add data to Google Sheets');
        }
    });

    // Запуск сервера
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
})().catch(e => console.error(e));
