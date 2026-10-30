# 🎓 EduPlatform — интеллектуалды білім беру платформасы

7-зертханалық жұмыс (1-тапсырма): **абстрактілі класс және интерфейс**.
Пәні: Білім берудегі объектілі-бағдарлы программалау.

Жұмыс істейтін веб-қосымша: рөлдер бойынша кіру, курстар, тапсырмалар, баға қою, хабарландырулар, оқу аналитикасы.

## Архитектура
| Элемент | Іске асыруы |
|---|---|
| Абстрактілі класс | `User` (`role()`, `render()` абстрактілі) |
| Интерфейстер | `IAuthenticatable`, `IManageable`, `INotifiable` |
| Класстар | `Student`, `Teacher`, `Administrator`, `Researcher`, `Guest` |
| Полиморфизм | `me.render(store)` — әр рөл өз интерфейсін көрсетеді |
| Кеңейту (OCP) | жаңа рөл `Registry` арқылы қосылады |

![UML](docs/uml.png)

## Құрылым
```
index.html        # интерфейс
css/style.css
js/models.js      # домен моделі: User, интерфейстер, кластар, Store
js/app.js         # UI логикасы, localStorage
tests/models.test.js   # node tests/models.test.js
python/           # Python-нұсқасы (python main.py)
docs/             # UML және есеп (report.docx)
```

## Іске қосу
- Сайт: `index.html` файлын ашу немесе GitHub Pages.
- Тест: `node tests/models.test.js` · `python python/main.py`

## Демо-аккаунттар
Айжан `s123`, Мадина `m123`, Серік (оқытушы) `t123`, Дана (әкімші) `a123`, Нұрлан (зерттеуші) `r123`, Қонақ — құпиясөзсіз.
