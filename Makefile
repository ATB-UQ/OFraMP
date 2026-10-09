# `make build` renders src/index.html from index.html.epy (settings: ATB_OFRAMP_*, see jinja_renderer.py).
# Uses python3 when it has jinja2, else `uv run` with requirements-build.txt.
PYTHON ?= python3

build: src/index.html
install: build
src/index.html: index.html.epy jinja_renderer.py
	@if $(PYTHON) -c 'import jinja2' 2>/dev/null; then $(PYTHON) jinja_renderer.py; \
	else uv run --no-project --with-requirements requirements-build.txt python jinja_renderer.py; fi
clean:
	rm -f src/index.html
.PHONY: build install clean
