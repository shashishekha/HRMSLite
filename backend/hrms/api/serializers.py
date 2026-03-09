from rest_framework import serializers
from .models import Employee, Attendance

class EmployeeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Employee
        fields = '__all__'

    def validate_emp(request, value):
        if Employee.objects.filter(emp_id=value).exists():
            raise serializers.ValidationError("Eployee ID is already present")
        return value
    

class AttendanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attendance
        fields=['id','employee','date','status']

    def validate_date(request, value):
        from datetime import date
        if value > date.today():
            raise serializers.ValidationError("Future attendance dates cannot be marked!")
        return value