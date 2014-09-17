FILES="test/*.js"

test:
	@NODE_ENV=test ./node_modules/.bin/mocha --reporter list --timeout 25000 $(FILES) 

.PHONY: test
