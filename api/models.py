from django.db import models

class Course(models.Model):
    courseCode = models.CharField(max_length=20, unique=True)
    courseName = models.CharField(max_length=255)
    description = models.TextField()

    class Meta:
        db_table = "courses"  # Explicitly use 'courses' to match Postbird
