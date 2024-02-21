function loadData() {
    fetch('data.json')
        .then(response => response.json())
        .then(data => {
            initializeSelect('region', data.regions);
            initializeSelect('format', data.formats);
            initializeSelect('topic', data.topics);
            initializeSelect('content', data.contents);
            initializeSelect2();
        })
        .catch((error) => {
            console.error('Error loading data:', error);
        });
}

function initializeSelect(elementId, items) {
    const select = document.getElementById(elementId);
    select.innerHTML = '';
    select.add(new Option('Выберите...', ''));
    items.forEach(item => {
        select.add(new Option(item.name, item.name));
    });
}

function initializeSelect2() {
    $('.select2').select2({
        placeholder: "Выберите из списка",
        allowClear: true,
        width: '100%'
    });
}

function submitForm() {
    const form = document.getElementById('dataForm');
    const formData = {
        region: form.region.value,
        url: form.url.value,
        format: form.format.value,
        topic: form.topic.value,
        date: form.date.value,
        content: form.content.value
    };

    fetch('http://92.63.178.17:3000/submit', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({params: formData}),
    })
        .then(response => response.text())
        .then(data => {
            console.log('Success:', data);
            alert('Данные успешно отправлены');
        })
        .catch((error) => {
            console.error('Error:', error);
            alert('Ошибка при отправке данных');
        });
}

document.addEventListener('DOMContentLoaded', loadData);
