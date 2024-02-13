const express = require("express");
const bodyParser = require("body-parser");
const { google } = require("googleapis");
const morgan = require("morgan");
require("dotenv").config();

const app = express();

app.use(bodyParser.json());
app.use(morgan('combined')); // Логирование HTTP-запросов

// Функция для аутентификации и добавления данных в Google Sheets
async function addFormDataToSheet(formData) {
    try {
        const auth = new google.auth.GoogleAuth({
            keyFile: "credentials.json", // путь к файлу с учетными данными
            scopes: ["https://www.googleapis.com/auth/spreadsheets"],
        });

        const client = await auth.getClient();

        const googleSheets = google.sheets({ version: "v4", auth: client });

        const spreadsheetId = process.env.SPREADSHEET_ID;
        const range = `${process.env.SHEET_NAME}!A2:H`; // Пример: 'Sheet1!A2:H'

        await googleSheets.spreadsheets.values.append({
            spreadsheetId,
            range,
            valueInputOption: "USER_ENTERED",
            resource: {
                values: [
                    [
                        formData.socnetwork,
                        formData.region,
                        formData.url,
                        formData.format,
                        formData.topic,
                        formData.title,
                        formData.date,
                    ],
                ],
            },
        });
        console.log('Data added to Google Sheets:', formData);
    } catch (error) {
        console.error('Error adding data to Google Sheets:', error);
        throw error;
    }
}

// Обработчик маршрута POST для добавления данных из Яндекс.Формы в Google Sheets
app.post('/submit', async (req, res) => {
    try {
        const formData = req.body;
        await addFormDataToSheet(formData);
        res.status(200).send('Data added to Google Sheets successfully');
    } catch (error) {
        res.status(500).send('Failed to add data to Google Sheets');
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
