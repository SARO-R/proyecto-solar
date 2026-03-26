// =============================================
//  SOLAR ADVISOR — script.js
//  Lógica central: auth, evaluación, resultados
// =============================================

// ---- TABS (login/register) ----

function switchTab(tab) {
  document.getElementById('tab-login').style.display = tab === 'login' ? 'block' : 'none';
  document.getElementById('tab-register').style.display = tab === 'register' ? 'block' : 'none';
  document.querySelectorAll('.tab').forEach((el, i) => {
    el.classList.toggle('active', (i === 0 && tab === 'login') || (i === 1 && tab === 'register'));
  });
  const errEl = document.getElementById('login-error');
  const sucEl = document.getElementById('login-success');
  if (errEl) errEl.style.display = 'none';
  if (sucEl) sucEl.style.display = 'none';
}

// ---- REGISTER ----

function handleRegister() {
  const name     = document.getElementById('reg-name').value.trim();
  const email    = document.getElementById('reg-email').value.trim();
  const phone    = document.getElementById('reg-phone').value.trim();
  const password = document.getElementById('reg-password').value;

  const errEl = document.getElementById('login-error');
  const sucEl = document.getElementById('login-success');

  if (!name || !email || !phone || !password) {
    return showMsg(errEl, 'Por favor completa todos los campos.');
  }
  if (!isValidEmail(email)) {
    return showMsg(errEl, 'Ingresa un correo electrónico válido.');
  }
  if (password.length < 6) {
    return showMsg(errEl, 'La contraseña debe tener al menos 6 caracteres.');
  }

  const users = JSON.parse(localStorage.getItem('sa_users') || '[]');
  if (users.find(u => u.email === email)) {
    return showMsg(errEl, 'Ya existe una cuenta con ese correo.');
  }

  users.push({ name, email, phone, password });
  localStorage.setItem('sa_users', JSON.stringify(users));
  showMsg(sucEl, '¡Cuenta creada! Ya puedes iniciar sesión.');
  errEl.style.display = 'none';

  setTimeout(() => switchTab('login'), 1500);
}

// ---- LOGIN ----

function handleLogin() {
  const email    = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;

  const errEl = document.getElementById('login-error');

  if (!email || !password) {
    return showMsg(errEl, 'Completa el correo y la contraseña.');
  }

  const users = JSON.parse(localStorage.getItem('sa_users') || '[]');
  const user = users.find(u => u.email === email && u.password === password);

  if (!user) {
    return showMsg(errEl, 'Correo o contraseña incorrectos.');
  }

  localStorage.setItem('sa_current_user', JSON.stringify(user));
  window.location.href = 'Dashboard.html';
}

// ---- LOGOUT ----

function handleLogout() {
  localStorage.removeItem('sa_current_user');
  window.location.href = 'index.html';
}

// ---- EVALUACIÓN ----

function handleEvaluation() {
  const errEl = document.getElementById('form-error');

  const nombre    = document.getElementById('f-nombre')?.value.trim();
  const lugar     = document.getElementById('f-lugar')?.value;
  const ciudad    = document.getElementById('f-ciudad')?.value.trim();
  const id        = document.getElementById('f-id')?.value;
  const consumo   = parseFloat(document.getElementById('f-consumo')?.value);
  const tarifa    = parseFloat(document.getElementById('f-tarifa')?.value);
  const area      = parseFloat(document.getElementById('f-area')?.value);
  const exposicion = document.getElementById('f-exposicion')?.value;

  if (!exposicion) {
    return showMsg(errEl, 'Selecciona un nivel de exposición solar.');
  }

  // ---- Cálculos ----
  const HSP = exposicion === 'alta' ? 5.5 : exposicion === 'media' ? 4.0 : 2.5;
  const potenciaPanel = 0.4;   // kWp por panel
  const areaPanel     = 1.8;   // m² por panel
  const precioPanel   = 850000; // COP por panel
  const costosExtra   = 1200000; // instalación, inversores, etc.
  const perdidas      = 0.15;

  const paneles    = Math.max(1, Math.floor((area * 0.7) / areaPanel));
  const produccion = paneles * potenciaPanel * HSP * 30 * (1 - perdidas);
  const cobertura  = Math.min((produccion / consumo) * 100, 150);
  const energiaCubierta = Math.min(produccion, consumo);
  const ahorro     = Math.round(energiaCubierta * tarifa);
  const inversion  = paneles * precioPanel + costosExtra;
  const payback    = ahorro > 0 ? (inversion / ahorro) / 12 : 99;

  // ---- Resultado según lógica de negocio ----
  let result;
  if (exposicion === 'alta' && consumo > 200) {
    result = 'Altamente recomendable';
  } else if (exposicion === 'media') {
    result = 'Moderadamente recomendable';
  } else {
    result = 'No recomendable';
  }

  const evalData = {
    id, nombre, lugar, ciudad, consumo, tarifa, area, exposicion,
    paneles, produccion, cobertura, ahorro, inversion, payback, result,
    fecha: new Date().toLocaleDateString('es-CO')
  };

  // Guardar último resultado y en historial
  localStorage.setItem('sa_last_result', JSON.stringify(evalData));

  const history = JSON.parse(localStorage.getItem('sa_evaluations') || '[]');
  history.push(evalData);
  localStorage.setItem('sa_evaluations', JSON.stringify(history));

  window.location.href = 'resultados.html';
}

// ---- HELPERS ----

function showMsg(el, msg) {
  if (!el) return;
  el.textContent = msg;
  el.style.display = 'block';
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Permitir Enter en inputs del login
document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    const loginTab = document.getElementById('tab-login');
    const regTab   = document.getElementById('tab-register');
    if (loginTab && loginTab.style.display !== 'none') handleLogin();
    else if (regTab && regTab.style.display !== 'none') handleRegister();
  }
});
