var sgp = require('supergenpass-lib');


function fillPasswords(password) {
	function getPwdInputs() {
		var result = [];
		var inputs = document.getElementsByTagName("input");

		for (var i = 0; i < inputs.length; i++) {
			if (inputs[i].type.toLowerCase() === "password") {
				result.push(inputs[i]);
			}
		}
		return result;
	}

	var pwdInputs = getPwdInputs();

	for (var i = 0; i < pwdInputs.length; i++) {
		pwdInputs[i].value = password;
	}
}



function validateForm() {
    var valid = true;
    $('.check-empty').each(function (i, elem) {
        if (!$(elem).val()) {
            valid = false;
            $(elem).addClass('is-invalid');
        } else {
            $(elem).removeClass('is-invalid');
        }
    });
    return valid;
}


document.addEventListener("DOMContentLoaded", function() {
	chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function (tabs) {
		var url = new URL(tabs[0].url);
		document.getElementById('domain').value = url.hostname;
	});

	var btn = document.getElementById('generate-btn');
	var $generated = $('#generated');
	var $generatedContainer = $('#generated-container');
	var $copy = $('#copy');

	$generated.change(function() {
		if ($generated.val() && $generated.val().length >= 1) {
		    $generatedContainer.show();
		} else {
		    $generatedContainer.hide();
		}
	});

	$copy.click(function() {
		if ($generated.val() && $generated.val().length >= 1) {
			$generated.select();
			document.execCommand('copy');
		}
	});

	btn.addEventListener('click', function() {
		if (!validateForm()) {
		    $generated.val('') && $generatedContainer.hide();
			return;
		}

		// Load settings
        var includeSymbols = document.getElementById('symbols').checked;
        var length = parseInt($('#length').val());

        // Load required things
		var password = document.getElementById('password').value;
		var uri = document.getElementById('domain').value;

		sgp.generate(password, uri, {length: length}, function(password) {
			// Important.
			if (includeSymbols) {
				password += '!';
			}

			chrome.tabs.executeScript({
				code: '(' + fillPasswords + ')(\"' + password + '\");'  // Seems oddly hacky.
			});

			$generated.val(password) && $generated.change();
			$generated.change();
		});
	});

	$('input').keypress(function(e) {
		if (e.which === 13) {
			$(btn).click();
		}
	});

	$('.stored-setting').change(function(){
		var key = $(this).attr('id');
		var value;
	    if ($(this).attr('type') === 'checkbox') {
			value = $(this).prop('checked');
		} else {
	    	value = $(this).val();
		}

		var toStore = {};
	    toStore[key] = value;
		chrome.storage.sync.set(toStore);
	}).each(function(i) {
	    // Used to load all the settings when the extension is opened.
        var $elem = $(this);
		var key = $elem.attr('id');

		chrome.storage.sync.get(key, function(result){
			var value = result[key];

            if (value) {
                if ($elem.attr('type') === 'checkbox') {
                    $elem.prop('checked', value)
                } else {
                    if ($elem.attr('type') === "number") {
                    	value = parseInt(value);
					}
                    $elem.val(value);
                }
            }
		});
	});
}, false);

