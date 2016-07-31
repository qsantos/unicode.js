"use strict";
unicode = unicode || {}

// Translated from Python 3.5.2 codebase, Objects/unicodeobject.c
// Original License:
/*

Unicode implementation based on original code by Fredrik Lundh,
modified by Marc-Andre Lemburg <mal@lemburg.com>.

Major speed upgrades to the method implementations at the Reykjavik
NeedForSpeed sprint, by Fredrik Lundh and Andrew Dalke.

Copyright (c) Corporation for National Research Initiatives.

--------------------------------------------------------------------
The original string type implementation is:

  Copyright (c) 1999 by Secret Labs AB
  Copyright (c) 1999 by Fredrik Lundh

By obtaining, using, and/or copying this software and/or its
associated documentation, you agree that you have read, understood,
and will comply with the following terms and conditions:

Permission to use, copy, modify, and distribute this software and its
associated documentation for any purpose and without fee is hereby
granted, provided that the above copyright notice appears in all
copies, and that both that copyright notice and this permission notice
appear in supporting documentation, and that the name of Secret Labs
AB or the author not be used in advertising or publicity pertaining to
distribution of the software without specific, written prior
permission.

SECRET LABS AB AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO
THIS SOFTWARE, INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND
FITNESS.  IN NO EVENT SHALL SECRET LABS AB OR THE AUTHOR BE LIABLE FOR
ANY SPECIAL, INDIRECT OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT
OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
--------------------------------------------------------------------

*/

/* --- Unicode Object Methods --------------------------------------------- */

function _PyUnicode_IsAlnum(ch)
{
    return _PyUnicode_IsAlpha(ch) || _PyUnicode_IsDecimalDigit(ch) || _PyUnicode_IsDigit(ch) || _PyUnicode_IsNumeric(ch);
}

/*
 * Return a titlecased version of S, i.e. words start with title case
 * characters, all remaining cased characters have lower case.
 */
unicode.title = function(self)
{
    var res = "";
    var previous_is_cased = false;
    for (var i = 0; i < self.length; i++) {
        var c = self.charAt(i);
        var mapped;

        if (previous_is_cased) {
            res += lower_ucs4(c, self, i);
        }
        else {
            res += _PyUnicode_ToTitleFull(c);
        }

        previous_is_cased = _PyUnicode_IsCased(c);
    }
    return res;
}

function handle_capital_sigma(self, i)
{
    var j;
    var c;
    /* U+03A3 is in the Final_Sigma context when, it is found like this:

     \p{cased}\p{case-ignorable}*U+03A3!(\p{case-ignorable}*\p{cased})

    where ! is a negation and \p{xxx} is a character with property xxx.
    */
    for (j = i - 1; j >= 0; j--) {
        c = self.charAt(j);
        if (!_PyUnicode_IsCaseIgnorable(c))
            break;
    }
    var final_sigma = j >= 0 && _PyUnicode_IsCased(c);
    if (final_sigma) {
        for (j = i + 1; j < self.length; j++) {
            c = self.charAt(j);
            if (!_PyUnicode_IsCaseIgnorable(c))
                break;
        }
        final_sigma = j == self.length || !_PyUnicode_IsCased(c);
    }
    return String.fromCharCode(final_sigma ? 0x3C2 : 0x3C3);
}

function lower_ucs4(c, self, i)
{
    /* Obscure special case. */
    if (c.charCodeAt(0) == 0x3A3) {
        return handle_capital_sigma(self, i);
    }
    return _PyUnicode_ToLowerFull(c);
}


/*
 * Return a capitalized version of S, i.e. make the first character
 * have upper case and the rest lower case.
 */
unicode.capitalize = function(self)
{
    var res = "";
    res += _PyUnicode_ToUpperFull(self.charAt(0));
    for (var i = 1; i < self.length; i++) {
        res += lower_ucs4(self.charAt(i), self, i);
    }
    return res;
}

/*
 * Return a version of S suitable for caseless comparisons.
 */
unicode.casefold = function(self)
{
    var res = "";
    for (var i = 0; i < self.length; i++) {
        res += _PyUnicode_ToFoldedFull(self.charAt(i));
    }
    return res;
}

/*
 * Return True if all cased characters in S are lowercase and there is
 * at least one cased character in S, False otherwise.
 */
unicode.islower = function(self)
{
    if (self == "") {
        return false;
    }

    for (var i = 0; i < self.length; i++) {
        var ch = self.charAt(i);
        if (_PyUnicode_IsUppercase(ch) || _PyUnicode_IsTitlecase(ch)) {
            return false;
        }
    }
    return true;
}

/*
/*
 * Return True if all cased characters in S are uppercase and there is
 * at least one cased character in S, False otherwise.
 */
unicode.isupper = function(self)
{
    if (self == "") {
        return false;
    }

    for (var i = 0; i < self.length; i++) {
        var ch = self.charAt(i);
        if (_PyUnicode_IsLowercase(ch) || _PyUnicode_IsTitlecase(ch)) {
            return false;
        }
    }
    return true;
}

/*
 * Return True if S is a titlecased string and there is at least one
 * character in S, i.e. upper- and titlecase characters may only
 * follow uncased characters and lowercase characters only cased ones.
 * Return False otherwise.
 */
unicode.istitle = function(self)
{
    if (self == "") {
        return false;
    }

    var cased = false;
    var previous_is_cased = false;
    for (var i = 0; i < self.length; i++) {
        var ch = self.charAt(i);

        if (_PyUnicode_IsUppercase(ch) || _PyUnicode_IsTitlecase(ch)) {
            if (previous_is_cased) {
                return false;
            }
            previous_is_cased = true;
            cased = true;
        }
        else if (_PyUnicode_IsLowercase(ch)) {
            if (!previous_is_cased) {
                return false;
            }
            previous_is_cased = true;
            cased = true;
        }
        else {
            previous_is_cased = false;
        }
    }
    return cased;
}

/*
 * Return True if all characters in S are whitespace
 * and there is at least one character in S, False otherwise.
 */
unicode.isspace = function(self)
{
    if (self == "") {
        return false;
    }

    for (var i = 0; i < self.length; i++) {
        var ch = self.charAt(i);
        if (!_PyUnicode_IsWhitespace(ch)) {
            return false;
        }
    }
    return true;
}

/*
 * Return True if all characters in S are alphabetic
 * and there is at least one character in S, False otherwise.
 */
unicode.isalpha = function(self)
{
    if (self == "") {
        return false;
    }

    for (var i = 0; i < self.length; i++) {
        var ch = self.charAt(i);
        if (!_PyUnicode_IsAlpha(ch)) {
            return false;
        }
    }
    return true;
}

/*
 * Return True if all characters in S are alphanumeric
 * and there is at least one character in S, False otherwise.
 */
unicode.isalnum = function(self)
{
    if (self == "") {
        return false;
    }

    for (var i = 0; i < self.length; i++) {
        var ch = self.charAt(i);
        if (!_PyUnicode_IsAlnum(ch)) {
            return false;
        }
    }
    return true;
}

/*
 * Return True if there are only decimal characters in S,
 * False otherwise.
 */
unicode.isdecimal = function(self)
{
    if (self == "") {
        return false;
    }

    for (var i = 0; i < self.length; i++) {
        var ch = self.charAt(i);
        if (!_PyUnicode_IsDecimalDigit(ch)) {
            return false;
        }
    }
    return true;
}

/*
 * Return True if all characters in S are digits
 * and there is at least one character in S, False otherwise.
 */
unicode.isdigit = function(self)
{
    if (self == "") {
        return false;
    }

    for (var i = 0; i < self.length; i++) {
        var ch = self.charAt(i);
        if (!_PyUnicode_IsDigit(ch)) {
            return false;
        }
    }
    return true;
}

/*
 * Return True if there are only numeric characters in S,
 * False otherwise.
 */
unicode.isnumeric = function(self)
{
    if (self == "") {
        return false;
    }

    for (var i = 0; i < self.length; i++) {
        var ch = self.charAt(i);
        if (!_PyUnicode_IsNumeric(ch)) {
            return false;
        }
    }
    return true;
}

unicode.isidentifier = function(self)
{
    if (self == "") {
        return false;
    }

    /* PEP 3131 says that the first character must be in
       XID_Start and subsequent characters in XID_Continue,
       and for the ASCII range, the 2.x rules apply (i.e
       start with letters and underscore, continue with
       letters, digits, underscore). However, given the current
       definition of XID_Start and XID_Continue, it is sufficient
       to check just for these, except that _ must be allowed
       as starting an identifier.  */
    if (self.charAt(0) != "_" && !_PyUnicode_IsXidStart(self.charAt(0))) {
        return false;
    }

    for (var i = 1; i < self.length; i++) {
        if (!_PyUnicode_IsXidContinue(self.charAt(i))) {
            return false;
        }
    }
    return true;
}

/*
 * Return True if all characters in S are considered
 * printable in repr() or S is empty, False otherwise.
 */
unicode.isprintable = function(self)
{
    for (var i = 0; i < self.length; i++) {
        if (!_PyUnicode_IsPrintable(self.charAt(i))) {
            return false;
        }
    }
    return true;
}

/*
 * Return a copy of the string S converted to lowercase.
 */
unicode.lower = function(self)
{
    var res = "";
    for (var i = 0; i < self.length; i++) {
        var c = self.charAt(i);
        res += lower_ucs4(c, self, i);
    }
    return res;
}

/*
 * Return a copy of S with uppercase characters converted to lowercase\n\
 * and vice versa.");
 */
unicode.swapcase = function(self)
{
    var res = "";
    for (var i = 0; i < self.length; i++) {
        var c = self.charAt(i);
        var mapped;
        if (_PyUnicode_IsUppercase(c)) {
            res += lower_ucs4(c, self, i);
        }
        else if (_PyUnicode_IsLowercase(c)) {
            res += _PyUnicode_ToUpperFull(c);
        }
        else {
            res += c;
            mapped = c;
        }
    }
    return res;
}

/*
 * Return a copy of S converted to uppercase.");
 */
unicode.upper = function(self)
{
    var res = "";
    for (var i = 0; i < self.length; i++) {
        var c = self.charAt(i);
        res += _PyUnicode_ToUpperFull(c);
    }
    return res;
}
