jquery-smartChars
=================

A jQuery plugin to automatically convert characters as you type.

## Usage
    $('textarea').smartChars();

You can optionally pass an object mapping literal characters to replace to their replacement instructions. These instructions take the form of a function, called in the context of the textfield, that returns an object with two parameters:

  + `replacement`: an expression evaluating to a string to replace the input character with
  + `swallow`: a boolean expression instructing the plugin to consume the preceding character during replacement

## Example
    $('textarea').smartChars({
    	's': function() {
    		return {
    			replacement: this.value.charAt(this.selectionStart - 1) === 's' ? 'ß' : false,
    			swallow: true
    		};
    	}
    });

will convert 'ss' to 'ß' on the fly.

## Defaults
Passed no arguments, smartChars will automatically convert
  
  + two consecutive hyphens (--) to an em dash (&mdash;)
  + a double quote (") to an opening double quote (&ldquo;) when directly preceded by the field boundary or a space
  + a double quote (") to a closing double quote (&rdquo;) in all other cases
  + a single quote (') to an opening single quote (&lsquo;) when directly preceded by the field boundary, a space or &ldquo; (for nested quotations)
  + a single quote (') to a closing single quote (&rsquo;) in all other cases
  + an opening single quote (&lsquo;) to a closing single quote (&rsquo;) when immediately followed by a single quote ('), to accommodate cases like Class of &rsquo;09


## Dependencies
	1. jQuery 1.7+
	2. Underscore 1.2+