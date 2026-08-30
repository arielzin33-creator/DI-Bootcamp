// ⚠️  Replace with your own key from https://www.exchangerate-api.com/
const API_KEY = 'YOUR_API_KEY_HERE';
const BASE_URL = `https://v6.exchangerate-api.com/v6/${API_KEY}`;

// DOM elements
const amountInput    = document.getElementById('amount');
const fromSelect     = document.getElementById('fromCurrency');
const toSelect       = document.getElementById('toCurrency');
const convertBtn     = document.getElementById('convertBtn');
const switchBtn      = document.getElementById('switchBtn');
const resultDiv      = document.getElementById('result');
const loadingDiv     = document.getElementById('loading');
const errorDiv       = document.getElementById('error');

// ── Helpers ────────────────────────────────────────────────────────────────

function showLoading() {
  loadingDiv.classList.remove('hidden');
  resultDiv.classList.add('hidden');
  errorDiv.classList.add('hidden');
}

function hideLoading() {
  loadingDiv.classList.add('hidden');
}

function showError(msg) {
  hideLoading();
  errorDiv.textContent = msg;
  errorDiv.classList.remove('hidden');
  resultDiv.classList.add('hidden');
}

function showResult(fromCode, toCode, amount, convertedAmount, rate) {
  hideLoading();
  errorDiv.classList.add('hidden');
  resultDiv.innerHTML = `
    <span>${amount} ${fromCode} =</span>
    <span class="converted-amount">${convertedAmount.toFixed(4)} ${toCode}</span>
    <span class="rate-info">1 ${fromCode} = ${rate} ${toCode}</span>
  `;
  resultDiv.classList.remove('hidden');
}

function populateSelect(select, currencies, defaultCode) {
  select.innerHTML = '';
  currencies.forEach(([code, name]) => {
    const option = document.createElement('option');
    option.value = code;
    option.textContent = `${code} — ${name}`;
    if (code === defaultCode) option.selected = true;
    select.appendChild(option);
  });
}

// ── Fetch supported currencies ─────────────────────────────────────────────

async function loadCurrencies() {
  try {
    const res = await fetch(`${BASE_URL}/codes`);
    if (!res.ok) throw new Error('Failed to load currencies');
    const data = await res.json();

    if (data.result === 'error') throw new Error(data['error-type']);

    const currencies = data.supported_codes; // [[code, name], …]
    populateSelect(fromSelect, currencies, 'USD');
    populateSelect(toSelect,   currencies, 'EUR');
    convertBtn.disabled = false;

    // Run an initial conversion on load
    convert();
  } catch (err) {
    showError(`Could not load currencies: ${err.message}`);
  }
}

// ── Convert ────────────────────────────────────────────────────────────────

async function convert() {
  const from   = fromSelect.value;
  const to     = toSelect.value;
  const amount = parseFloat(amountInput.value);

  if (!from || !to) return;
  if (isNaN(amount) || amount < 0) {
    showError('Please enter a valid amount.');
    return;
  }

  showLoading();

  try {
    // Pair conversion with optional amount supplied in the URL
    const res = await fetch(`${BASE_URL}/pair/${from}/${to}/${amount}`);
    if (!res.ok) throw new Error('Network error');
    const data = await res.json();

    if (data.result === 'error') throw new Error(data['error-type']);

    showResult(from, to, amount, data.conversion_result, data.conversion_rate);
  } catch (err) {
    showError(`Conversion failed: ${err.message}`);
  }
}

// ── Switch button ──────────────────────────────────────────────────────────

function switchCurrencies() {
  const temp = fromSelect.value;
  fromSelect.value = toSelect.value;
  toSelect.value   = temp;

  // Animate the icon
  switchBtn.classList.add('spinning');
  setTimeout(() => switchBtn.classList.remove('spinning'), 300);

  convert();
}

// ── Event listeners ────────────────────────────────────────────────────────

convertBtn.addEventListener('click', convert);
switchBtn.addEventListener('click', switchCurrencies);

// Also convert when pressing Enter in the amount field
amountInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') convert();
});

// ── Init ───────────────────────────────────────────────────────────────────

loadCurrencies();
