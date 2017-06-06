const Handlebars = require('handlebars');

Handlebars.registerHelper('form', function (context, options) {
	var ret = "";
	var parsing = context;

	for (item in parsing) {
		ret += '<div class="form-group"><label for="' + item + '">' + item + '</label>';

		if (parsing[item] != 'textarea') {
			ret += '<input type="' + parsing[item] + '" class="form-control" id="' + item + 'Data">';
		} else {
			ret += '<textarea class="form-control" name="' + item + '" id="' + item + 'Data" rows="5"></textarea>';
		}

		ret += '</div>';
	}

	return ret;
});
