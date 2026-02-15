from django.db import models
from core.models import TimeStampedModel

class Ministry(TimeStampedModel):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)
    leader = models.ForeignKey(
        'accounts.User', 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='led_ministries'
    )

    class Meta:
        verbose_name_plural = "Ministries"

    def __str__(self):
        return self.name
