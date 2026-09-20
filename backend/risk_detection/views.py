from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import RiskAssessment
from .serializers import RiskAssessmentSerializer

class RiskAssessmentViewSet(viewsets.ModelViewSet):
    queryset = RiskAssessment.objects.all()
    serializer_class = RiskAssessmentSerializer
    permission_classes = [permissions.IsAdminUser]

    def get_queryset(self):
        queryset = RiskAssessment.objects.all()
        risk_level = self.request.query_params.get('risk_level', None)
        if risk_level:
            queryset = queryset.filter(risk_level__iexact=risk_level)
        return queryset

    @action(detail=True, methods=['post'])
    def mark_reviewed(self, request, pk=None):
        assessment = self.get_object()
        assessment.reviewed_by_admin = True
        assessment.admin_notes = request.data.get('notes', 'Reviewed by compliance officer.')
        assessment.save()
        serializer = self.get_serializer(assessment)
        return Response({'success': True, 'assessment': serializer.data})
