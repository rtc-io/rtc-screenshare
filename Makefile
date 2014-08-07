MODULE_NAME := screenshare
BROWSERIFY_FLAGS := --debug
NPM_BIN := ./node_modules/.bin

PHONY: rebuild

rebuild: clean dist

$(REQUIRED_TOOLS):
	@hash $@ 2>/dev/null || (echo "please install $@" && exit 1)

dist: $(REQUIRED_TOOLS)
	@echo "building"
	@mkdir -p dist
	@$(NPM_BIN)/browserify src/content.js > dist/content.js $(BROWSERIFY_FLAGS)
	@$(NPM_BIN)/browserify src/index.js > dist/index.js $(BROWSERIFY_FLAGS)
	@cat src/manifest.json > dist/manifest.json

clean:
	@rm -rf dist
