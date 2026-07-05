INSTANCE ?= demo
SPLICE_VERSION ?= 0.6.4

.PHONY: up down build upload test dev doctor clean

up:
	dpm localnet up $(INSTANCE) --version $(SPLICE_VERSION)

down:
	dpm localnet down $(INSTANCE)

doctor:
	dpm localnet doctor

build:
	dpm build

upload:
	dpm build
	canton-devkit localnet dar upload $$(ls .daml/dist/*.dar | head -1) --instance $(INSTANCE) --all-participants

test:
	dpm test
	npm test

dev:
	./scripts/dev.sh

clean:
	dpm localnet clean --name $(INSTANCE) --force || true
