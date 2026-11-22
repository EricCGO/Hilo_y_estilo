from django.db import models


class TimeStampedModel(models.Model):
    """Auditoría temporal compartida por todos los modelos de negocio."""

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True
