(function(){
  const $ = sel => document.querySelector(sel);
  const logEl = $('#log');
  const statusEl = $('#status');
  const speed = $('#speed'), speedVal = $('#speedVal');
  const step = $('#step'), stepVal = $('#stepVal');
  const minAngle = $('#minAngle'), minVal = $('#minVal');
  const maxAngle = $('#maxAngle'), maxVal = $('#maxVal');

  const uart = new MicrobitUART();
  uart.onStatus = s => { statusEl.textContent = s; log('** ' + s); };
  uart.onLine = line => log('<< ' + line);

  function log(msg){
    logEl.textContent += msg + '\n';
    logEl.scrollTop = logEl.scrollHeight;
  }

  $('#btnConnect').addEventListener('click', async () => {
    try { await uart.connect(); uart.sendLine('STATUS?'); }
    catch(e){ log('Connect error: ' + e); }
  });
  $('#btnStart').addEventListener('click', () => uart.sendLine('START'));
  $('#btnStop').addEventListener('click', () => uart.sendLine('STOP'));
  $('#btnBeep').addEventListener('click', () => uart.sendLine('BEEP'));
  $('#btnStatus').addEventListener('click', () => uart.sendLine('STATUS?'));

  document.querySelectorAll('[data-mode]').forEach(btn => {
    btn.addEventListener('click', () => uart.sendLine('MODE:' + btn.dataset.mode));
  });

  // sliders
  speed.addEventListener('input', () => speedVal.textContent = speed.value);
  speed.addEventListener('change', () => uart.sendLine('SPEED:' + speed.value));

  step.addEventListener('input', () => stepVal.textContent = step.value);
  step.addEventListener('change', () => uart.sendLine('STEP:' + step.value));

  function syncRanges() {
    let minV = parseInt(minAngle.value, 10);
    let maxV = parseInt(maxAngle.value, 10);
    if (minV >= maxV) {
      if (document.activeElement === minAngle) minV = maxV - 1;
      else maxV = minV + 1;
      minAngle.value = minV;
      maxAngle.value = maxV;
    }
    minVal.textContent = minAngle.value;
    maxVal.textContent = maxAngle.value;
  }
  minAngle.addEventListener('input', syncRanges);
  maxAngle.addEventListener('input', syncRanges);
  minAngle.addEventListener('change', () => { syncRanges(); uart.sendLine('RANGE:' + minAngle.value + ',' + maxAngle.value); });
  maxAngle.addEventListener('change', () => { syncRanges(); uart.sendLine('RANGE:' + minAngle.value + ',' + maxAngle.value); });

  // init labels
  statusEl.textContent = 'Disconnected';
  syncRanges();
})();