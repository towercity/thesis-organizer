const Handlebars = require('handlebars');

Handlebars.registerHelper('table', function (context, options) {
	var ret = "<tr>";
	var parsing = context;

	//grabs and prints headings from first bib item
	for (heading in parsing[0]) {
		ret += '<th>' + heading + '</th>';
	}
	ret += '<tr>';

	for (book in parsing) {
		ret += '<tr>';

		for (item in parsing[book]) {
			ret += '<td>' + parsing[book][item] + '</td>';
		}

		ret += '</tr>';
	}

	return ret;
});
