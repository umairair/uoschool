from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from api.utils.coursescraper import getCourse
from api.models import Course  # Assuming you have a Course model
import json
from django.db.models import Q


@csrf_exempt  # Disable CSRF for simplicity (only in development)
def hello_world(request):
    return JsonResponse({"message": "Hello from Django!"})

@csrf_exempt
def scrape_course(request):
    course_code = request.GET.get('courseCode', None)  # Extract courseCode from query params

    if not course_code:
        return JsonResponse({"error": "Missing courseCode parameter"}, status=400)

    data = getCourse(course_code)  # Fetch course data
    return JsonResponse(data)



@csrf_exempt
def search_course(request):
    query = request.GET.get('query', None)
    search_by_name = request.GET.get('searchByName', 'false').lower() == 'true'  
    if not query:
        return JsonResponse({"error": "Missing query parameter"}, status=400)

    try:
        if search_by_name:
            results = Course.objects.filter(
                Q(courseName__istartswith=query) | Q(courseName__icontains=query)
            )
        else:
            if query.isdigit():
                results = Course.objects.filter(courseCode__regex=rf'^[A-Za-z]{{3}}{query}$')
            else:
                results = Course.objects.filter(
                    Q(courseCode__istartswith=query) | Q(courseCode__icontains=query)
                )

        results_list = list(results.values('courseCode', 'courseName'))
        return JsonResponse(results_list, safe=False)

    except Exception as e:
        print("Error in search_course:", str(e))
        return JsonResponse({"error": "Something went wrong", "details": str(e)}, status=500)
