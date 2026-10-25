'use strict';
// TicketFlow: app de demostración académica. Los datos se almacenan solo en el navegador.
const STORAGE_KEY = 'ticketflow_v1';
const $ = (selector) => document.querySelector(selector);
const VALID_STATUS = ['Pendiente', 'En proceso', 'Resuelto'];
const VALID_PRIORITY = ['Alta', 'Media', 'Baja'];
const VALID_TYPE = ['Incidencia', 'Solicitud'];
const FORM_FIELDS = ['subject','requester','area','type','priority','status','description'];
const STORAGE_SAVE_ERROR = 'No se pudo guardar el ticket en este navegador. Comprueba el espacio disponible o la configuración del almacenamiento e inténtalo de nuevo.';
let tickets = loadTickets();
let noticeTimeout;

function loadTickets() {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(value) ? value.filter(isValidTicket) : [];
  } catch (error) {
    console.warn('No se pudieron leer los datos guardados:', error);
    return [];
  }
}
function isValidTicket(ticket) {
  return ticket !== null && typeof ticket === 'object' && !Array.isArray(ticket)
    && typeof ticket.id === 'string' && ticket.id.trim() !== ''
    && ['subject','requester','area','description'].every(field => typeof ticket[field] === 'string' && ticket[field].trim() !== '')
    && VALID_TYPE.includes(ticket.type)
    && VALID_PRIORITY.includes(ticket.priority)
    && VALID_STATUS.includes(ticket.status);
}
function saveTickets() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets)); return true; }
  catch (error) { console.error(error); return false; }
}
function uniqueId() { return typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `tf-${Date.now()}-${Math.random().toString(36).slice(2)}`; }
function escapeHtml(value) { return String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char])); }
function dateText(iso) { const d = new Date(iso); return Number.isNaN(d.getTime()) ? '—' : new Intl.DateTimeFormat('es-PE',{day:'2-digit',month:'2-digit',year:'numeric'}).format(d); }
function codeFor(number) { return `TK-${String(number).padStart(4,'0')}`; }
function nextCode() { const max = tickets.reduce((m,t) => Math.max(m, Number(String(t.code || '').replace('TK-','')) || 0), 0); return codeFor(max + 1); }
function toast(message) { const el = $('#toast'); el.textContent = message; el.classList.add('show'); clearTimeout(noticeTimeout); noticeTimeout = setTimeout(() => el.classList.remove('show'), 2800); }
function getFilteredTickets() {
  const term = $('#search').value.trim().toLocaleLowerCase('es');
  const status = $('#filterStatus').value, priority = $('#filterPriority').value, type = $('#filterType').value;
  const filtered = tickets.filter(t => (!status || t.status === status) && (!priority || t.priority === priority) && (!type || t.type === type) && (!term || [t.code,t.subject,t.requester,t.area,t.description].some(v => String(v||'').toLocaleLowerCase('es').includes(term))));
  return filtered.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
}
function render() {
  $('#statTotal').textContent = tickets.length;
  $('#statPending').textContent = tickets.filter(t => t.status === 'Pendiente').length;
  $('#statProgress').textContent = tickets.filter(t => t.status === 'En proceso').length;
  $('#statResolved').textContent = tickets.filter(t => t.status === 'Resuelto').length;
  const filtered = getFilteredTickets();
  $('#ticketRows').innerHTML = filtered.map(t => `<tr><td class="code">${escapeHtml(t.code)}</td><td><strong>${escapeHtml(t.subject)}</strong><small>${escapeHtml(t.requester)} · ${escapeHtml(t.area)}</small></td><td>${escapeHtml(t.type)}</td><td><span class="pill priority-${escapeHtml(t.priority)}">${escapeHtml(t.priority)}</span></td><td><span class="pill status-${escapeHtml(t.status.replaceAll(' ','-'))}">${escapeHtml(t.status)}</span></td><td>${dateText(t.createdAt)}</td><td><div class="row-actions"><button class="small-btn" data-action="edit" data-id="${escapeHtml(t.id)}" aria-label="Editar ${escapeHtml(t.code)}">Editar</button><button class="small-btn danger" data-action="delete" data-id="${escapeHtml(t.id)}" aria-label="Eliminar ${escapeHtml(t.code)}">Eliminar</button></div></td></tr>`).join('');
  $('#emptyState').hidden = filtered.length !== 0;
  $('#countLabel').textContent = `${filtered.length} de ${tickets.length} ticket(s)`;
}
function openForm(id = null) {
  $('#ticketForm').reset(); $('#formError').hidden = true;
  const t = id ? tickets.find(item => item.id === id) : null;
  $('#ticketId').value = t ? t.id : '';
  $('#dialogTitle').textContent = t ? `Editar ${t.code}` : 'Nuevo ticket';
  if (t) for (const field of FORM_FIELDS) $(`#${field}`).value = t[field];
  $('#ticketDialog').showModal(); $('#subject').focus();
}
function readForm() {
  const item = {};
  for (const field of FORM_FIELDS) item[field] = $(`#${field}`).value.trim();
  if (!item.subject || !item.requester || !item.area || !item.description) throw new Error('Completa los campos obligatorios.');
  if (!VALID_TYPE.includes(item.type) || !VALID_PRIORITY.includes(item.priority) || !VALID_STATUS.includes(item.status)) throw new Error('Selecciona opciones válidas.');
  return item;
}
$('#ticketForm').addEventListener('submit', (event) => {
  event.preventDefault();
  $('#formError').hidden = true;
  try {
    const data = readForm(), id = $('#ticketId').value;
    const previous = id ? tickets.find(t => t.id === id) : null;
    if (id && !previous) throw new Error('Este ticket ya no existe.');
    const updated = previous ? {...previous,...data,updatedAt:new Date().toISOString()} : {id:uniqueId(),code:nextCode(),createdAt:new Date().toISOString(),updatedAt:new Date().toISOString(),...data};
    const original = tickets;
    tickets = previous ? tickets.map(t => t.id === id ? updated : t) : [...tickets,updated];
    if (!saveTickets()) { tickets = original; throw new Error(STORAGE_SAVE_ERROR); }
    $('#ticketDialog').close(); render(); toast(previous ? 'Ticket actualizado correctamente.' : 'Ticket creado correctamente.');
  } catch(error) { $('#formError').textContent = error.message; $('#formError').hidden = false; }
});
$('#ticketRows').addEventListener('click', (event) => {
  const button = event.target.closest('button[data-action]'); if (!button) return;
  const {action,id} = button.dataset;
  if (action === 'edit') openForm(id);
  if (action === 'delete') { const t = tickets.find(x => x.id === id); if (!t || !confirm(`¿Eliminar el ticket ${t.code}? Esta acción no se puede deshacer.`)) return; const original = tickets; tickets = tickets.filter(x => x.id !== id); if (!saveTickets()) {tickets=original;toast('No se pudo guardar el cambio. El ticket sigue en la lista.');return;} render();toast('Ticket eliminado.'); }
});
function csvValue(value) { let s = String(value ?? ''); if (/^[\s]*[=+@-]/.test(s)) s = `'${s}`; return `"${s.replaceAll('"','""')}"`; }
$('#exportCsv').addEventListener('click', () => {
  if (!tickets.length) {toast('No hay tickets para exportar.');return;}
  const fields = [['code','Código'],['subject','Asunto'],['requester','Solicitante'],['area','Área'],['type','Tipo'],['priority','Prioridad'],['status','Estado'],['description','Descripción'],['createdAt','Creación'],['updatedAt','Actualización']];
  const rows = [fields.map(x => csvValue(x[1])).join(';'),...tickets.map(t => fields.map(([key]) => csvValue(t[key])).join(';'))];
  const blob = new Blob(['\ufeff'+rows.join('\r\n')],{type:'text/csv;charset=utf-8'}), url = URL.createObjectURL(blob), link = document.createElement('a');
  link.href = url; link.download = 'ticketflow_tickets.csv'; document.body.append(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);toast('CSV descargado.');
});
$('#seedDemo').addEventListener('click', () => {
  if (tickets.length && !confirm('Se añadirán 5 tickets de ejemplo a tus registros. ¿Continuar?')) return;
  const samples = [
    ['Sin acceso a red Wi-Fi','María Torres','Administración','Incidencia','Alta','Pendiente','La laptop no se conecta a la red institucional.'],
    ['Instalación de software','Luis Ramos','Contabilidad','Solicitud','Media','En proceso','Solicita herramienta de edición de documentos.'],
    ['Impresora sin respuesta','Ana Medina','Recursos Humanos','Incidencia','Media','Resuelto','No se puede imprimir desde el equipo de oficina.'],
    ['Habilitación de usuario','Carlos Vega','Logística','Solicitud','Baja','Pendiente','Creación de acceso a la plataforma interna.'],
    ['Equipo con lentitud','Paola Díaz','Tesorería','Incidencia','Alta','En proceso','El equipo tarda demasiado en iniciar.']
  ];
  const max = tickets.reduce((m,t) => Math.max(m,Number(String(t.code||'').replace('TK-',''))||0),0);
  const now = new Date().toISOString(); const original = tickets;
  tickets = [...tickets,...samples.map((values,i) => ({id:uniqueId(),code:codeFor(max+i+1),createdAt:new Date(Date.now()-(i+1)*86400000).toISOString(),updatedAt:now,...Object.fromEntries(['subject','requester','area','type','priority','status','description'].map((key,j)=>[key,values[j]]))}))];
  if (!saveTickets()) {tickets=original;toast('No se pudieron guardar los tickets de ejemplo.');return;} render();toast('Se cargaron 5 tickets de ejemplo.');
});
$('#newTicket').addEventListener('click',() => openForm());
$('#closeDialog').addEventListener('click',() => $('#ticketDialog').close());
$('#cancelDialog').addEventListener('click',() => $('#ticketDialog').close());
for (const id of ['search','filterStatus','filterPriority','filterType']) $(`#${id}`).addEventListener('input',render);
render();
