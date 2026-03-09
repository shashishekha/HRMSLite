from django.db import models

class Employee(models.Model):
    employee_id = models.CharField(max_length = 100, unique=True)
    name = models.CharField(max_length = 100)
    email = models.EmailField(unique = True)
    dept = models.CharField(max_length = 100)

class Attendance(models.Model):
    employee = models.ForeignKey(Employee, on_delete = models.CASCADE)
    date = models.DateField()
    status = models.CharField(max_length=10)
