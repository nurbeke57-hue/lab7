const assert = require('assert');
const M = require('../js/models.js');
let n = 0; const t = (name, f) => { f(); console.log(`Тест ${++n}: ${name} -> ӨТТІ`); };
const s = M.seed(M.createStore());
const [aizhan, madina, teacher, admin, researcher, guest] = s.users;

t('User абстрактілі класын құруға болмайды', () => assert.throws(() => new M.User(0, 'x', 'x'), TypeError));
t('5 класс те 3 интерфейсті жүзеге асырады', () => s.users.forEach(u => assert.strictEqual(u.constructor.interfaces.length, 3)));
t('implement() жетіспейтін әдісті анықтайды', () => assert.throws(() => M.implement(class A {}, M.INotifiable), TypeError));
t('дұрыс/қате құпиясөзбен кіру', () => { assert(aizhan.login('s123')); assert(!aizhan.login('x')); });
t('Guest.login override (құпиясөзсіз)', () => assert(guest.login('')));
t('полиморфизм: әр рөл render() қайтарады', () => s.users.forEach(u => assert.strictEqual(typeof u.render(s), 'string')));
t('студент жұмыс жібереді, оқытушыға хабарлама барады', () => { s.submit(aizhan, 1, 'Жауап'); assert.strictEqual(teacher.inbox.length, 1); });
t('қайталап жіберуге болмайды', () => assert.throws(() => s.submit(aizhan, 1, 'тағы')));
t('баға 0–100 аралығында тексеріледі', () => assert.throws(() => s.grade(s.subs[0].id, 150), RangeError));
t('баға қойылады, студентке хабарлама барады', () => { s.grade(s.subs[0].id, 90); assert.strictEqual(s.subs[0].grade, 90); assert.strictEqual(aizhan.inbox.length, 1); });
t('бұғатталған пайдаланушы кіре алмайды', () => { s.toggle(madina.id); assert(!madina.login('m123')); s.toggle(madina.id); assert(madina.login('m123')); });
t('жаңа рөл (Mentor) бұрынғы кодты өзгертпей қосылады (OCP)', () => {
  class Mentor extends M.User { role() { return 'Тәлімгер'; } render() { return 'ok'; } }
  M.implement(Mentor, M.IAuthenticatable, M.IManageable, M.INotifiable);
  M.Registry.Mentor = Mentor; const m = s.addUser('Mentor', 'Али', 'x'); assert.strictEqual(m.role(), 'Тәлімгер');
});
console.log(`\nБарлық ${n} тест сәтті өтті.`);
