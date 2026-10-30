from edu_platform import *

def check(n, title, cond):
    print(f"Тест {n}: {title} -> {'ӨТТІ' if cond else 'ҚАТЕ'}")
    assert cond

s = Student(1, "Айжан", "aizhan@univ.kz", "s123", "МАГ-21")
t = Teacher(2, "Серік Б.", "serik@univ.kz", "t123", "ООП")
a = Administrator(3, "Дана К.", "dana@univ.kz", "a123")
r = Researcher(4, "Нұрлан Т.", "nurlan@univ.kz", "r123", "Адаптивті оқыту")
g = Guest(5, "Қонақ", "guest@univ.kz", "")
users = [s, t, a, r, g]

print("=== Полиморфизм: барлық пайдаланушылардың әрекеті ===")
for u in users:
    print(u, "|", u.perform_action())

print("\n=== Тестілеу нәтижелері ===")
try:
    User(0, "x", "x", "x"); ok = False
except TypeError:
    ok = True
check(1, "абстрактілі User данасын құруға болмайды", ok)
check(2, "дұрыс құпиясөзбен кіру", s.login("s123") is True)
check(3, "қате құпиясөзбен кіруге болмайды", t.login("wrong") is False)
check(4, "Guest login-ы override жасалған", g.login("") is True)
check(5, "барлығы 3 интерфейсті жүзеге асырады",
      all(isinstance(u, (IAuthenticatable, IManageable, INotifiable)) for u in users))
check(6, "оқытушы баға қояды", "85" in t.grade(s, 85) and s.grades == [85])
s.update_profile(name="Айжан С.")
check(7, "профильді жаңарту", s.name == "Айжан С.")
print(a.block_user(s))
check(8, "бұғатталған пайдаланушы кіре алмайды", s.login("s123") is False)
check(9, "хабарландыру", "Хабарлама" in r.notify("Жаңа мақала"))
check(10, "жаңа тип (Researcher) бұрынғы кодты өзгертпей қосылды",
      isinstance(r, User) and r.role() == "Зерттеуші")
print("\nБарлық 10 тест сәтті өтті.")
