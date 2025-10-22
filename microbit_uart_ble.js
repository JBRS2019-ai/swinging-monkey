(function(){
  // Nordic UART Service UUIDs used by micro:bit
  const NUS_SERVICE = '6e400001-b5a3-f393-e0a9-e50e24dcca9e';
  const NUS_RX_CHAR = '6e400002-b5a3-f393-e0a9-e50e24dcca9e'; // write
  const NUS_TX_CHAR = '6e400003-b5a3-f393-e0a9-e50e24dcca9e'; // notify

  class MicrobitUART {
    constructor() {
      this.device = null;
      this.server = null;
      this.service = null;
      this.rx = null;
      this.tx = null;
      this.buffer = '';
      this.onLine = null; // callback(line)
      this.onStatus = null; // callback(text)
    }
    _status(s){ if(this.onStatus) this.onStatus(s); }
    async connect() {
      const dev = await navigator.bluetooth.requestDevice({
        filters: [{ namePrefix: 'BBC' }, { namePrefix: 'micro:bit' }],
        optionalServices: [NUS_SERVICE]
      });
      this.device = dev;
      this.device.addEventListener('gattserverdisconnected', () => this._status('Disconnected'));
      this._status('Connecting...');
      this.server = await dev.gatt.connect();
      this.service = await this.server.getPrimaryService(NUS_SERVICE);
      this.rx = await this.service.getCharacteristic(NUS_RX_CHAR);
      this.tx = await this.service.getCharacteristic(NUS_TX_CHAR);
      await this.tx.startNotifications();
      this.tx.addEventListener('characteristicvaluechanged', e => {
        const dec = new TextDecoder();
        this.buffer += dec.decode(e.target.value);
        let idx;
        while ((idx = this.buffer.indexOf('\n')) >= 0) {
          const line = this.buffer.slice(0, idx);
          this.buffer = this.buffer.slice(idx + 1);
          if (this.onLine) this.onLine(line);
        }
      });
      this._status('Connected to ' + (dev.name || '(unnamed)'));
    }
    async sendLine(s) {
      if (!this.rx) throw new Error('Not connected');
      const enc = new TextEncoder();
      await this.rx.writeValue(enc.encode(s + '\n'));
    }
  }
  window.MicrobitUART = MicrobitUART;
})();