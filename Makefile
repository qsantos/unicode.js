CC=uglifyjs
CFLAGS=--wrap unicode -m toplevel=true,eval=true -c sequences=true,properties=true,dead_code=true,drop_debugger=true,conditionals=true,comparisons=true,evaluate=true,booleans=true,loops=true,unused=true,hoist_funs=true,if_return=true,join_vars=true,cascade=true,pure_getters=true,drop_console=true

unicode.min.js: unicodetype_db.js unicodectype.js unicodeobject.js
	$(CC) $^ $(CFLAGS) -o $@
