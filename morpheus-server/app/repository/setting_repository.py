from typing import List
from uuid import UUID

from sqlalchemy.orm import Session

from app.models.models import Setting
from app.models.schemas import SDModelCreate


class SettingRepository:
    def __init__(self):
        self.AWS_ACCESS_KEY_ID = settings.aws_access_key_id
        self.AWS_SECRETS_ACCESS_KEY = settings.aws_secret_access_key

    def update_autoscaling_group_size(self, autoscaling_group_name, min_size, max_size, desired_size):
        autoscaling_client = boto3.client('autoscaling')
        response = autoscaling_client.update_auto_scaling_group(
            AutoScalingGroupName=autoscaling_group_name,
            MinSize=min_size,
            DesiredCapacity=max_size
        )
        if response["ResponseMetadata"]["HTTPStatusCode"] == 200:
            return True
        return False
