install: src/index.html
.PHONY: install

src/index.html:
	python jinja_renderer.py
