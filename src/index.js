/**
 * Код нейронной сети по прогнозированию объёма произвоидтельности НПС
 *
 * Выполнил студент группы АСМ-17-04-2
 * Попова К.
 *
 * Это пример нейронной сети, прогнозирующей производительность НПС
 * Схема сети: 7 узлов на входе(i1, i2, i3, i4, i5, i6, i7), 2 узла на скрытом слое(h1, h2), 1 выходной узел(o1)
 * На каждом уровне используется bias, функция активации - сигмоида.
 */

// ОБЪЯВЛЯЕМ ЗАВИСИМОСТИ

// Ramda - это вспомогательная библиотека, которая используется исключительно
// для удобства в вспомогательных функциях, помогает облегчить чтение кода. Можно было бы обойтись и без неё.
var R = require('ramda');

void 0; // не "раздуваем" выходные данные

// Используем воспроизводимый random от Gibson Research Corporation, чтобы понять, что мы сделали не так
// Ссылка на зависимость в репозитории Node - https://www.npmjs.com/package/random-seed
var random = require('seed-random')(1337);

// Исходные данные для разных НПС (два входящих значения - номер НПС и кол-во включенных на ней насосов)
var data = [
    {input: [1, 0, 0, 0, 2.5, 0.23, 0.87, 3, 4.3], output: 2060},
    {input: [1, 1, 0, 0, 2.5, 0.23, 0.87, 3, 4.3], output: 2120},
    {input: [1, 1, 1, 0, 2.5, 0.23, 0.87, 3, 4.3], output: 2121},
    {input: [1, 1, 1, 1, 2.5, 0.23, 0.87, 3, 4.3], output: 2122},
    {input: [0, 0, 0, 1, 2.5, 0.23, 0.87, 3, 4.3], output: 2123},
    {input: [0, 0, 1, 1, 2.5, 0.23, 0.87, 3, 4.3], output: 2124},
    {input: [0, 1, 1, 1, 2.5, 0.23, 0.87, 3, 4.3], output: 2125},
    {input: [1, 1, 1, 1, 2.5, 0.23, 0.87, 3, 4.3], output: 2126},
    {input: [2, 1, 1, 1, 2.5, 0.23, 0.87, 3, 4.3], output: 2127},
    {input: [2, 2, 1, 1, 2.5, 0.23, 0.87, 3, 4.3], output: 2128},
    {input: [2, 2, 2, 1, 2.5, 0.23, 0.87, 3, 4.3], output: 2129},
    {input: [2, 2, 2, 2, 2.5, 0.23, 0.87, 3, 4.3], output: 2130},
    {input: [1, 1, 1, 2, 2.5, 0.23, 0.87, 3, 4.3], output: 2131},
    {input: [1, 1, 2, 2, 2.5, 0.23, 0.87, 3, 4.3], output: 2132},
    {input: [1, 2, 2, 2, 2.5, 0.23, 0.87, 3, 4.3], output: 2133},
    {input: [2, 2, 2, 2, 2.5, 0.23, 0.87, 3, 4.3], output: 2134},
    {input: [3, 2, 2, 2, 2.5, 0.23, 0.87, 3, 4.3], output: 2135},
    {input: [3, 3, 2, 2, 2.5, 0.23, 0.87, 3, 4.3], output: 2136},
    {input: [3, 3, 3, 2, 2.5, 0.23, 0.87, 3, 4.3], output: 2137},
    {input: [3, 3, 3, 3, 2.5, 0.23, 0.87, 3, 4.3], output: 2138},
    {input: [2, 2, 2, 3, 2.5, 0.23, 0.87, 3, 4.3], output: 2139},
    {input: [2, 2, 3, 3, 2.5, 0.23, 0.87, 3, 4.3], output: 2140},
    {input: [2, 3, 3, 3, 2.5, 0.23, 0.87, 3, 4.3], output: 2141},
    {input: [4, 3, 3, 3, 2.5, 0.23, 0.87, 3, 4.3], output: 2142},
    {input: [4, 4, 3, 3, 2.5, 0.23, 0.87, 3, 4.3], output: 2143},
    {input: [4, 4, 4, 3, 2.5, 0.23, 0.87, 3, 4.3], output: 2144},
    {input: [4, 4, 4, 4, 2.5, 0.23, 0.87, 3, 4.3], output: 2145},
    {input: [3, 3, 3, 4, 2.5, 0.23, 0.87, 3, 4.3], output: 2146},
    {input: [3, 3, 4, 4, 2.5, 0.23, 0.87, 3, 4.3], output: 2147},
    {input: [3, 4, 4, 4, 2.5, 0.23, 0.87, 3, 4.3], output: 2148},


    // {input: [1, 2, 2.5, 0.23, 0.87, 3, 4.3], output: 2290},
    // {input: [1, 3, 2.5, 0.23, 0.87, 3, 4.3], output: 2370},
    // {input: [2, 0, 2.5, 0.23, 0.87, 3, 4.3], output: 1930},
    // {input: [2, 1, 2.5, 0.23, 0.87, 3, 4.3], output: 2080},
    // {input: [2, 2, 2.5, 0.23, 0.87, 3, 4.3], output: 2100},
    // {input: [2, 3, 2.5, 0.23, 0.87, 3, 4.3], output: 2400},
    // {input: [3, 0, 2.5, 0.23, 0.87, 3, 4.3], output: 2010},
    // {input: [3, 1, 2.5, 0.23, 0.87, 3, 4.3], output: 2160},
    // {input: [3, 2, 2.5, 0.23, 0.87, 3, 4.3], output: 2480},
    // {input: [3, 3, 2.5, 0.23, 0.87, 3, 4.3], output: 2650}
];

// Эти функции с их графиками можно посмотреть на WolframAlpha:
// https://www.wolframalpha.com/input/?i=1+%2F+(1+%2B+e+^+-x)
// https://www.wolframalpha.com/input/?i=dx+1+%2F+(1+%2B+e+^+-x)

var activation_sigmoid = x => 1 / (1 + Math.exp(-x));

var derivative_sigmoid = x => {
    const fx = activation_sigmoid(x);
    return fx * (1 - fx);
};

// Изначально берём любые рандомные веса связей (это до обучения нейросети)
var weights = {
    i1_h1: random(),
    i2_h1: random(),
    i3_h1: random(),
    i4_h1: random(),
    i5_h1: random(),
    i6_h1: random(),
    i7_h1: random(),
    i8_h1: random(),
    bias_h1: random(),
    i1_h2: random(),
    i2_h2: random(),
    i3_h2: random(),
    i4_h2: random(),
    i5_h2: random(),
    i6_h2: random(),
    i7_h2: random(),
    i8_h2: random(),
    bias_h2: random(),
    h1_o1: random(),
    h2_o1: random(),
    bias_o1: random(),
};

// Сама нейронная сеть (без обучения, только прямой проход)
function nn(i1, i2, i3, i4, i5, i6, i7) {

    var h1_input =
        weights.i1_h1 * i1 +
        weights.i2_h1 * i2 +
        weights.i3_h1 * i3 +
        weights.i4_h1 * i4 +
        weights.i5_h1 * i5 +
        weights.i6_h1 * i6 +
        weights.i7_h1 * i7 +
        weights.bias_h1;

    var h1 = activation_sigmoid(h1_input);

    var h2_input =
        weights.i1_h2 * i1 +
        weights.i2_h2 * i2 +
        weights.i3_h2 * i3 +
        weights.i4_h2 * i4 +
        weights.i5_h2 * i5 +
        weights.i6_h2 * i6 +
        weights.i7_h2 * i7 +
        weights.bias_h2;

    var h2 = activation_sigmoid(h2_input);

    var o1_input =
        weights.h1_o1 * h1 +
        weights.h2_o1 * h2 +
        weights.bias_o1;

    var o1 = activation_sigmoid(o1_input);

    return o1;
}

// Подсчет значений
var calculateResults = () =>
    R.mean(data.map(({input: [i1, i2, i3, i4, i5, i6, i7], output: y}) => Math.pow(y - nn(i1, i2, i3, i4, i5, i6, i7), 2)));

var outputResults = () =>
    data.forEach(({input: [i1, i2, i3, i4, i5, i6, i7], output: y}) => {
            // 9.05
            // console.log(`${i1}, ${i2}, ${i3}, ${i4}, ${i5}, ${i6}, ${i7} => ${nn(i1, i2, i3, i4, i5, i6, i7)} (expected ${y})`);
        });

outputResults();

// Подсчет разницы весов
var train = () => {
    const weight_deltas = {
        i1_h1: 0,
        i2_h1: 0,
        i3_h1: 0,
        i4_h1: 0,
        i5_h1: 0,
        i6_h1: 0,
        i7_h1: 0,
        bias_h1: 0,

        i1_h2: 0,
        i2_h2: 0,
        i3_h2: 0,
        i4_h2: 0,
        i5_h2: 0,
        i6_h2: 0,
        i7_h2: 0,
        bias_h2: 0,

        h1_o1: 0,
        h2_o1: 0,
        bias_o1: 0,
    };

    for (var {input: [i1, i2, i3, i4, i5, i6, i7], output} of data) {
        // Это код, просто скопированный из функции выше - чтобы научить сеть, нужно сначала делать проход вперед
        var h1_input =
            weights.i1_h1 * i1 +
            weights.i2_h1 * i2 +
            weights.i3_h1 * i3 +
            weights.i4_h1 * i4 +
            weights.i5_h1 * i5 +
            weights.i6_h1 * i6 +
            weights.i7_h1 * i7 +
            weights.bias_h1;
        var h1 = activation_sigmoid(h1_input);

        var h2_input =
            weights.i1_h2 * i1 +
            weights.i2_h2 * i2 +
            weights.i3_h2 * i3 +
            weights.i4_h2 * i4 +
            weights.i5_h2 * i5 +
            weights.i6_h2 * i6 +
            weights.i7_h2 * i7 +
            weights.bias_h2;
        var h2 = activation_sigmoid(h2_input);

        var o1_input =
            weights.h1_o1 * h1 +
            weights.h2_o1 * h2 +
            weights.bias_o1;

        var o1 = activation_sigmoid(o1_input);

        // Обучение начинается:
        // мы расчитываем разницу
        var delta = output - o1;

        // Затем берем производную (и выкидываем 2 *, потому что это нам не так важно)
        var o1_delta = delta * derivative_sigmoid(o1_input);

        // и для нашей формулы вида w1 * h1 + w2 * h2 мы вначале пытаемся обновить веса w1 и w2
        weight_deltas.h1_o1 += h1 * o1_delta;
        weight_deltas.h2_o1 += h2 * o1_delta;
        weight_deltas.bias_o1 += o1_delta;

        // А затем входные значения h1 и h2.
        // Мы не можем просто взять и изменить их - это выход такой же функции активации
        // Поэтому мы пропускаем эту ошибку дальше по тому же принципу
        var h1_delta = o1_delta * derivative_sigmoid(h1_input);
        var h2_delta = o1_delta * derivative_sigmoid(h2_input);

        weight_deltas.i1_h1 += i1 * h1_delta;
        weight_deltas.i2_h1 += i2 * h1_delta;
        weight_deltas.i3_h1 += i3 * h1_delta;
        weight_deltas.i4_h1 += i4 * h1_delta;
        weight_deltas.i5_h1 += i5 * h1_delta;
        weight_deltas.i6_h1 += i6 * h1_delta;
        weight_deltas.i7_h1 += i7 * h1_delta;
        weight_deltas.bias_h1 += h1_delta;

        weight_deltas.i1_h2 += i1 * h2_delta;
        weight_deltas.i2_h2 += i2 * h2_delta;
        weight_deltas.i3_h2 += i3 * h2_delta;
        weight_deltas.i4_h2 += i4 * h2_delta;
        weight_deltas.i5_h2 += i5 * h2_delta;
        weight_deltas.i6_h2 += i6 * h2_delta;
        weight_deltas.i7_h2 += i7 * h2_delta;
        weight_deltas.bias_h2 += h2_delta;
    }

    // Возвращаем значение разницы весов
    return weight_deltas;
};

/**
 * Функция обучения нейронной сети
 * @param weight_deltas
 */
var applyTrainUpdate = (weight_deltas = train()) =>
    Object.keys(weights).forEach(key =>
        weights[key] += weight_deltas[key]);

// applyTrainUpdate();
// outputResults();
// calculateResults();

// Тестирование нейросети: 100 проходов
// R.times(() => applyTrainUpdate(), 100);
// outputResults();
// calculateResults();

// Тестирование нейросети: 1000 проходов
R.times(() => applyTrainUpdate(), 1000);
outputResults();
calculateResults();

/**
 * Код, необходимый для коррректной работы веб-интерфейса
 */

// Select-список с выбором кол-ва НПС на участке МНП
var oilStationsCount = document.querySelector('.oil-stations-count');

// Контейнер для блока с формой и кнопками результатов (виден при выборе кол-ва НПС)
var oilStationsInfo = document.querySelector('.oil-stations-info');

// Контейнер для блока насосов
var radioInputsContainer = document.querySelector('.radio-inputs-container');

// Блок с кнопками для расчёта результатов
var calculateButtonBlock = document.querySelector('.calculate-button-block');

// Кнопка "Расчитать"
var calculateButton = document.querySelector('.calculate-button');

// Кнопка "Новый расчёт"
var calculateNewButton = document.querySelector('.calculate-new-button');

// Блок результатов расчёта
var resultBlock = document.querySelector('.result');

// Форма с параметрами
var parametersForm = document.querySelector('.oil-station-parameters');
// console.log('parametersForm', parametersForm);

// Массив input-полей формы с параметрами
var parametersFormInputs = parametersForm.querySelectorAll('input');

// Обновляем статус кнопки "Расчитать" в зависимости от значений формы
[].forEach.call(parametersFormInputs, function (e) {
    e.addEventListener('change', disableCalculateButton)
});

var pumpSelector1 = document.createElement('div');
pumpSelector1.className = "pump-selector-1";
pumpSelector1.innerHTML = "<label>Количество включенных насосов на первой НПС (шт):</label>\n" +
    "\n" +
    "    <div><input name=\"first_nps_on\" type=\"radio\" value=\"1\" checked /> 1</div>" +
    "\n" +
    "    <div><input name=\"first_nps_on\" type=\"radio\" value=\"2\" checked /> 2</div>" +
    "\n" +
    "    <div><input name=\"first_nps_on\" type=\"radio\" value=\"3\" checked /> 3</div>" +
    "\n" +
    "    <div><input name=\"first_nps_on\" type=\"radio\" value=\"4\" checked /> 4</div>";

var pumpSelector2 = document.createElement('div');
pumpSelector2.className = "pump-selector-2";
pumpSelector2.innerHTML = "<label>Количество включенных насосов на второй НПС (шт):</label>\n" +
    "\n" +
    "    <div><input name=\"second_nps_on\" type=\"radio\" value=\"1\" checked /> 1</div>" +
    "\n" +
    "    <div><input name=\"second_nps_on\" type=\"radio\" value=\"2\" checked /> 2</div>" +
    "\n" +
    "    <div><input name=\"second_nps_on\" type=\"radio\" value=\"3\" checked /> 3</div>" +
    "\n" +
    "    <div><input name=\"second_nps_on\" type=\"radio\" value=\"4\" checked /> 4</div>";

var pumpSelector3 = document.createElement('div');
pumpSelector3.className = "pump-selector-3";
pumpSelector3.innerHTML = "<label>Количество включенных насосов на третьей НПС (шт):</label>\n" +
    "\n" +
    "    <div><input name=\"third_nps_on\" type=\"radio\" value=\"1\" checked /> 1</div>" +
    "\n" +
    "    <div><input name=\"third_nps_on\" type=\"radio\" value=\"2\" checked /> 2</div>" +
    "\n" +
    "    <div><input name=\"third_nps_on\" type=\"radio\" value=\"3\" checked /> 3</div>" +
    "\n" +
    "    <div><input name=\"third_nps_on\" type=\"radio\" value=\"4\" checked /> 4</div>";

var pumpSelector4 = document.createElement('div');
pumpSelector4.className = "pump-selector-4";
pumpSelector4.innerHTML = "<label>Количество включенных насосов на четвертой НПС (шт):</label>\n" +
    "\n" +
    "    <div><input name=\"fourth_nps_on\" type=\"radio\" value=\"1\" checked /> 1</div>" +
    "\n" +
    "    <div><input name=\"fourth_nps_on\" type=\"radio\" value=\"2\" checked /> 2</div>" +
    "\n" +
    "    <div><input name=\"fourth_nps_on\" type=\"radio\" value=\"3\" checked /> 3</div>" +
    "\n" +
    "    <div><input name=\"fourth_nps_on\" type=\"radio\" value=\"4\" checked /> 4</div>";

oilStationsCount.addEventListener('change', function () {
    if (+oilStationsCount.value > 0) {

        for (var i = 0; i < +oilStationsCount.value; i++) {
            if (i === 0) {
                clearRadioInputsContainer();
                radioInputsContainer.appendChild(pumpSelector1);
                parametersFormInputs = parametersForm.querySelectorAll('input');
            } else if (i === 1) {
                clearRadioInputsContainer();
                radioInputsContainer.appendChild(pumpSelector1);
                radioInputsContainer.appendChild(pumpSelector2);
                parametersFormInputs = parametersForm.querySelectorAll('input');
            } else if (i === 2) {
                clearRadioInputsContainer();
                radioInputsContainer.appendChild(pumpSelector1);
                radioInputsContainer.appendChild(pumpSelector2);
                radioInputsContainer.appendChild(pumpSelector3);
                parametersFormInputs = parametersForm.querySelectorAll('input');
            } else if (i === 3) {
                clearRadioInputsContainer();
                radioInputsContainer.appendChild(pumpSelector1);
                radioInputsContainer.appendChild(pumpSelector2);
                radioInputsContainer.appendChild(pumpSelector3);
                radioInputsContainer.appendChild(pumpSelector4);
                parametersFormInputs = parametersForm.querySelectorAll('input');
            }
        }

        oilStationsInfo.classList.remove('hidden');
    } else {
        oilStationsInfo.classList.add('hidden');
        resultBlock.classList.add('hidden');
    }
});

// Показываем блок с результатами расчёта по клику
calculateButton.addEventListener('click', function () {
    resultBlock.classList.remove('hidden');
    calculateButton.classList.add('hidden');
    calculateNewButton.classList.remove('hidden');
    disableParametersForm(true);
    oilStationsCount.disabled = true;
});

// Обработчик клика по кнопке "Новый расчёт"
calculateNewButton.addEventListener('click', function () {
    calculateButton.classList.remove('hidden');
    calculateNewButton.classList.add('hidden');
    resultBlock.classList.add('hidden');
    disableParametersForm(false);
    oilStationsCount.disabled = false;
});

// Удаляем все дочерние элементы у radioInputsContainer
function clearRadioInputsContainer() {
    while (radioInputsContainer.firstChild) {
        radioInputsContainer.removeChild(radioInputsContainer.firstChild);
    }
}

// Деактивируем кнопку расчёта, если хотя бы одно поле не заполнено
function disableCalculateButton() {
    calculateButton.disabled = Array.from(parametersFormInputs)
        .filter((input) => input.type === 'number')
        .some((input) => !input.value || input.value === 0 || input.value === "0");
}

// (Де-)активация всех полей формы (по параметру)
function disableParametersForm(bool) {
    Array.from(parametersFormInputs)
        .forEach((input) => {
            input.disabled = bool;
        });
}

disableCalculateButton();
