from django.shortcuts import render

# Create your views here.
from rest_framework import viewsets
from .models import Gasto
from .serializers import GastoSerializer

class GastoViewSet(viewsets.ModelViewSet):
    queryset = Gasto.objects.all().order_by('-fecha')
    serializer_class = GastoSerializer