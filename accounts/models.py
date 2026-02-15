from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    class Role(models.TextChoices):
        BISHOP = 'BISHOP', 'Bishop (Super Admin)'
        ADMIN = 'ADMIN', 'Church Admin'
        MINISTRY_LEADER = 'MINISTRY_LEADER', 'Ministry Leader'
        DATA_ENTRY = 'DATA_ENTRY', 'Data Entry Clerk'
        MEMBER = 'MEMBER', 'Member (View Only)'

    role = models.CharField(max_length=20, choices=Role.choices, default=Role.MEMBER)
    phone = models.CharField(max_length=15, blank=True, null=True)

    def is_bishop(self):
        return self.role == self.Role.BISHOP
    
    def is_admin(self):
        return self.role in [self.Role.BISHOP, self.Role.ADMIN]

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"
