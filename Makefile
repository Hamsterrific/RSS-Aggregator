install:
	npm ci

build:
	rm -rf dist

lint: 
	npx eslint

develop:
	npx webpack serve