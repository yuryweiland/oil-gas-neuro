/**
 * Код нейронной сети по прогнозированию объёма произвоидтельности НПС
 *
 * Выполнили студенты группы АСМ-17-04-2
 * Беркита Е.
 * Вайланд Ю.
 * Попова К.
 * Синалицкий Е.
 *
 * Это пример нейронной сети, прогнозирующей производительность НПС
 * Схема сети: 2 узла на входе(i1, i2), 2 узла на скрытом слое(h1, h2), 1 выходной узел(o1)
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
    {input: [1, 0], output: 2060},
    {input: [1, 1], output: 2120},
    {input: [1, 2], output: 2290},
    {input: [1, 3], output: 2370},
    {input: [2, 0], output: 1930},
    {input: [2, 1], output: 2080},
    {input: [2, 2], output: 2100},
    {input: [2, 3], output: 2400},
    {input: [3, 0], output: 1900},
    {input: [3, 1], output: 1980},
    {input: [3, 2], output: 2070},
    {input: [3, 3], output: 2120}
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
    bias_h1: random(),
    i1_h2: random(),
    i2_h2: random(),
    bias_h2: random(),
    h1_o1: random(),
    h2_o1: random(),
    bias_o1: random(),
};

// Сама нейронная сеть (без обучения, только прямой проход)
function nn(i1, i2) {
    var h1_input =
        weights.i1_h1 * i1 +
        weights.i2_h1 * i2 +
        weights.bias_h1;
    var h1 = activation_sigmoid(h1_input);

    var h2_input =
        weights.i1_h2 * i1 +
        weights.i2_h2 * i2 +
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
    R.mean(data.map(({input: [i1, i2], output: y}) => Math.pow(y - nn(i1, i2), 2)));

var outputResults = () =>
    data.forEach(({input: [i1, i2], output: y}) =>
        console.log(`${i1} XOR ${i2} => ${nn(i1, i2)} (expected ${y})`));

outputResults();

// Подсчет разницы весов
var train = () => {
    const weight_deltas = {
        i1_h1: 0,
        i2_h1: 0,
        bias_h1: 0,
        i1_h2: 0,
        i2_h2: 0,
        bias_h2: 0,
        h1_o1: 0,
        h2_o1: 0,
        bias_o1: 0,
    };

    for (var {input: [i1, i2], output} of data) {
        // Это код, просто скопированный из функции выше - чтобы научить сеть, нужно сначала делать проход вперед
        var h1_input =
            weights.i1_h1 * i1 +
            weights.i2_h1 * i2 +
            weights.bias_h1;
        var h1 = activation_sigmoid(h1_input);

        var h2_input =
            weights.i1_h2 * i1 +
            weights.i2_h2 * i2 +
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
        var h1_delta = o1_delta * derivative_sigmoid(h1_input) * h1_o1;
        var h2_delta = o1_delta * derivative_sigmoid(h2_input) * h2_o2;

        weight_deltas.i1_h1 += i1 * h1_delta;
        weight_deltas.i2_h1 += i2 * h1_delta;
        weight_deltas.bias_h1 += h1_delta;

        weight_deltas.i1_h2 += i1 * h2_delta;
        weight_deltas.i2_h2 += i2 * h2_delta;
        weight_deltas.bias_h2 += h2_delta;
    }

    return weight_deltas;
};

/**
 * Функция обучения нейронной сети
 * @param weight_deltas
 */
var applyTrainUpdate = (weight_deltas = train()) =>
    Object.keys(weights).forEach(key =>
        weights[key] += weight_deltas[key]);

applyTrainUpdate();
outputResults();
calculateResults();

// Можем потестить на 100 попытках
R.times(() => applyTrainUpdate(), 100);
outputResults();
calculateResults();

// Можем потестить на 1000 попытках
R.times(() => applyTrainUpdate(), 1000);
outputResults();
calculateResults();
