#!/usr/bin/env bash

# open scope
echo '"use strict";var unicode={};(function(){' > unicode.js

# combine files
cat unicodetype_db.js unicodectype.js unicodeobject.js >> unicode.js

# close scope
echo '})();' >> unicode.js

# minify
uglifyjs unicode.js -o unicode.min.js
