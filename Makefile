MODULE_NAME := screenshare
BROWSERIFY_FLAGS := --debug
NPM_BIN := ./node_modules/.bin

PHONY: rebuild

rebuild: clean dist

$(REQUIRED_TOOLS):
	@hash $@ 2>/dev/null || (echo "please install $@" && exit 1)

dist: $(REQUIRED_TOOLS)
	@echo "building"
	@mkdir -p extension/dist
	@$(NPM_BIN)/browserify extension/src/message-bridge.js > extension/dist/message-bridge.js $(BROWSERIFY_FLAGS)
	@$(NPM_BIN)/browserify extension/src/index.js > extension/dist/index.js $(BROWSERIFY_FLAGS)
	@cat extension/src/manifest.json > extension/dist/manifest.json
	@cp extension/src/*.png extension/dist

clean:
	@rm -rf extension/dist

zip: rebuild
	@rm extension/bundle.zip
	@zip -r extension/bundle.zip extension/dist/*
