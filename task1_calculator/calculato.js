const screen = document.getElementById("screen");
const historyEl = document.getElementById("history");
const pad = document.getElementById("pad");

let expr = "";

function show() {
    screen.textContent = expr || "0";
}


function sanitize(s) {
    const allow = /^[0-9+\-*/().%\s]*$/;
    if (!allow.test(s)) throw new Error("Bad chars");
}


function solveExpression(s) {
    sanitize(s);


    s = s.replace(/(\d+(\.\d+)?)%/g, "($1/100)");

    const fn = new Function("return (" + s + ");");
    let ans = fn();

    if (!isFinite(ans)) throw new Error("Math error");


    ans = Math.round((ans + Number.EPSILON) * 1e12) / 1e12;

    return String(ans);
}


function addDigit(d) {
    if (d === ".") {
        let last = expr.split(/[\+\-\*\/\(\)]/).pop();
        if (last.includes(".")) return;
        if (last === "") d = "0.";
    }
    expr += d;
    show();
}

function addOp(op) {
    if (!expr) {
        if (op === "-") {
            expr = "-";
            show();
            return;
        }
        if (op === "(") {
            expr = "(";
            show();
            return;
        }
        return;
    }

    if (/[+\-*/]$/.test(expr)) {
        expr = expr.slice(0, -1) + op;
    } else {
        expr += op;
    }
    show();
}

function clearAll() {
    expr = "";
    historyEl.textContent = "";
    show();
}

function bk() {
    expr = expr.slice(0, -1);
    show();
}

function toggleSign() {
    let m = expr.match(/(.*?)(-?\d+(\.\d+)?)$/);
    if (!m) return;

    let left = m[1];
    let num = m[2];

    if (num.startsWith("-")) expr = left + num.slice(1);
    else expr = left + "-" + num;

    show();
}

function percent() {
    let m = expr.match(/(.*?)(\d+(\.\d+)?)$/);
    if (!m) return;

    expr = m[1] + "(" + m[2] + "/100)";
    show();
}

function calculate() {
    try {
        let result = solveExpression(expr);
        historyEl.textContent = expr + " =";
        expr = result;
        show();
    } catch (err) {
        screen.textContent = "Error";
        setTimeout(show, 800);
    }
}

pad.addEventListener("click", function(e) {
    let btn = e.target.closest("button");
    if (!btn) return;

    let action = btn.dataset.action;
    let v = btn.dataset.value;

    if (action === "digit") addDigit(v);
    else if (action === "operator") addOp(v);
    else if (action === "evaluate") calculate();
    else if (action === "clear") clearAll();
    else if (action === "backspace") bk();
    else if (action === "plusminus") toggleSign();
    else if (action === "percent") percent();
    else if (action === "lparen") { expr += "(";
        show(); } else if (action === "rparen") { expr += ")";
        show(); }
});

show();