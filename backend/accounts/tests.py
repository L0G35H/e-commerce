from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

User = get_user_model()

class AccountsTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user_data = {
            'username': 'testuser',
            'email': 'test@intellicart.com',
            'password': 'password123',
            'confirm_password': 'password123',
            'first_name': 'Test',
            'last_name': 'User'
        }

    def test_user_registration(self):
        response = self.client.post('/api/v1/auth/register/', self.user_data)
        self.assertEqual(response.status_code, 201)
        self.assertTrue(response.data['success'])
        self.assertEqual(User.objects.count(), 1)

    def test_user_login(self):
        User.objects.create_user(
            username='testuser',
            email='test@intellicart.com',
            password='password123'
        )
        response = self.client.post('/api/v1/auth/login/', {
            'email': 'test@intellicart.com',
            'password': 'password123'
        })
        self.assertEqual(response.status_code, 200)
        self.assertIn('access', response.data)

    def test_admin_control_center_customer_forbidden(self):
        customer = User.objects.create_user(
            username='customer_sarah',
            email='sarah.jenkins@example.com',
            password='password123',
            role=User.Role.CUSTOMER,
            is_staff=False
        )
        self.client.force_authenticate(user=customer)
        response = self.client.get('/admin-control-center/')
        self.assertEqual(response.status_code, 403)

        response_api = self.client.get('/api/v1/admin-control-center/')
        self.assertEqual(response_api.status_code, 403)

    def test_admin_control_center_admin_allowed(self):
        admin = User.objects.create_user(
            username='admin_user',
            email='admin@intellicart.com',
            password='password123',
            role=User.Role.ADMIN,
            is_staff=True
        )
        self.client.force_authenticate(user=admin)
        response = self.client.get('/admin-control-center/')
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data['success'])

        response_api = self.client.get('/api/v1/admin-control-center/')
        self.assertEqual(response_api.status_code, 200)
        self.assertTrue(response_api.data['success'])
