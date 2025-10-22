// Nordic UART UUIDs used by micro:bit
const NUS_SERVICE = '6e400001-b5a3-f393-e0a9-e50e24dcca9e';
const NUS_RX_CHAR = '6e400002-b5a3-f393-e0a9-e50e24dcca9e'; // write
const NUS_TX_CHAR = '6e400003-b5a3-f393-e0a9-e50e24dcca9e'; // notify

let device, server, service, rxChar, txChar;
let rxBuffer = '';

function status(s){ document.getElementById('status').textContent = s; }
function log(s){ const el=document.getElementById('log'); el.textContent += s + '\n'; el.scrollTop = el.scrollHeight; }

async function connect() {
  try {
    status('Requesting device…');
    device = await navigator.bluetooth.requestDevice({
      // keep it simple: accept all, require UART in optionalServices
      acceptAllDevices: true,
      optionalServices: [NUS_SERVICE]
    });

    device.addEventListener('gattserverdisconnected', () => { status('Disconnected'); log('Disconnected'); });

    status('Connecting GATT…');
    server = await device.gatt.connect();

    status('Getting UART service…');
    service = await server.getPrimaryService(NUS_SERVICE);

    status('Getting RX characteristic…');
    rxChar = await service.getCharacteristic(NUS_RX_CHAR); // write

    status('Getting TX characteristic…');
    txChar = await service.getCharacteristic(NUS_TX_CHAR); // notify

    status('Starting notifications…');
    await txChar.startNotifications();
    txChar.addEventListener('characteristicvaluechanged', onTx);

    status('Connected');
    log('Connected to ' + (device.name || '(unnamed)'));
  } catch (e) {
    status('Disconnected');
    log('Connect error: ' + e);
  }
}

function onTx(e){
  const dec = new TextDecoder();
  rxBuffer += dec.decode(e.target.value);
  let i;
  while ((i = rxBuffer.indexOf('\n')) >= 0) {
    const line = rxBuffer.slice(0, i);
    rxBuffer = rxBuffer.slice(i + 1);
    log('<< ' + line);
  }
}

async function sendLine(txt){
  if (!rxChar) return log('Not connected');
  const enc = new TextEncoder();
  await rxChar.writeValue(enc.encode(txt + '\n'));
  log('>> ' + txt);
}
