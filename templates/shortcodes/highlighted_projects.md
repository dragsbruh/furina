{% for proj in config.extra.highlighted_projects %}
- **{{ proj.name }}**: {{ proj.desc }} ([repository]({{ proj.repo }}))
{% endfor %}
