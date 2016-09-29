compile: index.html
.PHONY: compile

index.html:
	python jinja_renderer.py
