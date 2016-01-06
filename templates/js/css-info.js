var allClassElements;
var defaultCategoryCount;

function cssInfoReapplyFilter() {
	var search = $('#search').val();
	var state = $('#state-input').val();
	var media = $('#media-input').val();

	var items = allClassElements.map(function() {
		var el = $(this);
		var data = el.data();
		return _.extend({
		}, data);
	}).get();

	if(state) {
		items = _.filter(items, function(item) {
			return _.contains(item.states, state);
		});
	} else {
		items = _.filter(items, function(item) {
			return !item.states || !item.states.length;
		});
	}

	if(media) {
		items = _.filter(items, function(item) {
			return _.contains(item.medias, media);
		});
	} else {
		items = _.filter(items, function(item) {
			return !item.medias || !item.medias.length;
		});
	}

	var sifter = new Sifter(items);
	var result = sifter.search(search, {
		fields: ['name', 'properties', 'values'],
	});
	allClassElements.css('display', 'none').removeClass('is-css-info-match');
	var matchedItems = _.map(result.items, function(item) {
		return items[item.id];
	});
	var categoryCount = {};
	_.each(matchedItems, function(item) {
		$('#css-info-class-'+ item.name).css('display', 'inline-block').addClass('is-css-info-match');
		categoryCount[item.category] = (categoryCount[item.category] || 0) + 1;
	});
	$('.js-css-info-category-count').each(function() {
		var category = $(this).data('category');
		$(this).html((categoryCount[category] || 0) + '/' + defaultCategoryCount[category]);
	});
	$('.js-css-info-item').removeClass('is-css-info-match').css('display', 'none')
		.has('.js-css-info-class.is-css-info-match').addClass('is-css-info-match').css('display', 'flex');
	$('.js-css-info-category').removeClass('is-css-info-match').css('display', 'none')
		.has('.js-css-info-item.is-css-info-match').addClass('is-css-info-match').css('display', 'block');
}

function setExampleBgValue(value) {
	console.log(value);
	$('.js-css-info-dynamic-bg').css('background', value.bg);
	$('.js-css-info-dynamic-border-color').css('border-color', value['border-color']);
	$('.js-css-info-dynamic-color').css('color', value.fg);
	$('.js-css-info-dynamic-box-bg').css('background', value.fg);
}

$(function() {
	allClassElements = $('.js-css-info-class');

	defaultCategoryCount = {};
	allClassElements.each(function() {
		var category = $(this).data('category');
		defaultCategoryCount[category] = (defaultCategoryCount[category] || 0) + 1;
	});

	cssInfoReapplyFilter();
	$('#search').on('input', _.throttle(cssInfoReapplyFilter, 100));
	$('#state-input').on('change', cssInfoReapplyFilter);
	$('#media-input').on('change', cssInfoReapplyFilter);

	$('#example-bg-input').on('change', function(event) {
		setExampleBgValue(JSON.parse($(this).val()));
	}).trigger('change');
});
