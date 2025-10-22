const $ = s => document.querySelector(s);
const speed = $('#speed'), speedVal = $('#speedVal');
const step  = $('#step'),  stepVal  = $('#stepVal');
const minA  = $('#minAngle'), minVal = $('#minVal');
const maxA  = $('#maxAngle'), maxVal = $('#maxVal');

$('#btnConnect').addEventListener('click', connect);
$('#btnStart').addEventListener('click', () => sendLine('START'));
$('#btnStop').addEventListener('click',  () => sendLine('STOP'));
$('#btnBeep').addEventListener('click',  () => sendLine('BEEP'));
$('#btnStatus').addEventListener('click',() => sendLine('STATUS?'));

document.querySelectorAll('[data-mode]').forEach(b=>{
  b.addEventListener('click', ()=> sendLine('MODE:' + b.dataset.mode));
});

speed.addEventListener('input', ()=> speedVal.textContent = speed.value);
speed.addEventListener('change',()=> sendLine('SPEED:' + speed.value));

step.addEventListener('input', ()=> stepVal.textContent = step.value);
step.addEventListener('change',()=> sendLine('STEP:' + step.value));

function syncRange(){
  let lo = parseInt(minA.value,10), hi = parseInt(maxA.value,10);
  if (lo >= hi) {
    if (document.activeElement === minA) lo = hi - 1; else hi = lo + 1;
    minA.value = lo; maxA.value = hi;
  }
  minVal.textContent = minA.value; maxVal.textContent = maxA.value;
}
minA.addEventListener('input', syncRange);
maxA.addEventListener('input', syncRange);
minA.addEventListener('change', ()=> { syncRange(); sendLine('RANGE:' + minA.value + ',' + maxA.value); });
maxA.addEventListener('change', ()=> { syncRange(); sendLine('RANGE:' + minA.value + ',' + maxA.value); });

document.getElementById('status').textContent = 'Disconnected';
syncRange();
