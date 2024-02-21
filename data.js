// Функция для инициализации select2 с данными
function initializeSelect2WithData(elementId, data, placeholder) {
    // Если data - это массив строк, преобразуем его в формат объектов для select2
    const formattedData = data.map(item => {
        return typeof item === 'string' ? { id: item, text: item } : { id: item.id, text: item.name };
    });

    // Инициализация select2 на элементе
    $(`#${elementId}`).select2({
        data: formattedData,
        placeholder: placeholder,
        allowClear: true
    });
}

// Функция для инициализации формы
function initializeForm() {
    fetch('data.json')
        .then(response => response.json())
        .then(data => {
            initializeSelect2WithData('region', data.regions, 'Выберите регион');
            initializeSelect2WithData('format', data.formats, 'Выберите формат');
            initializeSelect2WithData('topic', data.topics, 'Выберите тему');
            initializeSelect2WithData('content', data.contents, 'Выберите содержание');
        })
        .catch(error => {
            console.error('Error loading data:', error);
        });
}

// Функция для отправки формы
function submitForm() {
    const formData = $('#dataForm').serializeArray().reduce(function(obj, item) {
        obj[item.name] = item.value;
        return obj;
    }, {});

    fetch('http://92.63.178.17:3000/submit', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ params: formData }),
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Server responded with status ${response.status}`);
            }
            return response.text();
        })
        .then(data => {
            console.log('Success:', data);
            alert('Данные успешно отправлены: ' + data);
        })
        .catch((error) => {
            console.error('Error:', error);
            alert('Ошибка при отправке данных: ' + error.message);
        });
}

// Обработчик события для инициализации формы после загрузки документа
$(document).ready(function() {
    initializeForm();
});

// Обработчик события для отправки формы
$('#dataForm').on('submit', function(e) {
    e.preventDefault(); // Предотвращаем стандартное поведение отправки формы
    submitForm();
});