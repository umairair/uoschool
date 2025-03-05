from django.urls import path
from .views import hello_world, scrape_course, search_course

urlpatterns = [
    path('hello/', hello_world, name='hello-world'),
    path('scrape-course/', scrape_course, name='scrape-course'),
    path('search-course/', search_course, name='search-course'),
]
