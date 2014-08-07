MODULE_NAME := screenshare
REQUIRED_TOOLS := browserify

PHONY: dist

$(REQUIRED_TOOLS):
	@hash $@ 2>/dev/null || (echo "please install $@" && exit 1)

dist: $(REQUIRED_TOOLS)
	@echo "building"
	@browserify content.js > $(MODULE_NAME)-content.js --debug
	@browserify index.js > $(MODULE_NAME).js --debug
