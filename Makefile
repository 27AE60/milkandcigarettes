FILES="test/*.js"

test:
	@NODE_ENV=test istanbul cover ./node_modules/.bin/_mocha -- -u exports -R spec --timeout 25000 $(FILES) 

.PHONY: test
