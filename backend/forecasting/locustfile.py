from locust import HttpUser, task

class ForecastUser(HttpUser):

    @task
    def forecast(self):
        self.client.post(
            "/api/forecast",
            json={
                "sku_id": "SKU-00064",
                "forecast_days": 30
            }
        )