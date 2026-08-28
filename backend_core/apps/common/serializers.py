from rest_framework import serializers
from .models import SiteSetting, Video


class ThemeSerializer(serializers.Serializer):
    theme = serializers.ChoiceField(choices=[c[0] for c in SiteSetting.THEME_CHOICES])


class VideoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Video
        fields = ["id", "title", "src", "type"]
