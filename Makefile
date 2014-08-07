MODULE_NAME := screenshare
REQUIRED_TOOLS := browserify
BROWSERIFY_FLAGS := --debug

PHONY: rebuild

rebuild: clean dist

$(REQUIRED_TOOLS):
	@hash $@ 2>/dev/null || (echo "please install $@" && exit 1)

dist: $(REQUIRED_TOOLS)
	@echo "building"
	@mkdir -p dist
	@browserify src/content.js > dist/content.js $(BROWSERIFY_FLAGS)
	@browserify src/index.js > dist/index.js $(BROWSERIFY_FLAGS)
	@cat src/manifest.json > dist/manifest.json

clean:
	rm -rf dist
