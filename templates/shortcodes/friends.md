{% for friend in config.extra.friends %} [{{ friend.name }}]({{ friend.url }}) {% if not loop.last %} | {% endif %} {% endfor %}
