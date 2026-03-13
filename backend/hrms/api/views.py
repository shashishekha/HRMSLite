from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.decorators import action
from .models import Employee, Attendance
from .serializers import EmployeeSerializer, AttendanceSerializer

# Create your views here.

class EmployeeViewSet(viewsets.ModelViewSet):
    queryset = Employee.objects.all()
    serializer_class = EmployeeSerializer

    @action(detail=True, methods=['get'], url_path='attendance-summary')
    def attendance_summary(self, request, pk=None):
        employee = self.get_object()
        qs = Attendance.objects.filter(employee=employee)

        month = request.query_params.get('month')
        year = request.query_params.get('year')
        if month and year:
            qs = qs.filter(date__month=month, date__year=year)

        return Response({
            "employee": {
                "id": employee.employee_id,
                "name": employee.name,
                "dept": employee.dept,
            },
            "data": {
                "total_records": qs.count(),
                "present": qs.filter(status="present").count(),
                "absent": qs.filter(status="absent").count(),
                "late": qs.filter(status="late").count(),
            }
        })

class AttendanceViewSet(viewsets.ModelViewSet):
    queryset = Attendance.objects.all()
    serializer_class = AttendanceSerializer

