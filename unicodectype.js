"use strict";

// Translated from Python 3.5.2 codebase, Objects/unicodectype.c
// Original License:
/*
   Unicode character type helpers.

   Written by Marc-Andre Lemburg (mal@lemburg.com).
   Modified for Python 2.0 by Fredrik Lundh (fredrik@pythonware.com)
   Translated to Javascript by Quentin Santos

   Copyright (c) Corporation for National Research Initiatives.

*/

var ALPHA_MASK = 0x01;
var DECIMAL_MASK = 0x02;
var DIGIT_MASK = 0x04;
var LOWER_MASK = 0x08;
//var LINEBREAK_MASK = 0x10;
//var SPACE_MASK = 0x20;
var TITLE_MASK = 0x40;
var UPPER_MASK = 0x80;
var XID_START_MASK = 0x100;
var XID_CONTINUE_MASK = 0x200;
var PRINTABLE_MASK = 0x400;
var NUMERIC_MASK = 0x800;
var CASE_IGNORABLE_MASK = 0x1000;
var CASED_MASK = 0x2000;
var EXTENDED_CASE_MASK = 0x4000;

function gettyperecord(code)
{
    var index;

    if (code >= 0x110000) {
        index = 0;
    }
    else {
        index = index1[(code>>SHIFT)];
        index = index2[(index<<SHIFT)+(code&((1<<SHIFT)-1))];
    }

    return _PyUnicode_TypeRecords[index];
}

function extractExtended(index, n)
{
    var res = "";
    for (var i = 0; i < n; i++) {
        res += String.fromCharCode(_PyUnicode_ExtendedCase[index + i]);
    }
    return res;
}

/* Returns 1 for Unicode characters having the category 'Lt', 0
   otherwise. */

function _PyUnicode_IsTitlecase(ch)
{
    var code = ch.charCodeAt(0);
    var ctype = gettyperecord(code);

    return (ctype.flags & TITLE_MASK) != 0;
}

/* Returns 1 for Unicode characters having the XID_Start property, 0
   otherwise. */

function _PyUnicode_IsXidStart(ch)
{
    var code = ch.charCodeAt(0);
    var ctype = gettyperecord(code);

    return (ctype.flags & XID_START_MASK) != 0;
}

/* Returns 1 for Unicode characters having the XID_Continue property,
   0 otherwise. */

function _PyUnicode_IsXidContinue(ch)
{
    var code = ch.charCodeAt(0);
    var ctype = gettyperecord(code);

    return (ctype.flags & XID_CONTINUE_MASK) != 0;
}

/* Returns the integer decimal (0-9) for Unicode characters having
   this property, -1 otherwise. */

function _PyUnicode_ToDecimalDigit(ch)
{
    var code = ch.charCodeAt(0);
    var ctype = gettyperecord(code);

    return (ctype.flags & DECIMAL_MASK) ? ctype.decimal : -1;
}

function _PyUnicode_IsDecimalDigit(ch)
{
    if (_PyUnicode_ToDecimalDigit(ch) < 0) {
        return 0;
    }
    return 1;
}

/* Returns the integer digit (0-9) for Unicode characters having
   this property, -1 otherwise. */

function _PyUnicode_ToDigit(ch)
{
    var code = ch.charCodeAt(0);
    var ctype = gettyperecord(code);

    return (ctype.flags & DIGIT_MASK) ? ctype.digit : -1;
}

function _PyUnicode_IsDigit(ch)
{
    if (_PyUnicode_ToDigit(ch) < 0) {
        return 0;
    }
    return 1;
}

/* Returns the numeric value as double for Unicode characters having
   this property, -1.0 otherwise. */

function _PyUnicode_IsNumeric(ch)
{
    var code = ch.charCodeAt(0);
    var ctype = gettyperecord(code);

    return (ctype.flags & NUMERIC_MASK) != 0;
}

/* Returns 1 for Unicode characters to be hex-escaped when repr()ed,
   0 otherwise.
   All characters except those characters defined in the Unicode character
   database as following categories are considered printable.
      * Cc (Other, Control)
      * Cf (Other, Format)
      * Cs (Other, Surrogate)
      * Co (Other, Private Use)
      * Cn (Other, Not Assigned)
      * Zl Separator, Line ('\u2028', LINE SEPARATOR)
      * Zp Separator, Paragraph ('\u2029', PARAGRAPH SEPARATOR)
      * Zs (Separator, Space) other than ASCII space('\x20').
*/
function _PyUnicode_IsPrintable(ch)
{
    var code = ch.charCodeAt(0);
    var ctype = gettyperecord(code);

    return (ctype.flags & PRINTABLE_MASK) != 0;
}

/* Returns 1 for Unicode characters having the category 'Ll', 0
   otherwise. */

function _PyUnicode_IsLowercase(ch)
{
    var code = ch.charCodeAt(0);
    var ctype = gettyperecord(code);

    return (ctype.flags & LOWER_MASK) != 0;
}

/* Returns 1 for Unicode characters having the category 'Lu', 0
   otherwise. */

function _PyUnicode_IsUppercase(ch)
{
    var code = ch.charCodeAt(0);
    var ctype = gettyperecord(code);

    return (ctype.flags & UPPER_MASK) != 0;
}

function _PyUnicode_ToLowerFull(ch)
{
    var code = ch.charCodeAt(0);
    var ctype = gettyperecord(code);

    if (ctype.flags & EXTENDED_CASE_MASK) {
        return extractExtended(ctype.lower & 0xFFFF, ctype.lower >> 24);
    }
    return String.fromCharCode(code + ctype.lower);
}

function _PyUnicode_ToTitleFull(ch)
{
    var code = ch.charCodeAt(0);
    var ctype = gettyperecord(code);

    if (ctype.flags & EXTENDED_CASE_MASK) {
        return extractExtended(ctype.title & 0xFFFF, ctype.title >> 24);
    }
    return String.fromCharCode(code + ctype.title);
}

function _PyUnicode_ToUpperFull(ch)
{
    var code = ch.charCodeAt(0);
    var ctype = gettyperecord(code);

    if (ctype.flags & EXTENDED_CASE_MASK) {
        return extractExtended(ctype.upper & 0xFFFF, ctype.upper >> 24);
    }
    return String.fromCharCode(code + ctype.upper);
}

function _PyUnicode_ToFoldedFull(ch)
{
    var code = ch.charCodeAt(0);
    var ctype = gettyperecord(code);

    if (ctype.flags & EXTENDED_CASE_MASK && (ctype.lower >> 20) & 7) {
        var index = (ctype.lower & 0xFFFF) + (ctype.lower >> 24);
        var n = (ctype.lower >> 20) & 7;
        return extractExtended(index, n);
    }
    return _PyUnicode_ToLowerFull(ch);
}

function _PyUnicode_IsCased(ch)
{
    var code = ch.charCodeAt(0);
    var ctype = gettyperecord(code);

    return (ctype.flags & CASED_MASK) != 0;
}

function _PyUnicode_IsCaseIgnorable(ch)
{
    var code = ch.charCodeAt(0);
    var ctype = gettyperecord(code);

    return (ctype.flags & CASE_IGNORABLE_MASK) != 0;
}

/* Returns 1 for Unicode characters having the category 'Ll', 'Lu', 'Lt',
   'Lo' or 'Lm',  0 otherwise. */

function _PyUnicode_IsAlpha(ch)
{
    var code = ch.charCodeAt(0);
    var ctype = gettyperecord(code);

    return (ctype.flags & ALPHA_MASK) != 0;
}
