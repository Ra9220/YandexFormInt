// require('dotenv').config();
// const express = require('express');
// const bodyParser = require('body-parser');
// const { google } = require('googleapis');
// const morgan = require('morgan');
// const path = require('path');
//
// const app = express();
//
// app.use(bodyParser.json());
// app.use(morgan('combined'));
//
// // Для CSS файлов
// app.get('/styles.css', (req, res) => {
//     res.sendFile(path.join(__dirname, 'styles.css'), {
//         headers: {
//             'Content-Type': 'text/css'
//         }
//     });
// });
//
// // Для JavaScript файлов
// app.get('/data.js', (req, res) => {
//     res.sendFile(path.join(__dirname, 'data.js'), {
//         headers: {
//             'Content-Type': 'application/javascript'
//         }
//     });
// });
//
// // Для JSON файлов
// app.get('/data.json', (req, res) => {
//     res.sendFile(path.join(__dirname, 'data.json'), {
//         headers: {
//             'Content-Type': 'application/json'
//         }
//     });
// });
//
// async function addFormDataToSheet(formData) {
//     try {
//         const auth = new google.auth.GoogleAuth({
//             keyFile: "credentials.json",
//             scopes: ["https://www.googleapis.com/auth/spreadsheets"],
//         });
//
//         const client = await auth.getClient();
//         const googleSheets = google.sheets({ version: "v4", auth: client });
//
//         const spreadsheetId = process.env.SPREADSHEET_ID;
//         const range = `${process.env.SHEET_NAME}!A2:I`;
//
//         const decodedFormData = {};
//         for (const [key, value] of Object.entries(formData)) {
//             decodedFormData[key] = typeof value === 'string' ? decodeURIComponent(JSON.parse('"' + value.replace(/\"/g, '\\"') + '"')) : value;
//         }
//
//         await googleSheets.spreadsheets.values.append({
//             spreadsheetId,
//             range,
//             valueInputOption: "USER_ENTERED",
//             resource: { values: [Object.values(decodedFormData)] },
//         });
//
//         console.log('Data successfully added to Google Sheets:', decodedFormData);
//     } catch (error) {
//         console.error('Error adding data to Google Sheets:', error);
//         throw error;
//     }
// }
//
// function decodeUnicodeParams(params) {
//     const decodedParams = {};
//     for (const [key, value] of Object.entries(params)) {
//         if (typeof value === 'string') {
//             decodedParams[key] = decodeURIComponent(JSON.parse('"' + value.replace(/\"/g, '\\"') + '"'));
//         } else {
//             decodedParams[key] = value;
//         }
//     }
//     return decodedParams;
// }
//
// // Маршрут для обработки GET запросов на /submit
// app.get('/submit', (req, res) => {
//     // Отправляем HTML страницу с формой
//     res.sendFile(path.join(__dirname, 'data.html'));
// });
//
// // Маршрут для обработки POST запросов на /submit
// app.post('/submit', async (req, res) => {
//     try {
//         const decodedParams = decodeUnicodeParams(req.body.params);
//         console.log('Received data from Yandex Form:', decodedParams);
//         await addFormDataToSheet(decodedParams);
//         res.status(200).send('Data added to Google Sheets successfully');
//     } catch (error) {
//         console.error('Failed to add data to Google Sheets:', error);
//         res.status(500).send('Failed to add data to Google Sheets');
//     }
// });
//
// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { google } = require('googleapis');
const morgan = require('morgan');
const path = require('path');

const app = express();

app.use(bodyParser.json());
app.use(morgan('combined'));

// Для CSS файлов
app.get('/styles.css', (req, res) => {
    res.sendFile(path.join(__dirname, 'styles.css'), {
        headers: {
            'Content-Type': 'text/css'
        }
    });
});

// Для JavaScript файлов
app.get('/data.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'data.js'), {
        headers: {
            'Content-Type': 'application/javascript'
        }
    });
});

// Для JSON файлов
app.get('/data.json', (req, res) => {
    res.sendFile(path.join(__dirname, 'data.json'), {
        headers: {
            'Content-Type': 'application/json'
        }
    });
});

async function addFormDataToSheet(formData) {
    try {
        const auth = new google.auth.GoogleAuth({
            keyFile: "credentials.json",
            scopes: ["https://www.googleapis.com/auth/spreadsheets"],
        });

        const client = await auth.getClient();
        const googleSheets = google.sheets({ version: "v4", auth: client });

        const spreadsheetId = process.env.SPREADSHEET_ID;
        const range = `${process.env.SHEET_NAME}!A2:I`;

        // Загрузите данные из data.json
        const data = require('./data.json');

        // Получите соответствующий объект данных из data.json на основе regionText
        const regionData = data.find(item => item.name === formData.region_text);

        // Получаем только текстовое значение региона
        const regionName = regionData ? regionData.name : formData.region_text;

        // Создаем массив для добавления в таблицу, включая только текстовое значение региона
        const values = [[regionName, formData.url, formData.format, formData.topic, formData.date, formData.content]];

        await googleSheets.spreadsheets.values.append({
            spreadsheetId,
            range,
            valueInputOption: "USER_ENTERED",
            resource: { values },
        });

        console.log('Data successfully added to Google Sheets:', formData);
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
            decodedParams[key] = value;
        }
    }
    return decodedParams;
}

// Маршрут для обработки GET запросов на /submit
app.get('/submit', (req, res) => {
    // Отправляем HTML страницу с формой
    res.sendFile(path.join(__dirname, 'data.html'));
});

// Маршрут для обработки POST запросов на /submit
app.post('/submit', async (req, res) => {
    try {
        const decodedParams = decodeUnicodeParams(req.body.params);
        console.log('Received data from Yandex Form:', decodedParams);
        await addFormDataToSheet(decodedParams);
        res.status(200).send('Data added to Google Sheets successfully');
    } catch (error) {
        console.error('Failed to add data to Google Sheets:', error);
        res.status(500).send('Failed to add data to Google Sheets');
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
