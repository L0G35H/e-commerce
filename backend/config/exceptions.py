from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status

def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)

    if response is not None:
        custom_data = {
            'success': False,
            'message': 'Request processing failed.',
            'errors': response.data
        }
        if isinstance(response.data, dict) and 'detail' in response.data:
            custom_data['message'] = str(response.data['detail'])
        response.data = custom_data
    else:
        response = Response({
            'success': False,
            'message': str(exc) or 'An unexpected server error occurred.',
            'errors': {}
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    return response
