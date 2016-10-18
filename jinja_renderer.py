from os.path import join
from jinja2 import Template

BASE_SERVER = 'http://fragments.atb.uq.edu.au'
GOOGLE_ANALYTICS_ID = 'UA-59222530-5'

PROJECT_NAME_FORMATTER = lambda project_name: project_name.lower()

SOURCE_DIR = 'src'

if __name__ == '__main__':
    for template in ['index.html.epy']:
        with open(template) as fh:
            rendered_view = Template(fh.read()).render(
                base_server=BASE_SERVER,
                project_name_formatter=PROJECT_NAME_FORMATTER,
                google_analytics_id=GOOGLE_ANALYTICS_ID,
            )
        with open(join(SOURCE_DIR, template.replace('.epy', '')), 'w') as fh:
            fh.write(rendered_view)
