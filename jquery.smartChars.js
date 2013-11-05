(function($) {

	var isCursorAtFieldStart = function() {
		return this.selectionStart === 0;
	}, isSelectionPrecededBy = function(regexp) {
		return regexp.test(this.value.charAt(this.selectionStart - 1));
	}, replacementMap = {
			"'" : function() {
				return {
					replacement: (isCursorAtFieldStart.call(this) || isSelectionPrecededBy.call(this, /\s|“/)) ? '‘' : '’',
					swallow: isSelectionPrecededBy.call(this, /‘/)
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
			if (window._)	return methods.init.apply(this, arguments);
			else $.error('Sorry, underscore or lodash must be installed to use this plugin!');
		} else {
			$.error('What is this jQuery.smartChars("' + method + '") you speak of?');
		}

	};
	$.SmartChars = function(field, map) {
		var monitoredChars = _.map(_.keys(map), function(key) {
			return key.charCodeAt(0);
		});

		$(field).on('keypress.smartChars', function(event) {
			var pressedChar = event.which,
				charSmartened = false;
			
			// If this is a vanilla key not in our map, stop here
			if (!_.contains(monitoredChars, pressedChar))
				return;
			
			charSmartened = guessChar(pressedChar);
			
			return !charSmartened;
		});
		function guessChar(charCode) {
			var pressedChar = String.fromCharCode(charCode),
				instructions = map[pressedChar].call(field);
			if (instructions.replacement) {
				replaceCharWith(instructions.replacement, instructions.swallow);
				return true;
			} else return false;
			
		}
		function replaceCharWith(replacement, swallowPrecedingChar) {
			var start = field.selectionStart,
				val = field.value;
			if (swallowPrecedingChar) start--;
			field.value = val.substring(0, start) + replacement + val.substring(field.selectionEnd);
			// place the cursor after the replacement character
			field.selectionStart = field.selectionEnd = start + 1;
		}
	};

})(jQuery);