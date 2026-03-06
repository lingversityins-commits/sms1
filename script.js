// ============================================
//   BASIC CALCULATOR — script.js
//   Uses: HTML buttons → calls these functions
// ============================================

// ── CALCULATOR STATE (memory variables) ──
var currentNumber  = "0";    // The number currently shown on screen
var firstNumber    = null;   // The first number (stored when operator is pressed)
var operator       = null;   // Current operator: +, -, *, /
var freshStart     = false;  // If true, next digit starts a new number

// ── GET DISPLAY ELEMENTS ──
var currentDisplay = document.getElementById("current");
var historyDisplay = document.getElementById("history");


// ============================================
//   UPDATE THE SCREEN
// ============================================
function updateScreen() {
  currentDisplay.textContent = currentNumber;

  // Remove any old size/error classes
  currentDisplay.classList.remove("medium", "small", "error");

  // Shrink font if the number is long
  if (currentNumber.length > 12) {
    currentDisplay.classList.add("small");
  } else if (currentNumber.length > 8) {
    currentDisplay.classList.add("medium");
  }
}


// ============================================
//   PRESS A DIGIT (0–9)
// ============================================
function pressDigit(digit) {
  // If we just pressed "=" or an operator, start fresh
  if (freshStart) {
    currentNumber = digit;
    freshStart = false;
  } else {
    // Don't allow more than 12 digits
    if (currentNumber.length >= 12) return;

    // Replace the "0" placeholder, or add the digit
    if (currentNumber === "0") {
      currentNumber = digit;
    } else {
      currentNumber = currentNumber + digit;
    }
  }

  updateScreen();
}


// ============================================
//   PRESS DECIMAL POINT ( . )
// ============================================
function pressDot() {
  // Start fresh if needed
  if (freshStart) {
    currentNumber = "0.";
    freshStart = false;
    updateScreen();
    return;
  }

  // Only add a dot if there isn't one already
  if (currentNumber.indexOf(".") === -1) {
    currentNumber = currentNumber + ".";
    updateScreen();
  }
}


// ============================================
//   SET OPERATOR (+, -, *, /)
// ============================================
function setOperator(op) {
  // Highlight the active operator button
  highlightOperator(op);

  var current = parseFloat(currentNumber);

  // If there's already a pending operation, calculate it first
  if (firstNumber !== null && operator !== null && !freshStart) {
    var result = compute(firstNumber, current, operator);
    currentNumber = formatResult(result);
    updateScreen();
    firstNumber = result;
  } else {
    firstNumber = current;
  }

  operator   = op;
  freshStart = true;  // Next digit will start a new number

  // Show history hint: e.g. "42 +"
  var symbol = opSymbol(op);
  historyDisplay.textContent = formatResult(firstNumber) + " " + symbol;
}


// ============================================
//   CALCULATE — press "="
// ============================================
function calculate() {
  // Nothing to calculate if no operator was set
  if (firstNumber === null || operator === null) return;

  var current = parseFloat(currentNumber);
  var result  = compute(firstNumber, current, operator);

  // Show what was calculated in the history line
  var symbol = opSymbol(operator);
  historyDisplay.textContent =
    formatResult(firstNumber) + " " + symbol + " " + formatResult(current) + " =";

  // Handle errors (e.g. divide by zero)
  if (!isFinite(result) || isNaN(result)) {
    currentNumber = "Error";
    currentDisplay.textContent = currentNumber;
    currentDisplay.classList.add("error");
  } else {
    currentNumber = formatResult(result);
    updateScreen();
  }

  // Reset state for next calculation
  firstNumber = null;
  operator    = null;
  freshStart  = true;

  // Remove operator button highlight
  clearHighlight();
}


// ============================================
//   COMPUTE — the actual math
// ============================================
function compute(a, b, op) {
  if (op === "+") return a + b;
  if (op === "-") return a - b;
  if (op === "*") return a * b;
  if (op === "/") return a / b;
  return b;
}


// ============================================
//   CLEAR ALL — reset the calculator (AC)
// ============================================
function clearAll() {
  currentNumber  = "0";
  firstNumber    = null;
  operator       = null;
  freshStart     = false;

  historyDisplay.textContent = "";
  currentDisplay.classList.remove("error", "medium", "small");
  clearHighlight();

  updateScreen();
}


// ============================================
//   TOGGLE SIGN — flip positive/negative
// ============================================
function toggleSign() {
  if (currentNumber === "0" || currentNumber === "Error") return;

  if (currentNumber.charAt(0) === "-") {
    // Remove the minus sign
    currentNumber = currentNumber.slice(1);
  } else {
    // Add a minus sign
    currentNumber = "-" + currentNumber;
  }

  updateScreen();
}


// ============================================
//   PERCENT — divide by 100
// ============================================
function percent() {
  var value = parseFloat(currentNumber);
  if (isNaN(value)) return;
  currentNumber = formatResult(value / 100);
  updateScreen();
}


// ============================================
//   FORMAT RESULT — clean up long decimals
// ============================================
function formatResult(num) {
  // Limit to 10 significant digits to avoid floating point mess
  var result = parseFloat(num.toPrecision(10));
  return result.toString();
}


// ============================================
//   OPERATOR SYMBOL — get display character
// ============================================
function opSymbol(op) {
  if (op === "+") return "+";
  if (op === "-") return "−";
  if (op === "*") return "×";
  if (op === "/") return "÷";
  return op;
}


// ============================================
//   HIGHLIGHT ACTIVE OPERATOR BUTTON
// ============================================
function highlightOperator(op) {
  // Remove active class from all operator buttons first
  clearHighlight();

  // Find the button for this operator and highlight it
  var allButtons = document.querySelectorAll(".btn-operator");
  var opMap = { "+": "+", "-": "−", "*": "×", "/": "÷" };

  for (var i = 0; i < allButtons.length; i++) {
    if (allButtons[i].textContent === opMap[op]) {
      allButtons[i].classList.add("active");
      break;
    }
  }
}

function clearHighlight() {
  var allButtons = document.querySelectorAll(".btn-operator");
  for (var i = 0; i < allButtons.length; i++) {
    allButtons[i].classList.remove("active");
  }
}


// ============================================
//   KEYBOARD SUPPORT
//   Allows typing numbers and operators
// ============================================
document.addEventListener("keydown", function(event) {
  var key = event.key;

  if (key >= "0" && key <= "9") {
    pressDigit(key);
  } else if (key === ".") {
    pressDot();
  } else if (key === "+") {
    setOperator("+");
  } else if (key === "-") {
    setOperator("-");
  } else if (key === "*") {
    setOperator("*");
  } else if (key === "/") {
    event.preventDefault(); // stop browser from opening search
    setOperator("/");
  } else if (key === "Enter" || key === "=") {
    calculate();
  } else if (key === "Escape") {
    clearAll();
  } else if (key === "Backspace") {
    backspace();
  }
});


// ============================================
//   BACKSPACE — delete the last digit
// ============================================
function backspace() {
  if (freshStart || currentNumber === "Error") {
    clearAll();
    return;
  }

  if (currentNumber.length <= 1) {
    currentNumber = "0";
  } else {
    currentNumber = currentNumber.slice(0, -1);
  }

  updateScreen();
}
