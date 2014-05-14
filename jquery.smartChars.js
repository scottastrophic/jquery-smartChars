(function($) {

  var isCursorAtFieldStart = function() {
    return this.selectionStart === 0;
  }, isSelectionPrecededBy = function(regexp) {
    return regexp.test(this.value.charAt(this.selectionStart - 1));
  }, replacementMap = {
      "'" : function() {
        // Rotate through ‘ ’ and ' when pressing the apostrophe key
        var replacement, swallow;
        if (isCursorAtFieldStart.call(this) || isSelectionPrecededBy.call(this, /\s|“/)) {
          replacement = '‘';
          swallow = false;
        } else if (isSelectionPrecededBy.call(this, /’/)) {
          replacement = "'";
          swallow = true;
        } else {
          replacement = '’';
          swallow = isSelectionPrecededBy.call(this, /‘/);
        }
        return {
          replacement: replacement,
          swallow: swallow
        };
      },
      '"' : function() {
        return {
          replacement: (isCursorAtFieldStart.call(this) || isSelectionPrecededBy.call(this, /\s/)) ?  '“' : '”',
          swallow: false
        };
      },
      '-' : function() {
        return {
          replacement: (isSelectionPrecededBy.call(this, /\-/)) ? '—' : false,
          swallow: true
        };
      }
    },
    methods = {
      init : function(userReplacementMap) {
        return this.each(function() {
          var $this = $(this);
          if (!$this.data('smartChars'))
            $this.data('smartChars', new $.SmartChars(this, $.extend(replacementMap, userReplacementMap)));
        });
      },
      destroy : function() {
        return this.each(function() {
          $(this).off('.smartChars').data('smartChars', undefined);
        });
      }
    };
  $.fn.smartChars = function(method) {

    if (methods[method]) {
      return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
    } else if (typeof method === 'object' || !method) {
      if (window._)  return methods.init.apply(this, arguments);
      else $.error('Sorry, underscore or lodash must be installed to use this plugin!');
    } else {
      $.error('What is this jQuery.smartChars("' + method + '") you speak of?');
    }

  };
  $.SmartChars = function(field, map) {
    var monitoredChars = _.keys(map);

    $(field).on('keypress.smartChars', function(event) {

      var pressedChar = String.fromCharCode(event.which),
        characterWasSmartened = processCharacter(pressedChar),
        start = field.selectionStart,
        text = field.value;

      // Add unchanged characters to the field (automatic for genuine keypress, but not when triggered by paste)
      if (!characterWasSmartened) {
        field.value = text.slice(0, field.selectionStart) + pressedChar + text.slice(field.selectionEnd);
        field.selectionStart = field.selectionEnd = start + 1;
      }
      return false;
      
    }).on('paste.smartChars', function(event) {
      var field = event.target,
        prePasteStart = field.selectionStart;

      // Set to run after pasted text is in the field:, this simulates a keypress event
      // for each character in the pasted text so they are handled just as if entered one-by-one
      setTimeout(function() {
        var postPastePosition = field.selectionStart,
          text = field.value,
          textPrecedingPaste = text.slice(0, prePasteStart),
          pastedText = text.slice(prePasteStart, postPastePosition),
          textFollowingPaste = text.slice(postPastePosition);

        field.value = textPrecedingPaste + textFollowingPaste;
        field.selectionStart = field.selectionEnd = prePasteStart;

        for (var i = 0; i < pastedText.length; i++) {
          var e = $.Event( 'keypress', { which: pastedText.charCodeAt(i) } );
          $(field).trigger(e);
        }
      }, 50);
    });
    function processCharacter(pressedChar) {
      // If this is a vanilla key not in our map, stop here
      if (!_.contains(monitoredChars, pressedChar)) return;
      
      var instructions = map[pressedChar].call(field);
      if (instructions.replacement) {
        replaceCharWith(instructions.replacement, instructions.swallow);
        return true;
      }

    }
    function replaceCharWith(replacement, swallowPrecedingChar) {
      var start = field.selectionStart,
        val = field.value;
      if (swallowPrecedingChar) start--;
      field.value = val.slice(0, start) + replacement + val.slice(field.selectionEnd);
      // place the cursor after the replacement character
      field.selectionStart = field.selectionEnd = start + 1;
    }
  };

})(jQuery);