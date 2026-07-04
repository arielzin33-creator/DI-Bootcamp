/* ── DOM refs ── */
const apiKeyInput = document.getElementById('apiKeyInput');
const loadBtn = document.getElementById('loadBtn');
const fromSel = document.getElementById('fromCurrency');
const toSel = document.getElementById('toCurrency');
const amountInput = document.getElementById('amount');
const convertBtn = document.getElementById('convertBtn');
const switchBtn = document.getElementById('switchBtn');
const resultBox = document.getElementById('result');
const resultMain = document.getElementById('resultMain');
const resultRate = document.getElementById('resultRate');
const statusEl = document.getElementById('status');

let apiKey = '';

/* ── helpers ── */
function showStatus(msg, type = 'error') {
    statusEl.textContent = msg;
    statusEl.className = `status ${type}`;
}

function clearStatus() {
    statusEl.className = 'status';
    statusEl.textContent = '';
}

function setLoading(btn, isLoading, label = 'Convert') {
    btn.disabled = isLoading;
    btn.innerHTML = isLoading ?
        `<span class="spinner"></span> Loading…` :
        label;
}

/* ── 1. Load supported currencies ── */
async function loadCurrencies() {
    apiKey = apiKeyInput.value.trim();
    if (!apiKey) { showStatus('Please enter an API key first.'); return; }

    clearStatus();
    setLoading(loadBtn, true, 'Load Rates');

    try {
        const url = `https://v6.exchangerate-api.com/v6/${apiKey}/codes`;
        const res = await fetch(url);
        const data = await res.json();

        if (data.result === 'error') {
            throw new Error(data['error-type'] || 'API error');
        }

        // data.supported_codes → array of [code, name]
        const codes = data.supported_codes;
        populateSelects(codes);
        showStatus(`✓ ${codes.length} currencies loaded.`, 'info');

        fromSel.disabled = false;
        toSel.disabled = false;
        convertBtn.disabled = false;
        switchBtn.disabled = false;

        // sensible defaults
        setSelectValue(fromSel, 'USD');
        setSelectValue(toSel, 'EUR');

    } catch (err) {
        showStatus(`Failed to load currencies: ${err.message}. Check your API key and try again.`);
    } finally {
        setLoading(loadBtn, false, 'Load Rates');
        loadBtn.textContent = 'Load Rates';
        loadBtn.disabled = false;
    }
}

function populateSelects(codes) {
    [fromSel, toSel].forEach(sel => {
        sel.innerHTML = '';
        codes.forEach(([code, name]) => {
            const opt = document.createElement('option');
            opt.value = code;
            opt.textContent = `${code} — ${name}`;
            sel.appendChild(opt);
        });
    });
}

function setSelectValue(sel, val) {
    const opt = [...sel.options].find(o => o.value === val);
    if (opt) sel.value = val;
}

/* ── 2. Convert ── */
async function convert() {
    const from = fromSel.value;
    const to = toSel.value;
    const amount = parseFloat(amountInput.value);

    if (!from || !to) { showStatus('Please select both currencies.'); return; }
    if (isNaN(amount) || amount < 0) { showStatus('Please enter a valid non-negative amount.'); return; }

    clearStatus();
    resultBox.classList.remove('visible');
    setLoading(convertBtn, true);

    try {
        // Pair conversion endpoint with optional AMOUNT
        const url = `https://v6.exchangerate-api.com/v6/${apiKey}/pair/${from}/${to}/${amount}`;
        const res = await fetch(url);
        const data = await res.json();

        if (data.result === 'error') {
            throw new Error(data['error-type'] || 'Conversion error');
        }

        const converted = data.conversion_result; // amount already converted
        const rate = data.conversion_rate;

        resultMain.innerHTML = `${formatNumber(amount)} <span>${from}</span> = ${formatNumber(converted)} <span>${to}</span>`;
        resultRate.textContent = `1 ${from} = ${rate} ${to}  ·  Last updated: ${new Date(data.time_last_update_unix * 1000).toUTCString()}`;
        resultBox.classList.add('visible');

    } catch (err) {
        showStatus(`Conversion failed: ${err.message}`);
    } finally {
        convertBtn.disabled = false;
        convertBtn.textContent = 'Convert';
    }
}

function formatNumber(n) {
    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 6,
    }).format(n);
}

/* ── 3. Switch currencies (bonus) ── */
function switchCurrencies() {
    const fromVal = fromSel.value;
    const toVal = toSel.value;
    fromSel.value = toVal;
    toSel.value = fromVal;

    // visual spin
    switchBtn.classList.add('spinning');
    setTimeout(() => switchBtn.classList.remove('spinning'), 300);

    // auto-reconvert if a result is already showing
    if (resultBox.classList.contains('visible')) convert();
}

/* ── event listeners ── */
loadBtn.addEventListener('click', loadCurrencies);
apiKeyInput.addEventListener('keydown', e => { if (e.key === 'Enter') loadCurrencies(); });
convertBtn.addEventListener('click', convert);
switchBtn.addEventListener('click', switchCurrencies);