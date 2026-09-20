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
