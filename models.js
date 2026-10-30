'use strict';
// ---- Интерфейстер (JS-та интерфейс жоқ, сондықтан әдістер тізімі + implement() тексеруі)
const Interface = (name, methods) => ({ name, methods });
const IAuthenticatable = Interface('IAuthenticatable', ['login', 'logout']);
const IManageable = Interface('IManageable', ['updateProfile', 'deactivate', 'activate']);
const INotifiable = Interface('INotifiable', ['notify']);
function implement(cls, ...ifaces) {
  for (const i of ifaces) for (const m of i.methods)
    if (typeof cls.prototype[m] !== 'function') throw new TypeError(`${cls.name}: ${i.name}.${m}() жүзеге асырылмаған`);
  cls.interfaces = ifaces.map(i => i.name);
  return cls;
}
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const avg = a => a.length ? Math.round(a.reduce((x, y) => x + y, 0) / a.length) : '—';

// ---- Абстрактілі класс
class User {
  constructor(id, name, password) {
    if (new.target === User) throw new TypeError('User — абстрактілі класс, дана құруға болмайды');
    Object.assign(this, { id, name, _pw: password, active: true, inbox: [] });
  }
  role() { throw new Error('abstract: role()'); }
  render(store) { throw new Error('abstract: render()'); }
  login(pw) { return this.active && pw === this._pw; }
  logout() {}
  updateProfile({ name }) { if (name) this.name = name; }
  deactivate() { this.active = false; }
  activate() { this.active = true; }
  notify(msg) { this.inbox.unshift({ msg, time: new Date().toLocaleTimeString('kk-KZ') }); }
}

class Student extends User {
  role() { return 'Студент'; }
  render(s) {
    const mine = s.subs.filter(x => x.studentId === this.id);
    const grades = mine.filter(x => x.grade != null).map(x => x.grade);
    return `<div class="card">Орташа балл: <b>${avg(grades)}</b> · Жіберілген жұмыс: <b>${mine.length}</b></div>` +
      s.courses.map(c => `<div class="card"><h3>${esc(c.title)}</h3>` +
        s.assignments.filter(a => a.courseId === c.id).map(a => {
          const sub = mine.find(x => x.assignmentId === a.id);
          return `<div class="task"><b>${esc(a.title)}</b>` + (sub
            ? `<p>Жіберілді · ${sub.grade == null ? 'тексерілуде' : `<span class="ok">Баға: ${sub.grade}</span>`}</p>`
            : `<textarea id="t${a.id}" placeholder="Жауабыңызды жазыңыз"></textarea><button onclick="App.submit(${a.id})">Жіберу</button>`) + '</div>';
        }).join('') + '</div>').join('');
  }
}
class Teacher extends User {
  role() { return 'Оқытушы'; }
  render(s) {
    const mine = s.assignments.filter(a => s.courses.find(c => c.id === a.courseId).teacherId === this.id).map(a => a.id);
    const list = s.subs.filter(x => mine.includes(x.assignmentId));
    return list.length ? list.map(x => `<div class="card"><b>${esc(s.user(x.studentId).name)}</b> — ${esc(s.assignment(x.assignmentId).title)}<p>${esc(x.text)}</p>` +
      (x.grade == null ? `<input id="g${x.id}" type="number" min="0" max="100" placeholder="0–100"><button onclick="App.grade(${x.id})">Баға қою</button>` : `<span class="ok">Баға: ${x.grade}</span>`) + '</div>').join('')
      : '<div class="card">Студенттердің жұмыстары әлі түскен жоқ.</div>';
  }
}
class Administrator extends User {
  role() { return 'Әкімші'; }
  render(s) {
    return '<table><tr><th>Аты</th><th>Рөл</th><th>Күйі</th><th></th></tr>' + s.users.map(u =>
      `<tr><td>${esc(u.name)}</td><td>${u.role()}</td><td>${u.active ? 'белсенді' : 'бұғатталған'}</td><td>${u === this ? '' : `<button onclick="App.toggle(${u.id})">${u.active ? 'Бұғаттау' : 'Ашу'}</button>`}</td></tr>`).join('') +
      `</table><div class="card"><h3>Жаңа пайдаланушы</h3><input id="nn" placeholder="Аты"><input id="np" placeholder="Құпиясөз"><select id="nt">${Object.keys(Registry).filter(k => k !== 'Administrator').map(k => `<option>${k}</option>`).join('')}</select><button onclick="App.add()">Қосу</button></div>`;
  }
}
class Researcher extends User {
  role() { return 'Зерттеуші'; }
  render(s) {
    const g = s.subs.filter(x => x.grade != null).map(x => x.grade);
    return `<div class="card"><h3>Оқу аналитикасы</h3>Жіберілген жұмыс: <b>${s.subs.length}</b><br>Бағаланған: <b>${g.length}</b><br>Орташа балл: <b>${avg(g)}</b><br>Ең жоғары: <b>${g.length ? Math.max(...g) : '—'}</b></div>`;
  }
}
class Guest extends User {
  role() { return 'Қонақ'; }
  login() { return this.active; } // override: құпиясөз қажет емес
  render(s) { return s.courses.map(c => `<div class="card"><h3>${esc(c.title)}</h3><p>Оқытушы: ${esc(s.user(c.teacherId).name)}</p></div>`).join(''); }
}
[Student, Teacher, Administrator, Researcher, Guest].forEach(c => implement(c, IAuthenticatable, IManageable, INotifiable));
// Тіркеу кестесі: жаңа рөл қосу үшін бұрынғы кодты өзгертудің қажеті жоқ (OCP)
const Registry = { Student, Teacher, Administrator, Researcher, Guest };

// ---- Қойма (бизнес-логика)
function createStore() {
  const s = { users: [], courses: [], assignments: [], subs: [], nextId: 100 };
  s.user = id => s.users.find(u => u.id === id);
  s.assignment = id => s.assignments.find(a => a.id === id);
  s.addUser = (type, name, pw) => {
    if (!Registry[type]) throw new Error('Белгісіз рөл: ' + type);
    if (!name.trim()) throw new Error('Аты бос болмауы керек');
    const u = new Registry[type](s.nextId++, name.trim(), pw); s.users.push(u); return u;
  };
  s.submit = (student, aId, text) => {
    if (!text.trim()) throw new Error('Жауап бос');
    if (s.subs.some(x => x.studentId === student.id && x.assignmentId === aId)) throw new Error('Бұл тапсырма жіберілген');
    const sub = { id: s.nextId++, assignmentId: aId, studentId: student.id, text, grade: null };
    s.subs.push(sub);
    const a = s.assignment(aId);
    s.user(s.courses.find(c => c.id === a.courseId).teacherId).notify(`${student.name} «${a.title}» жұмысын жіберді`);
    return sub;
  };
  s.grade = (subId, score) => {
    score = Number(score);
    if (!Number.isFinite(score) || score < 0 || score > 100) throw new RangeError('Баға 0–100 аралығында болуы керек');
    const x = s.subs.find(v => v.id === subId);
    x.grade = score;
    s.user(x.studentId).notify(`«${s.assignment(x.assignmentId).title}» бойынша баға: ${score}`);
  };
  s.toggle = id => { const u = s.user(id); u.active ? u.deactivate() : u.activate(); };
  return s;
}
function seed(s) {
  [['Student', 'Айжан', 's123'], ['Student', 'Мадина', 'm123'], ['Teacher', 'Серік Б.', 't123'],
   ['Administrator', 'Дана К.', 'a123'], ['Researcher', 'Нұрлан Т.', 'r123'], ['Guest', 'Қонақ', '']]
    .forEach(([t, n, p], i) => { const u = new Registry[t](i + 1, n, p); s.users.push(u); });
  s.courses.push({ id: 1, title: 'Объектілі-бағдарлы программалау', teacherId: 3 }, { id: 2, title: 'Білім беру технологиялары', teacherId: 3 });
  s.assignments.push({ id: 1, courseId: 1, title: 'Абстрактілі класс дегеніміз не?' }, { id: 2, courseId: 1, title: 'Интерфейс пен абстрактілі класс айырмасы' }, { id: 3, courseId: 2, title: 'Адаптивті оқыту мысалы' });
  return s;
}
if (typeof module !== 'undefined') module.exports = { User, Student, Teacher, Administrator, Researcher, Guest, Registry, createStore, seed, implement, IAuthenticatable, IManageable, INotifiable };
