'use strict';
const store = seed(createStore());
const $ = q => document.querySelector(q);
let me = null;

function save() {
  try {
    localStorage.setItem('eduplatform', JSON.stringify({
      subs: store.subs, nextId: store.nextId,
      extra: store.users.filter(u => u.id >= 100).map(u => [u.id, u.constructor.name, u.name, u._pw]),
      state: store.users.map(u => [u.id, u.active, u.inbox])
    }));
  } catch (e) {}
}
function load() {
  try {
    const d = JSON.parse(localStorage.getItem('eduplatform') || 'null'); if (!d) return;
    d.extra.forEach(([id, t, n, p]) => store.users.push(new Registry[t](id, n, p)));
    d.state.forEach(([id, a, inbox]) => { const u = store.user(id); if (u) { u.active = a; u.inbox = inbox; } });
    store.subs = d.subs; store.nextId = d.nextId;
  } catch (e) {}
}
function fillUsers() {
  $('#user').innerHTML = store.users.map(u => `<option value="${u.id}">${esc(u.name)} — ${u.role()}</option>`).join('');
}
const run = f => { try { f(); save(); draw(); } catch (e) { alert(e.message); } };

const App = {
  login() {
    const u = store.user(Number($('#user').value));
    if (u && u.login($('#pw').value)) { me = u; $('#err').textContent = ''; $('#pw').value = ''; draw(); }
    else $('#err').textContent = 'Құпиясөз қате немесе аккаунт бұғатталған';
  },
  logout() { me.logout(); me = null; fillUsers(); draw(); },
  bell() { $('#inbox').hidden = !$('#inbox').hidden; },
  clearInbox() { me.inbox = []; save(); draw(); },
  submit: id => run(() => store.submit(me, id, $('#t' + id).value)),
  grade: id => run(() => store.grade(id, $('#g' + id).value)),
  toggle: id => run(() => store.toggle(id)),
  add: () => run(() => store.addUser($('#nt').value, $('#nn').value, $('#np').value)),
  reset() { if (confirm('Барлық деректер өшіріледі. Жалғастырасыз ба?')) { localStorage.removeItem('eduplatform'); location.reload(); } }
};

function draw() {
  $('#loginView').hidden = !!me; $('#appView').hidden = !me;
  if (!me) { $('#inbox').hidden = true; $('#content').innerHTML = ''; return; }
  $('#who').textContent = `${me.name} · ${me.role()}`;
  $('#bell').textContent = `🔔 ${me.inbox.length}`;
  $('#inbox').innerHTML = (me.inbox.length ? me.inbox.map(n => `<div>${esc(n.time)} — ${esc(n.msg)}</div>`).join('') + '<button class="alt" onclick="App.clearInbox()">Тазалау</button>' : 'Хабарлама жоқ');
  $('#content').innerHTML = me.render(store);
}
load(); fillUsers(); draw();
