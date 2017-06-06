const Handlebars = require('handlebars');

Handlebars.registerHelper('form', function (context, options) {
	var ret = "";
	var parsing = context;

	for (item in parsing) {
		//converts camelCase to Camel Case
		var title = item.replace(/([A-Z]+)*([A-Z][a-z])/g, "$1 $2");
		title = title.charAt(0).toUpperCase() + title.slice(1);

		ret += '<div class="form-group"><label for="' + item + '">' + title + '</label>';

		if (parsing[item] != 'textarea') {
			ret += '<input type="' + parsing[item] + '" class="form-control" id="' + item + 'Data">';
		} else {
			ret += '<textarea class="form-control" name="' + item + '" id="' + item + 'Data" rows="5"></textarea>';
		}

		ret += '</div>';
	}

	return ret;
});
