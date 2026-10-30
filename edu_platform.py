from abc import ABC, abstractmethod


class IAuthenticatable(ABC):
    """Интерфейс: жүйеге кіру / шығу."""

    @abstractmethod
    def login(self, password: str) -> bool: ...

    @abstractmethod
    def logout(self) -> None: ...


class IManageable(ABC):
    """Интерфейс: пайдаланушы деректерін басқару."""

    @abstractmethod
    def update_profile(self, **data) -> None: ...

    @abstractmethod
    def deactivate(self) -> None: ...


class INotifiable(ABC):
    """Интерфейс: хабарландыру қабылдау."""

    @abstractmethod
    def notify(self, message: str) -> str: ...


class User(ABC):
    """Абстрактілі класс: барлық пайдаланушыларға ортақ мүмкіндіктер."""

    def __init__(self, user_id: int, name: str, email: str, password: str):
        self.user_id = user_id
        self.name = name
        self.email = email
        self._password = password
        self.is_active = True
        self.is_logged_in = False

    @abstractmethod
    def role(self) -> str:
        """Рөл атауы."""

    @abstractmethod
    def perform_action(self) -> str:
        """Рөлге тән негізгі әрекет (полиморфизм)."""

    def __str__(self) -> str:
        return f"[{self.role()}] #{self.user_id} {self.name} <{self.email}>"


class _BaseAccount(User, IAuthenticatable, IManageable, INotifiable):
    """Үш интерфейстің ортақ жүзеге асырылуы (қайталанбау үшін)."""

    def login(self, password: str) -> bool:
        if self.is_active and password == self._password:
            self.is_logged_in = True
        return self.is_logged_in

    def logout(self) -> None:
        self.is_logged_in = False

    def update_profile(self, **data) -> None:
        for key in ("name", "email"):
            if key in data:
                setattr(self, key, data[key])

    def deactivate(self) -> None:
        self.is_active = False
        self.is_logged_in = False

    def notify(self, message: str) -> str:
        return f"Хабарлама -> {self.name}: {message}"


class Student(_BaseAccount):
    def __init__(self, user_id, name, email, password, group):
        super().__init__(user_id, name, email, password)
        self.group = group
        self.grades = []

    def role(self): return "Студент"

    def perform_action(self):
        return f"{self.name} ({self.group}) оқу материалдарын игеруде."

    def submit_assignment(self, title):
        return f"{self.name} '{title}' тапсырмасын жіберді."


class Teacher(_BaseAccount):
    def __init__(self, user_id, name, email, password, subject):
        super().__init__(user_id, name, email, password)
        self.subject = subject

    def role(self): return "Оқытушы"

    def perform_action(self):
        return f"{self.name} '{self.subject}' пәні бойынша сабақ жүргізуде."

    def grade(self, student, score):
        student.grades.append(score)
        return f"{student.name}: {score} балл қойылды."


class Administrator(_BaseAccount):
    def __init__(self, user_id, name, email, password):
        super().__init__(user_id, name, email, password)

    def role(self): return "Әкімші"

    def perform_action(self):
        return f"{self.name} жүйені басқаруда (аккаунттар, рұқсаттар)."

    def block_user(self, user):
        user.deactivate()
        return f"{user.name} аккаунты бұғатталды."


class Researcher(_BaseAccount):
    """Жаңа тип: бұрынғы кодқа тиіспей қосылды (OCP)."""

    def __init__(self, user_id, name, email, password, topic):
        super().__init__(user_id, name, email, password)
        self.topic = topic

    def role(self): return "Зерттеуші"

    def perform_action(self):
        return f"{self.name} '{self.topic}' тақырыбында зерттеу жүргізуде."


class Guest(_BaseAccount):
    def role(self): return "Қонақ"

    def perform_action(self):
        return f"{self.name} тек ашық курстарды қарауда."

    def login(self, password: str) -> bool:  # әрекеті ерекше (override)
        self.is_logged_in = True
        return True
