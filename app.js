const regionTooltip = document.getElementById('regionTooltip');

// Конфигурация карты
const map = L.map('map', {
    center: [62, 94], // Центр России
    zoom: 4,
    // preferCanvas: true, // Использовать Canvas вместо SVG
    zoomSnap: 0.2, // Уменьшить частоту перерисовки
    fadeAnimation: true, // Отключить анимацию
    layers: [
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        })
    ]
});
// L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
//     maxZoom: 19,
//     attribution: '© OpenStreetMap',
//     subdomains: 'abc' // Для балансировки нагрузки
// }).addTo(map);

// Элемент для отображения информации о регионе
const regionInfo = document.getElementById('regionInfo');
const regionName = document.getElementById('regionName');
const regionCapital = document.getElementById('regionCapital');
const regionPopulation = document.getElementById('regionPopulation');
const regionArea = document.getElementById('regionArea');
const regionDescription = document.getElementById('regionDescription');

// Моковые данные для регионов
const regionData = {
    'Красноярский край': {
        name: 'Красноярский край',
        capital: 'Красноярск',
        population: '2 855 899',
        area: '2 366 797 км²',
        description: 'Самый большой регион России по площади'
    },
    'Москва': {
        name: 'Москва',
        capital: 'Москва',
        population: '12 655 050',
        area: '2 561 км²',
        description: 'Столица России'
    },
    'Санкт-Петербург': { // Санкт-Петербург
        name: 'Санкт-Петербург',
        capital: 'Санкт-Петербург',
        population: '5 384 342',
        area: '1 439 км²',
        description: 'Северная столица России, культурный центр страны.'
    },
    'Новосибирская область': { // Новосибирская область
        name: 'Новосибирская область',
        capital: 'Новосибирск',
        population: '2 797 176',
        area: '177 756 км²',
        description: 'Крупнейший регион Сибири с развитой промышленностью и наукой.'
    },
    'Краснодарский край': { // Краснодарский край
        name: 'Краснодарский край',
        capital: 'Краснодар',
        population: '5 838 273',
        area: '75 485 км²',
        description: 'Курортный регион России на берегу Чёрного моря.'
    },
    'Ростовская область': { // Ростовская область
        name: 'Ростовская область',
        capital: 'Ростов-на-Дону',
        population: '4 181 486',
        area: '100 967 км²',
        description: 'Южный регион России, известный как "Ворота Кавказа".'
    }
};

// Функция для генерации цвета на основе кода региона
// function getColorByRegionCode(code) {
//     // Хэшируем код региона для получения числа
//     let hash = 0;
//     for (let i = 0; i < code.length; i++) {
//         hash = code.charCodeAt(i) + ((hash << 5) - hash);
//     }
//     // Преобразуем хэш в HSL цвет
//     const hue = Math.abs(hash) % 360;
//     return `hsl(${hue}, 70%, 50%)`;
// }
function getColorByRegionCode(code) {
    if (!code) return '#cccccc'; // Возвращаем серый цвет по умолчанию
    
    let hash = 0;
    for (let i = 0; i < code.length; i++) {
        hash = code.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash) % 360;
    return `hsl(${hue}, 70%, 50%)`;
}

function highlightFeature(e, feature) {
    const layer = e.target;
    layer.setStyle({
        fillOpacity: 0.5
    });
    const regionName = feature.properties.name || 'Неизвестный регион';
    regionTooltip.textContent = regionName;
    regionTooltip.style.display = 'block';
}

function resetHighlight(e) {
    const layer = e.target;
    layer.setStyle({
        fillOpacity: 0.3
    });
    regionTooltip.style.display = 'none';
}

function showTooltip(e, text) {
    regionTooltip.textContent = text || e.target.feature.properties.name;
    regionTooltip.style.display = 'block';
    moveTooltip(e);
}

function moveTooltip(e) {
    regionTooltip.style.left = e.originalEvent.clientX + 'px';
    regionTooltip.style.top = (e.originalEvent.clientY - 15) + 'px';
}

function hideTooltip() {
    regionTooltip.style.display = 'none';
}

// Загрузка границ регионов России
fetch('https://raw.githubusercontent.com/codeforamerica/click_that_hood/master/public/data/russia.geojson')
    .then(response => {
        if (!response.ok) {
            throw new Error('Не удалось загрузить данные');
        }
        return response.json();
    })
    .then(data => {
        // Обрабатываем данные GeoJSON
        L.geoJSON(data, {
            simplifyTolerance: 0.01, // Упрощение геометрии
            smoothFactor: 0.3, // Сглаживание линий
            style: function(feature) {
                return {
                    fillColor: getColorByRegionCode(feature.properties.iso || feature.properties.name),
                    weight: 1,
                    opacity: 1,
                    color: 'white',
                    dashArray: '3',
                    fillOpacity: 0.3
                };
            },
            onEachFeature: function(feature, layer) {
                // Обработка клика на регион
                layer.on({
                    // Для десктопов
                    mouseover: (e) => highlightFeature(e, feature),
                    mouseout: resetHighlight,
                    mousemove: moveTooltip,
                    
                    // Для тач-устройств
                    touchstart: function(e) {
                        //e.originalEvent.preventDefault(); // Предотвращаем вызов контекстного меню
                        highlightFeature(e, feature);
                        showTooltip(e);
                    },
                    touchend: function(e) {
                        //e.originalEvent.preventDefault();
                        resetHighlight(e);
                        hideTooltip();
                    },
                    click: function(e) {
                        //e.originalEvent.preventDefault();
                        const regionName = feature.properties.name;
                        const data = regionData[regionName] || {
                            name: regionName,
                            capital: 'Нет данных',
                            population: 'Нет данных',
                            area: 'Нет данных',
                            description: 'Информация отсутствует'
                        };
                        
                        // Обновляем информацию в блоке
                        document.getElementById('regionName').textContent = data.name;
                        document.getElementById('regionCapital').textContent = `Столица: ${data.capital}`;
                        document.getElementById('regionPopulation').textContent = `Население: ${data.population}`;
                        document.getElementById('regionArea').textContent = `Площадь: ${data.area}`;
                        document.getElementById('regionDescription').textContent = `Описание: ${data.description}`;
                        
                        // Показываем блок с информацией
                        regionInfo.style.display = 'block';
                    }
                });
            }
        }).addTo(map);
    })
    .catch(error => {
        console.error('Ошибка загрузки данных:', error);
        // Можно добавить fallback-картинку или сообщение об ошибке
        alert('Не удалось загрузить данные карты. Пожалуйста, попробуйте позже.');
    });

// Обработчик клика по карте для скрытия информации о регионе
// map.on('click', function() {
//     regionInfo.style.display = 'none';
// });

map.on('moveend', function() {
    const bounds = map.getBounds();
    const zoom = map.getZoom();
    // Предзагружаем соседние тайлы
    if (zoom > 1) {
        map.eachLayer(function(layer) {
            if (layer._url) {
                layer._tilesPreload = bounds;
            }
        });
    }
});
//map.setMaxBounds([[41.185, 19.09], [81.9, 180]]); // Границы России
map.setMaxBounds([
    [0.0, 0.0],
    [190.0, 250.0]
]);
map.options.minZoom = 3; // Минимальный зум
// L.geoJSON(data, {
//     simplifyTolerance: 0.01, // Упрощение геометрии
//     smoothFactor: 0.3 // Сглаживание линий
// });

window.ontouchmove = hideTooltip