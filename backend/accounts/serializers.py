from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import UserProfile, Address

User = get_user_model()

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['avatar_url', 'bio', 'default_pincode', 'preferred_category']


class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = ['id', 'name', 'street', 'suite', 'city', 'state', 'pincode', 'country', 'phone', 'is_default', 'created_at']
        read_only_fields = ['id', 'created_at']


class UserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(read_only=True)
    addresses = AddressSerializer(many=True, read_only=True)
    is_admin = serializers.BooleanField(read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'phone_number', 'role', 'is_staff', 'is_superuser', 'is_admin', 'profile', 'addresses', 'created_at']
        read_only_fields = ['id', 'role', 'is_staff', 'is_superuser', 'is_admin', 'created_at']


class RegisterSerializer(serializers.ModelSerializer):
    username = serializers.CharField(required=False, allow_blank=True)
    password = serializers.CharField(write_only=True, min_length=6)
    confirm_password = serializers.CharField(write_only=True, min_length=6, required=False)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'confirm_password', 'first_name', 'last_name', 'phone_number']

    def validate(self, attrs):
        if 'confirm_password' in attrs and attrs.get('confirm_password'):
            if attrs['password'] != attrs['confirm_password']:
                raise serializers.ValidationError({"password": "Passwords do not match."})
        return attrs

    def create(self, validated_data):
        validated_data.pop('confirm_password', None)
        email = validated_data['email']
        username = validated_data.get('username') or email
        user = User.objects.create_user(
            username=username,
            email=email,
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            phone_number=validated_data.get('phone_number', '')
        )
        UserProfile.objects.create(user=user)
        return user


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, min_length=6)
