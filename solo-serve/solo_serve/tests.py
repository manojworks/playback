from django.urls import reverse
from rest_framework.test import APITestCase


class HelloWorldAPITest(APITestCase):
    def test_hello_world_returns_message(self):
        url = reverse("hello-world")
        response = self.client.get(url)

        assert response.status_code == 200
        assert response.json() == {"message": "Hello World"}
