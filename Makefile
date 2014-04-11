MODULE_NAME := screenshare
REQUIRED_TOOLS := browserify

PHONY: dist

$(REQUIRED_TOOLS):
	@hash $@ 2>/dev/null || (echo "please install $@" && exit 1)

dist: $(REQUIRED_TOOLS)
	@echo "building"
	@browserify chrome-extension/content.js > chrome-extension/$(MODULE_NAME)-content.js --debug
	@browserify chrome-extension/index.js > chrome-extension/$(MODULE_NAME).js --debug