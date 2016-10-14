install: index.html
.PHONY: install

index.html:
	python jinja_renderer.py
