'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const appSource = fs.readFileSync(path.join(__dirname, '..', 'app.js'), 'utf8');
const requiredFields = ['subject', 'requester', 'area', 'description'];
const validForm = {
  subject: 'No funciona la red',
  requester: 'María Pérez',
  area: 'Administración',
  type: 'Incidencia',
  priority: 'Alta',
  status: 'Pendiente',
  description: 'No hay conexión en el equipo.'
};

function createApp({ failWrites = false, initialTickets = [] } = {}) {
  const elements = new Map();
  let storedValue = JSON.stringify(initialTickets);
  let writeCount = 0;

  function getElement(selector) {
    if (!elements.has(selector)) {
      elements.set(selector, {
        value: '',
        textContent: '',
        innerHTML: '',
        hidden: false,
        open: false,
        handlers: {},
        classList: { add() {}, remove() {} },
        addEventListener(name, handler) { this.handlers[name] = handler; },
        reset() {},
        showModal() { this.open = true; },
        close() { this.open = false; },
        focus() {}
      });
    }
    return elements.get(selector);
  }

  for (const selector of ['#search', '#filterStatus', '#filterPriority', '#filterType']) {
    getElement(selector).value = '';
  }

  const context = {
    Blob,
    Date,
    Intl,
    JSON,
    Math,
    URL,
    clearTimeout() {},
    confirm: () => true,
    console: { error() {}, warn() {} },
    crypto: { randomUUID: () => 'ticket-id' },
    document: {
      body: { append() {} },
      createElement: () => getElement('link'),
      querySelector: getElement
    },
    localStorage: {
      getItem() { return storedValue; },
      setItem(_key, value) {
        writeCount += 1;
        if (failWrites) throw new Error('Storage is full');
        storedValue = value;
      }
    },
    setTimeout: () => 1
  };

  vm.runInNewContext(appSource, context, { filename: 'app.js' });

  return {
    element: getElement,
    get writeCount() { return writeCount; },
    get storedValue() { return storedValue; },
    submit() {
      getElement('#ticketForm').handlers.submit({ preventDefault() {} });
    }
  };
}

function fillValidForm(app) {
  for (const [field, value] of Object.entries(validForm)) {
    app.element(`#${field}`).value = value;
  }
}

for (const field of requiredFields) {
  test(`rechaza ${field} vacío`, () => {
    const app = createApp();
    fillValidForm(app);
    app.element(`#${field}`).value = '';

    app.submit();

    assert.equal(app.element('#formError').hidden, false);
    assert.match(app.element('#formError').textContent, /campos obligatorios/i);
    assert.equal(app.writeCount, 0);
    assert.equal(app.element('#statTotal').textContent, 0);
  });

  test(`rechaza ${field} con solo espacios`, () => {
    const app = createApp();
    fillValidForm(app);
    app.element(`#${field}`).value = '   \t ';

    app.submit();

    assert.equal(app.element('#formError').hidden, false);
    assert.match(app.element('#formError').textContent, /campos obligatorios/i);
    assert.equal(app.writeCount, 0);
  });
}

test('rechaza estados que no están permitidos', () => {
  const app = createApp();
  fillValidForm(app);
  app.element('#status').value = 'Cerrado';

  app.submit();

  assert.equal(app.element('#formError').hidden, false);
  assert.match(app.element('#formError').textContent, /opciones válidas/i);
  assert.equal(app.writeCount, 0);
});

test('muestra un error junto al formulario si localStorage falla y revierte el cambio', () => {
  const app = createApp({ failWrites: true });
  fillValidForm(app);
  app.element('#ticketDialog').open = true;

  app.submit();

  assert.equal(app.writeCount, 1);
  assert.equal(app.element('#formError').hidden, false);
  assert.match(app.element('#formError').textContent, /no se pudo guardar el ticket/i);
  assert.equal(app.element('#ticketDialog').open, true);
  assert.equal(app.element('#statTotal').textContent, 0);
});

test('guarda un ticket válido y actualiza los indicadores', () => {
  const app = createApp();
  fillValidForm(app);

  app.submit();

  assert.equal(app.writeCount, 1);
  assert.equal(JSON.parse(app.storedValue).length, 1);
  assert.equal(app.element('#statTotal').textContent, 1);
  assert.equal(app.element('#statPending').textContent, 1);
  assert.equal(app.element('#formError').hidden, true);
});

test('aplica los filtros a la tabla sin cambiar los indicadores globales', () => {
  const app = createApp({
    initialTickets: [
      { id: '1', code: 'TK-0001', subject: 'Red caída', requester: 'Ana', area: 'TI', description: 'Sin conexión', type: 'Incidencia', priority: 'Alta', status: 'Pendiente', createdAt: '2026-01-01' },
      { id: '2', code: 'TK-0002', subject: 'Nuevo acceso', requester: 'Luis', area: 'TI', description: 'Cuenta nueva', type: 'Solicitud', priority: 'Media', status: 'Resuelto', createdAt: '2026-01-02' }
    ]
  });
  app.element('#filterStatus').value = 'Pendiente';
  app.element('#filterStatus').handlers.input();

  assert.equal(app.element('#statTotal').textContent, 2);
  assert.equal(app.element('#statPending').textContent, 1);
  assert.equal(app.element('#countLabel').textContent, '1 de 2 ticket(s)');
  assert.match(app.element('#ticketRows').innerHTML, /Red caída/);
  assert.doesNotMatch(app.element('#ticketRows').innerHTML, /Nuevo acceso/);
});
