const display = document.getElementById('display');
let currentInput = '';
let resetNext = false;

function appendNumber(number) {
  if (resetNext) {
    currentInput = '';
    resetNext = false;
  }
  // Prevent multiple '.' in one number
  if (number === '.' && currentInput.endsWith('.')) return;
  currentInput += number;
  updateDisplay();
}

function appendOperator(operator) {
  // Prevent operator if last character is operator or input is empty
  if (currentInput === '' && operator !== '-') return; // Allow negative at start
  if (/[\+\-\*\/\.\^%]$/.test(currentInput)) {
    currentInput = currentInput.slice(0, -1);
  }
  currentInput += operator;
  updateDisplay();
}

function updateDisplay() {
  display.value = currentInput || '0';
}

function clearDisplay() {
  currentInput = '';
  updateDisplay();
}

function clearEntry() {
  // Remove last entry (number or operator) intelligently
  if (currentInput.length === 0) return;
  currentInput = currentInput.slice(0, -1);
  updateDisplay();
}

function backspace() {
  clearEntry();
}

function calculate() {
  try {
    if (currentInput === '') return;
    // Replace characters for JS operators
    const expression = currentInput.replace(/÷/g, '/').replace(/×/g, '*').replace(/\^/g, '**');
    const result = eval(expression);
    if (result === undefined) return;
    currentInput = result.toString();
    updateDisplay();
    resetNext = true;
  } catch (error) {
    display.value = 'Error';
    currentInput = '';
    resetNext = true;
  }
}

function percentage() {
  try {
    if (currentInput === '') return;
    let value = eval(currentInput);
    value = value / 100;
    currentInput = value.toString();
    updateDisplay();
    resetNext = true;
  } catch {
    display.value = 'Error';
    currentInput = '';
    resetNext = true;
  }
}

function squareRoot() {
  try {
    if (currentInput === '') return;
    let value = eval(currentInput);
    if (value < 0) {
      display.value = 'Error';
      currentInput = '';
      resetNext = true;
      return;
    }
    value = Math.sqrt(value);
    currentInput = value.toString();
    updateDisplay();
    resetNext = true;
  } catch {
    display.value = 'Error';
    currentInput = '';
    resetNext = true;
  }
}

// Initialize display
updateDisplay();
