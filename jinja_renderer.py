"""Render index.html.epy -> src/index.html (``make build``).

Deployment settings are read from the environment (``ATB_OFRAMP_*``; /home/atb/ATB/.env is loaded
first when python-dotenv is available, real environment wins). Defaults are the production values.

  ATB_OFRAMP_BASE_SERVER          scheme://host of the fragments server (serves /fdb and /oapoc)
  ATB_OFRAMP_ATB_API_URL          ATB base URL (API calls, "Send to ATB", redirects)
  ATB_OFRAMP_GOOGLE_ANALYTICS_ID  empty string disables the analytics snippet
"""
import os
from os.path import dirname, join, abspath

from jinja2 import Template

try:
    from dotenv import load_dotenv
    if os.path.exists('/home/atb/ATB/.env'):
        load_dotenv('/home/atb/ATB/.env', override=False)
except ImportError:
    pass

HERE = dirname(abspath(__file__))

BASE_SERVER = os.environ.get('ATB_OFRAMP_BASE_SERVER', 'https://fragments.atb.uq.edu.au').rstrip('/')
GOOGLE_ANALYTICS_ID = os.environ.get('ATB_OFRAMP_GOOGLE_ANALYTICS_ID', 'UA-59222530-5')

ATB_API_URL = os.environ.get('ATB_OFRAMP_ATB_API_URL', 'https://atb.uq.edu.au').rstrip('/')

PROJECT_NAME_FORMATTER = lambda project_name: project_name.lower()

SOURCE_DIR = join(HERE, 'src')

if __name__ == '__main__':
    for template in ['index.html.epy']:
        with open(join(HERE, template)) as fh:
            rendered_view = Template(fh.read()).render(
                base_server=BASE_SERVER,
                project_name_formatter=PROJECT_NAME_FORMATTER,
                google_analytics_id=GOOGLE_ANALYTICS_ID,
                atb_api_url=ATB_API_URL,
            )
        with open(join(SOURCE_DIR, template.replace('.epy', '')), 'w') as fh:
            fh.write(rendered_view)
