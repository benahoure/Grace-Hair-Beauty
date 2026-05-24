.PHONY: lint test build security-scan

lint:
	ruff check src tests
	mypy src

test:
	pytest --cov=src --cov-report=term-missing

build:
	rm -rf dist
	mkdir -p dist
	pip install -r requirements.txt -t dist
	cp -R src/* dist/

security-scan:
	pip-audit -r requirements.txt
	bandit -r src -ll
