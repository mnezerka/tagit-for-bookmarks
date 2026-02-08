ZIPFILE=tagit-for-bookmarks.zip

all: build

.PHONY: build
build: clean
	zip -r $(ZIPFILE) main.js manifest.json newtab.html images

.PHONY: clean
clean:
	rm -f $(ZIPFILE)

