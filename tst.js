function containsWith() {
    return 3;
    with({}) {}
}

function printStatus(fn) {
    switch ( % GetOptimizationStatus(fn)) {
    case 1:
        console.log("Функция оптимизирована");
        break;
    case 2:
        console.log("Функция не оптимизирована");
        break;
    case 3:
        console.log("Функция всегда оптимизируема");
        break;
    case 3:
        console.log("Функция никогда не оптимизируема");
        break;
    case 6:
        console.log("Функция возможно деоптимизирована");
        break;
    }
}

// вызовите функцию
containsWith();

% OptimizeFunctionOnNextCall(containsWith);
// Следующий вызов
containsWith();

// Проверка
printStatus(containsWith);

/*Запустите файл:

$ node --trace_opt --trace_deopt --allow-natives-syntax test.js
*/