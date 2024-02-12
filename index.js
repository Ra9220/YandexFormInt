require('dotenv').config();
console.log(process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL); // Должен вывести ваш email сервисного аккаунта

const express = require('express');
const bodyParser = require('body-parser');
const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');

const app = express();
app.use(bodyParser.json());

// Создание объекта аутентификации
const serviceAccountAuth = new JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/gm, '\n'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

// Инициализация документа Google Sheets с аутентификацией
const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID);

async function configureGoogleSheets() {
    try {
        // Передача аутентификации в документ
        await doc.useServiceAccountAuth(serviceAccountAuth);

        await doc.loadInfo(); // Загрузка информации о таблице
        console.log(doc.title); // Вывод названия документа для проверки
    } catch (error) {
        console.error('Error accessing spreadsheet:', error);
    }
}

configureGoogleSheets();

// Обработчик для маршрута POST
app.post('/submit', async (req, res) => {
    try {
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
