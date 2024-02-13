require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { google } = require('googleapis');
const morgan = require('morgan');

const app = express();

app.use(bodyParser.json());
app.use(morgan('combined')); // Логирование HTTP-запросов

async function addFormDataToSheet(formData) {
    try {
        const auth = new google.auth.GoogleAuth({
            keyFile: "credentials.json",
            scopes: ["https://www.googleapis.com/auth/spreadsheets"],
        });

        const client = await auth.getClient();
        const googleSheets = google.sheets({ version: "v4", auth: client });

        const spreadsheetId = process.env.SPREADSHEET_ID;
        const range = `${process.env.SHEET_NAME}!A2:H`;

        // Декодируем все строки в formData из Unicode escape sequences
        const decodedFormData = {};
        for (const [key, value] of Object.entries(formData)) {
            decodedFormData[key] = typeof value === 'string' ? decodeURIComponent(JSON.parse('"' + value.replace(/\"/g, '\\"') + '"')) : value;
        }

        await googleSheets.spreadsheets.values.append({
            spreadsheetId,
            range,
            valueInputOption: "USER_ENTERED",
            resource: { values: [Object.values(decodedFormData)] },
        });

        console.log('Data successfully added to Google Sheets:', decodedFormData);
    } catch (error) {
        console.error('Error adding data to Google Sheets:', error);
        throw error;
    }
}

function decodeUnicodeParams(params) {
    const decodedParams = {};
    for (const [key, value] of Object.entries(params)) {
        if (typeof value === 'string') {
            decodedParams[key] = decodeURIComponent(JSON.parse('"' + value.replace(/\"/g, '\\"') + '"'));
        } else {
            decodedParams[key] = value; // Если значение не строка, оставляем как есть
        }
    }
    return decodedParams;
}

app.post('/submit', async (req, res) => {
    try {
        // Извлекаем и декодируем параметры из JSON-RPC запроса
        const decodedParams = decodeUnicodeParams(req.body.params);
        console.log('Received data from Yandex Form:', decodedParams);

        // Добавляем декодированные данные в Google Sheets
        await addFormDataToSheet(decodedParams);

        res.status(200).send('Data added to Google Sheets successfully');
    } catch (error) {
        console.error('Failed to add data to Google Sheets:', error);
        res.status(500).send('Failed to add data to Google Sheets');
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
