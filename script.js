/**
 * SOLAR ADVISOR — script.js
 * Lógica completa alineada con JIRA:
 *   RF-01 Registro | RF-02 Login | RF-03 Crear evaluación
 *   RF-04 Área techo | RF-05 Consumo | RF-06 Irradiancia
 *   RF-07 Nº paneles | RF-08 Producción | RF-09 Cobertura
 *   RF-10 Inversión  | RF-11 Ahorro    | RF-12 Payback
 *   RF-13 Recomendación | RF-14 Reporte | RF-15 Gráfica
 */

// ============================================================
// UTILIDADES
// ============================================================

function getUsers() {
  return JSON.parse(localStorage.getItem('sa_users') || '[]');
}
function saveUsers(users) {
  localStorage.setItem('sa_users', JSON.stringify(users));
}
function getCurrentUser() {
  return JSON.parse(localStorage.getItem('sa_current_user') || 'null');
}
function setCurrentUser(user) {
  localStorage.setItem('sa_current_user', JSON.stringify(user));
}
function clearCurrentUser() {
  localStorage.removeItem('sa_current_user');
}
function getEvalData() {
  return JSON.parse(localStorage.getItem('sa_eval_data') || 'null');
}
function saveEvalData(data) {
  localStorage.setItem('sa_eval_data', JSON.stringify(data));
}

function formatCOP(value) {
  return '$ ' + Math.round(value).toLocaleString('es-CO') + ' COP';
}
function formatKwh(value) {
  return value.toFixed(1) + ' kWh';
}
function clearError(id) {
  const el = document.getElementById(id);
  if (el) el.textContent = '';
}
function showError(id, msg) {
  const el = document.getElementById(id);
  if (el) el.textContent = msg;
}

// ============================================================
// AUTH — index.html
// ============================================================

function switchTab(tab) {
  const loginForm    = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const tabLogin     = document.getElementById('tabLogin');
  const tabRegister  = document.getElementById('tabRegister');
  const indicator    = document.getElementById('tabIndicator');

  if (tab === 'login') {
    loginForm.classList.remove('hidden');
    registerForm.classList.add('hidden');
    tabLogin.classList.add('active');
    tabRegister.classList.remove('active');
    indicator.classList.remove('right');
  } else {
    loginForm.classList.add('hidden');
    registerForm.classList.remove('hidden');
    tabLogin.classList.remove('active');
    tabRegister.classList.add('active');
    indicator.classList.add('right');
  }
  // Clear errors on switch
  ['errLoginEmail','errLoginPass','errLoginGlobal',
   'errRegName','errRegEmail','errRegPhone','errRegPass','errRegGlobal']
    .forEach(clearError);
}

/** HU-01 / RF-01: Registro de usuario */
function handleRegister() {
  ['errRegName','errRegEmail','errRegPhone','errRegPass','errRegGlobal'].forEach(clearError);

  const name  = document.getElementById('regName').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const phone = document.getElementById('regPhone').value.trim();
  const pass  = document.getElementById('regPass').value;

  let valid = true;

  // RNF-10: Mensajes claros de validación
  if (!name) { showError('errRegName', 'El nombre es obligatorio.'); valid = false; }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) {
    showError('errRegEmail', 'El correo es obligatorio.'); valid = false;
  } else if (!emailRegex.test(email)) {
    showError('errRegEmail', 'Ingresa un correo válido (ej: usuario@correo.com).'); valid = false;
  }

  if (!phone) { showError('errRegPhone', 'El teléfono es obligatorio.'); valid = false; }

  if (!pass) {
    showError('errRegPass', 'La contraseña es obligatoria.'); valid = false;
  } else if (pass.length < 6) {
    showError('errRegPass', 'Mínimo 6 caracteres.'); valid = false;
  }

  if (!valid) return;

  // RF-01: correo único
  const users = getUsers();
  if (users.find(u => u.email === email)) {
    showError('errRegGlobal', '⚠ Este correo ya está registrado. Inicia sesión.'); return;
  }

  // Guardar usuario
  users.push({ name, email, phone, pass });
  saveUsers(users);

  showError('errRegGlobal', '');
  // Mostrar confirmación y cambiar a login
  alert(`✅ Cuenta creada exitosamente. ¡Bienvenido, ${name}!`);
  switchTab('login');
  document.getElementById('loginEmail').value = email;
}

/** HU-02 / RF-02: Inicio de sesión */
function handleLogin() {
  ['errLoginEmail','errLoginPass','errLoginGlobal'].forEach(clearError);

  const email = document.getElementById('loginEmail').value.trim();
  const pass  = document.getElementById('loginPass').value;

  let valid = true;

  // HU-02: campos vacíos
  if (!email) { showError('errLoginEmail', 'El correo es obligatorio.'); valid = false; }
  if (!pass)  { showError('errLoginPass',  'La contraseña es obligatoria.'); valid = false; }
  if (!valid) return;

  const users = getUsers();
  const user  = users.find(u => u.email === email && u.pass === pass);

  if (!user) {
    showError('errLoginGlobal', '⚠ Credenciales incorrectas. Verifica tu correo y contraseña.'); return;
  }

  setCurrentUser(user);
  window.location.href = 'formulario.html';
}

function togglePass(inputId, btn) {
  const input = document.getElementById(inputId);
  if (!input) return;
  if (input.type === 'password') {
    input.type = 'text'; btn.textContent = '🙈';
  } else {
    input.type = 'password'; btn.textContent = '👁';
  }
}

function logout() {
  clearCurrentUser();
  window.location.href = 'index.html';
}

// ============================================================
// FORMULARIO — formulario.html
// ============================================================

/** RF-04: calcular área automáticamente de largo × ancho */
function calcularArea() {
  const largo = parseFloat(document.getElementById('largo')?.value) || 0;
  const ancho = parseFloat(document.getElementById('ancho')?.value) || 0;
  const result = document.getElementById('areaResult');
  if (result) {
    if (largo > 0 && ancho > 0) {
      result.textContent = (largo * ancho).toFixed(2) + ' m²';
    } else {
      result.textContent = '— m²';
    }
  }
}

function toggleAreaMode(mode) {
  const dimDiv = document.getElementById('modeDimensiones');
  const totDiv = document.getElementById('modeTotal');
  if (!dimDiv || !totDiv) return;
  if (mode === 'dimensiones') {
    dimDiv.classList.remove('hidden');
    totDiv.classList.add('hidden');
  } else {
    dimDiv.classList.add('hidden');
    totDiv.classList.remove('hidden');
  }
}

function limpiarFormulario() {
  ['nombreUsuario','tipoLugar','ubicacion','largo','ancho','areaTotalDirecta',
   'consumoKwh','tarifaKwh','potenciaPanel','areaPanel','precioPanel','costosAdicionales']
    .forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
  // Reset radio buttons
  document.querySelectorAll('input[name="exposicion"]').forEach(r => r.checked = false);
  document.querySelectorAll('input[name="areaMode"]').forEach((r,i) => r.checked = i === 0);
  toggleAreaMode('dimensiones');
  calcularArea();
  // Reset defaults
  const defaults = { potenciaPanel: 400, areaPanel: 2, precioPanel: 800000, costosAdicionales: 500000 };
  Object.entries(defaults).forEach(([id, val]) => {
    const el = document.getElementById(id);
    if (el) el.value = val;
  });
  ['errNombre','errTipo','errUbicacion','errArea','errConsumo','errTarifa','errExposicion'].forEach(clearError);
}

/** HU-03/04/05 — RF-03/04/05: Validar y procesar todos los campos */
function procesarEvaluacion() {
  ['errNombre','errTipo','errUbicacion','errArea','errConsumo','errTarifa','errExposicion'].forEach(clearError);

  const nombre   = document.getElementById('nombreUsuario').value.trim();
  const tipo     = document.getElementById('tipoLugar').value;
  const ubicacion = document.getElementById('ubicacion').value.trim();
  const consumo  = parseFloat(document.getElementById('consumoKwh').value);
  const tarifa   = parseFloat(document.getElementById('tarifaKwh').value);
  const expRadio = document.querySelector('input[name="exposicion"]:checked');
  const areaMode = document.querySelector('input[name="areaMode"]:checked')?.value || 'dimensiones';

  // Obtener área (RF-04)
  let areaTecho = 0;
  if (areaMode === 'dimensiones') {
    const largo = parseFloat(document.getElementById('largo').value);
    const ancho = parseFloat(document.getElementById('ancho').value);
    if (largo > 0 && ancho > 0) areaTecho = largo * ancho;
  } else {
    areaTecho = parseFloat(document.getElementById('areaTotalDirecta').value);
  }

  // Parámetros del panel
  const potenciaPanel     = parseFloat(document.getElementById('potenciaPanel').value) || 400;
  const areaPanel         = parseFloat(document.getElementById('areaPanel').value) || 2;
  const precioPanel       = parseFloat(document.getElementById('precioPanel').value) || 800000;
  const costosAdicionales = parseFloat(document.getElementById('costosAdicionales').value) || 500000;

  let valid = true;

  // RNF-06: Validar campos obligatorios
  if (!nombre)   { showError('errNombre', 'El nombre es obligatorio.'); valid = false; }
  if (!tipo)     { showError('errTipo', 'Selecciona el tipo de lugar.'); valid = false; }
  if (!ubicacion){ showError('errUbicacion', 'La ubicación es obligatoria (RF-03).'); valid = false; }

  // RF-04: Valores > 0
  if (!areaTecho || areaTecho <= 0) {
    showError('errArea', 'El área debe ser mayor a 0 m² (RF-04).'); valid = false;
  }

  // RF-05: Consumo > 0
  if (!consumo || consumo <= 0) {
    showError('errConsumo', 'El consumo debe ser mayor a 0 kWh (RF-05).'); valid = false;
  }

  if (!tarifa || tarifa <= 0) {
    showError('errTarifa', 'La tarifa debe ser mayor a 0.'); valid = false;
  }

  if (!expRadio) {
    showError('errExposicion', 'Selecciona el nivel de exposición solar.'); valid = false;
  }

  if (!valid) return;

  const exposicion = expRadio.value;

  // === MOTOR DE CÁLCULO ===

  // RF-06: Irradiancia según exposición (simulada — sin API externa)
  const irradianciaMap = { alta: 5.5, media: 4.0, baja: 2.5 };
  const horasSolPico   = irradianciaMap[exposicion];

  // RF-07: Número máximo de paneles (factor_espacio = 0.7)
  const factorEspacio  = 0.7;
  const numPaneles     = Math.floor((areaTecho * factorEspacio) / areaPanel);

  // RF-08: Producción mensual kWh
  const perdidas          = 0.15;  // 15% pérdidas sistema
  const potenciaTotal_kW  = (numPaneles * potenciaPanel) / 1000;
  const produccionMes     = potenciaTotal_kW * horasSolPico * 30 * (1 - perdidas);

  // RF-09: Cobertura %
  const cobertura         = (produccionMes / consumo) * 100;
  const energiaCubierta   = Math.min(produccionMes, consumo);
  const balance           = produccionMes - consumo;

  // RF-10: Inversión total
  const inversionTotal    = (numPaneles * precioPanel) + costosAdicionales;

  // RF-11: Ahorro mensual
  const ahorroMensual     = energiaCubierta * tarifa;

  // RF-12: Payback (meses)
  const paybackMeses      = ahorroMensual > 0 ? inversionTotal / ahorroMensual : Infinity;
  const paybackAnios      = paybackMeses / 12;

  // RF-13: Recomendación final
  // Conviene si cobertura >= 70% y payback <= 84 meses (7 años)
  let recomendacion, nivel;
  if (exposicion === 'alta' && consumo > 200) {
    recomendacion = 'Altamente recomendable';
    nivel         = 'alta';
  } else if (exposicion === 'media') {
    recomendacion = 'Moderadamente recomendable';
    nivel         = 'media';
  } else if (exposicion === 'baja') {
    recomendacion = 'No recomendable';
    nivel         = 'baja';
  } else {
    // Fallback por cobertura/payback (RF-13 completo)
    if (cobertura >= 70 && paybackMeses <= 84) {
      recomendacion = 'Altamente recomendable';
      nivel         = 'alta';
    } else if (cobertura >= 40) {
      recomendacion = 'Moderadamente recomendable';
      nivel         = 'media';
    } else {
      recomendacion = 'No recomendable actualmente';
      nivel         = 'baja';
    }
  }

  // Generar ID de evaluación (RF-03)
  const evalId = 'SA-' + Date.now().toString(36).toUpperCase();

  const evalData = {
    evalId, nombre, tipo, ubicacion, exposicion, areaTecho, areaPanel, potenciaPanel,
    numPaneles, potenciaTotal_kW, horasSolPico, produccionMes,
    consumo, tarifa, energiaCubierta, balance,
    cobertura, inversionTotal, ahorroMensual,
    paybackMeses, paybackAnios,
    recomendacion, nivel,
    precioPanel, costosAdicionales
  };

  saveEvalData(evalData);
  window.location.href = 'resultados.html';
}

// ============================================================
// RESULTADOS — resultados.html
// ============================================================

function renderResultados() {
  const data = getEvalData();
  if (!data) { window.location.href = 'formulario.html'; return; }

  // Encabezado
  const sub = document.getElementById('resHeaderSub');
  if (sub) sub.textContent = `ID: ${data.evalId} · ${data.nombre} · ${data.tipo} · ${data.ubicacion}`;

  // Verdict banner (RF-13)
  const banner = document.getElementById('verdictBanner');
  const icon   = document.getElementById('verdictIcon');
  const title  = document.getElementById('verdictTitle');
  const msg    = document.getElementById('verdictMsg');
  const badge  = document.getElementById('verdictBadge');

  const iconMap  = { alta: '☀', media: '⛅', baja: '🌥' };
  const msgMap   = {
    alta:  'Tu propiedad tiene excelentes condiciones para instalar paneles solares. La inversión se recupera en buen tiempo y tendrás alta cobertura energética.',
    media: 'Las condiciones son moderadas. El sistema solar puede funcionar, pero evalúa optimizar la orientación del techo para mejorar rendimiento.',
    baja:  'La exposición solar es insuficiente para que la inversión sea rentable con el consumo y las condiciones actuales.'
  };

  if (banner) banner.classList.add(data.nivel);
  if (icon)  icon.textContent  = iconMap[data.nivel];
  if (title) title.textContent = data.recomendacion;
  if (msg)   msg.textContent   = msgMap[data.nivel];
  if (badge) badge.textContent = data.exposicion.charAt(0).toUpperCase() + data.exposicion.slice(1) + ' exposición';

  // Métricas (RF-09 a RF-12)
  const cob = Math.min(data.cobertura, 200);
  setInner('mCobertura', data.cobertura.toFixed(1) + '%');
  setInner('mBalance', data.balance >= 0
    ? `Excedente: ${formatKwh(data.balance)}`
    : `Déficit: ${formatKwh(Math.abs(data.balance))}`);

  const barFill = document.getElementById('barCobertura');
  if (barFill) {
    setTimeout(() => { barFill.style.width = Math.min(cob, 100) + '%'; }, 200);
  }

  setInner('mPaneles', data.numPaneles + ' paneles');
  setInner('mProduccion', `Producción: ${formatKwh(data.produccionMes)}/mes`);

  setInner('mInversion', formatCOP(data.inversionTotal));
  setInner('mInvSub', `${data.numPaneles} paneles × ${formatCOP(data.precioPanel)}`);

  setInner('mAhorro', formatCOP(data.ahorroMensual) + '/mes');

  if (data.paybackMeses === Infinity || data.paybackMeses > 999) {
    setInner('mPayback', 'No calculable');
    setInner('mPaybackSub', 'Ahorro insuficiente para recuperar inversión');
  } else {
    setInner('mPayback', data.paybackAnios.toFixed(1) + ' años');
    setInner('mPaybackSub', `${Math.round(data.paybackMeses)} meses`);
  }

  setInner('mConsumoVsProd', `${formatKwh(data.produccionMes)} / ${formatKwh(data.consumo)}`);
  setInner('mConsumoSub', `Prod. mensual vs consumo mensual`);

  // Gráfica (RF-15)
  renderChart(data);

  // Reporte completo (RF-14)
  renderReport(data);
}

function setInner(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

/** RF-15: Gráfica consumo vs producción (12 meses simulados con variación estacional) */
function renderChart(data) {
  const container = document.getElementById('chartBars');
  if (!container) return;

  // Variación estacional relativa
  const seasonal = [0.90, 0.92, 1.02, 1.08, 1.10, 1.05, 1.00, 0.98, 1.04, 1.06, 0.95, 0.88];
  const meses    = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

  const maxVal = Math.max(...seasonal.map(f => data.consumo * 1.1), ...seasonal.map(f => data.produccionMes * f));

  container.innerHTML = '';

  meses.forEach((mes, i) => {
    const prod    = data.produccionMes * seasonal[i];
    const consum  = data.consumo;
    const hProd   = Math.max((prod   / maxVal) * 140, 4);
    const hConsum = Math.max((consum / maxVal) * 140, 4);

    const group = document.createElement('div');
    group.className = 'chart-bar-group';
    group.style.flexDirection = 'column';
    group.style.alignItems = 'center';

    const bars = document.createElement('div');
    bars.style.cssText = 'display:flex;gap:3px;align-items:flex-end;width:100%';

    const bC = document.createElement('div');
    bC.className = 'chart-bar consumo-bar';
    bC.style.height = '0px';
    setTimeout(() => { bC.style.height = hConsum + 'px'; }, 100 + i * 40);
    bC.title = `${mes} Consumo: ${consum.toFixed(0)} kWh`;

    const bP = document.createElement('div');
    bP.className = 'chart-bar prod-bar';
    bP.style.height = '0px';
    setTimeout(() => { bP.style.height = hProd + 'px'; }, 100 + i * 40);
    bP.title = `${mes} Producción: ${prod.toFixed(0)} kWh`;

    const label = document.createElement('div');
    label.style.cssText = 'font-size:9px;color:rgba(255,255,255,0.4);margin-top:6px;text-align:center';
    label.textContent = mes;

    bars.appendChild(bC);
    bars.appendChild(bP);
    group.appendChild(bars);
    group.appendChild(label);
    container.appendChild(group);
  });
}

/** RF-14: Reporte completo con todos los valores */
function renderReport(data) {
  const tbody = document.getElementById('reportBody');
  if (!tbody) return;

  const rows = [
    ['ID de evaluación',         data.evalId,                                        'RF-03'],
    ['Evaluador',                data.nombre,                                        'HU-01'],
    ['Tipo de lugar',            data.tipo.charAt(0).toUpperCase() + data.tipo.slice(1), 'RF-03'],
    ['Ubicación',                data.ubicacion,                                     'RF-03'],
    ['Área del techo',           data.areaTecho.toFixed(2) + ' m²',                 'RF-04'],
    ['Exposición solar',         data.exposicion.charAt(0).toUpperCase() + data.exposicion.slice(1), 'RF-06'],
    ['Horas sol pico (HSP)',     data.horasSolPico + ' h/día',                       'RF-06'],
    ['Consumo mensual',          formatKwh(data.consumo),                            'RF-05'],
    ['Tarifa energética',        formatCOP(data.tarifa) + '/kWh',                    'RF-05'],
    ['N.º paneles instalables',  data.numPaneles + ' paneles',                       'RF-07'],
    ['Potencia total instalada', (data.potenciaTotal_kW).toFixed(2) + ' kWp',        'RF-07'],
    ['Producción mensual',       formatKwh(data.produccionMes),                      'RF-08'],
    ['Cobertura energética',     data.cobertura.toFixed(1) + '%',                    'RF-09'],
    ['Balance energético',       (data.balance >= 0 ? '+' : '') + data.balance.toFixed(1) + ' kWh', 'RF-09'],
    ['Inversión total',          formatCOP(data.inversionTotal),                     'RF-10'],
    ['Ahorro mensual estimado',  formatCOP(data.ahorroMensual),                      'RF-11'],
    ['Payback',                  data.paybackMeses === Infinity ? 'No calculable' :
                                   `${Math.round(data.paybackMeses)} meses (${data.paybackAnios.toFixed(1)} años)`, 'RF-12'],
    ['Recomendación final',      data.recomendacion,                                 'RF-13'],
  ];

  tbody.innerHTML = rows.map(([param, val, rf]) => `
    <tr>
      <td>${param}</td>
      <td class="td-value">${val}</td>
      <td class="td-ref">${rf}</td>
    </tr>
  `).join('');
}

// ============================================================
// INICIALIZACIÓN
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  const path = window.location.pathname;
  const page = path.split('/').pop() || 'index.html';

  // Mostrar nombre de usuario en navbar
  const navUser = document.getElementById('navUserName');
  const user    = getCurrentUser();

  if (navUser && user) navUser.textContent = user.name || user.email;

  // Proteger rutas: formulario y resultados requieren sesión
  if ((page === 'formulario.html' || page === 'resultados.html') && !user) {
    window.location.href = 'index.html';
    return;
  }

  // Si ya hay sesión y está en index → redirigir a formulario
  if ((page === 'index.html' || page === '') && user) {
    window.location.href = 'formulario.html';
    return;
  }

  // Renderizar resultados si estamos en esa página
  if (page === 'resultados.html') {
    renderResultados();
  }
});
