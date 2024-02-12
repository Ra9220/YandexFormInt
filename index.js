require('dotenv').config();
console.log(process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL); // Должен вывести ваш email сервисного аккаунта

const express = require('express');
const bodyParser = require('body-parser');
const { GoogleSpreadsheet } = require('google-spreadsheet');
const { google } = require('googleapis');

const app = express();
app.use(bodyParser.json());

// Функция для настройки и работы с Google Sheets
async function configureGoogleSheets() {
    try {
        const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID);

        // Подготовка учетных данных сервисного аккаунта
        const creds = {
            client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
            private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        };

        // Аутентификация
        await doc.useServiceAccountAuth(creds);

        await doc.loadInfo(); // Загрузка информации о таблице
        console.log(doc.title); // Вывод названия документа для проверки
        return doc; // Возвращаем объект doc
    } catch (error) {
        console.error('Error accessing spreadsheet:', error);
        throw error; // Пробрасываем ошибку наверх для обработки
    }
}

// Обработчик маршрута POST для добавления данных в таблицу
app.post('/submit', async (req, res) => {
    try {
        // Вызываем функцию для настройки Google Sheets
        const doc = await configureGoogleSheets();
        const sheet = doc.sheetsByIndex[0]; // Выбор первого листа в документе
        const { socnetwork, region, url, format, topic, title, date } = req.body;

        // Добавление строки в таблицу
        await sheet.addRow({ Socnetwork: socnetwork, region: region, url: url, format: format, topic: topic, title: title, date: date });

        res.status(200).send('Data added to Google Sheets successfully');
    } catch (error) {
        console.error('Error adding data to Google Sheets:', error);
        res.status(500).send('Failed to add data to Google Sheets');
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
