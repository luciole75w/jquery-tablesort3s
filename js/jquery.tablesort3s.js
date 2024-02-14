/**
 * The JavaScript code in this file is free software: you can redistribute it
 * and/or modify it under the terms of the Mozilla Public License version 2.0
 * (MPL 2.0) as published by the Mozilla Foundation.
 * The code is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the <a href="https://www.mozilla.org/en-US/MPL/2.0/">license</a> for
 * more details.
 *
 * @license  Mozilla Public License 2.0
 * @author   luciole75w@disroot.org
 */
'use strict';

(function($){

//----------------------------------------------------------------------------
// Public API
//
$.fn.extend({
	//----------------------------------------------------------------------------
	// Bind 3-state sort widgets to tables with static content and/or sort/unsort them.
	// Called in the context of a jQuery object.
	//
	tablesort3s: function(param, ascending) {
		return this.filter('table').each(function() {
			let sorter = $(this).data('tablesort3s');

			if (sorter === undefined) {
				sorter = new TableSorter(this, typeof param == 'object' ? param : {});
				$(this).data('tablesort3s', sorter);
			}
			
			if (typeof param == 'number' || param === false)
				sorter.sort(param, ascending);
		});
	}
});

//----------------------------------------------------------------------------
// SortableRow class
//
class SortableRow {
	constructor(row, fakeFilter) {
		this.$row = $(row);

		// in sorted state, all rows are moved to the first tbody
		this.$initialSection = this.$row.parent();
		this.$sortedSection = this.$initialSection.parent().children('tbody').first();

		this.fake = fakeFilter !== undefined ?
			this.$row.is(fakeFilter) :
			this.$row.children().is(function() { return this.colSpan > 1; });

		// the (unique) initial index of the row is also useful as a fallback id for cells
		// with same content (stable sort)
		this.rank = row.rowIndex;

		if (this.fake)
			// arbitrary but distinct values help speed up a bit the compare function
			this.fakeKey = { text: '#' + this.rank, num: this.rank };
		else
			this.keys = this.parse();
	}

	//----------------------------------------------------------------------------
	// Either move the row to the end of the appropriate tbody or detach it.
	//
	updateDOM(sorted) {
		if (this.fake && sorted)
			this.$row.detach();
		else
			// already attached so actually set as last child
			this.$row.appendTo(sorted ? this.$sortedSection : this.$initialSection);
	}

	//----------------------------------------------------------------------------
	// Extract a sort key from each cell combining at least the text content (lowercased)
	// + a numerical digest when possible (leading part).
	//
	parse() {
		return $.map(this.$row.prop('cells'), function(cell) {
			const text = $(cell).text().toLowerCase();
			// real numbers must have an explicit integer part (no .5 instead of 0.5)
			const numDigest = /^[+-]?\d+(?:\.\d+)?/.exec(text);
			return {
				text: text,
				num: numDigest !== null ? Number(numDigest[0]) : null
			};
		});
	}

	//----------------------------------------------------------------------------
	// First compare numerically if possible, then switch to text mode and finally use the initial
	// rank for same content. The keys also respect a prior class order (required for transitivity),
	// here we have text < num.
	//
	static comparator(column, ascending) {
		if (column === false)
			return function(r1, r2) { return r1.rank - r2.rank; }; // restore the initial rank (ascending implicit)

		return function(r1, r2) {
			const k1 = r1.fake ? r1.fakeKey : r1.keys[column];
			const k2 = r2.fake ? r2.fakeKey : r2.keys[column];
			let res;

			if (k1.num !== k2.num)
				res = k1.num !== null ? (k2.num !== null ? k1.num - k2.num : 1) : -1;
			else if (k1.text < k2.text)
				res = -1;
			else if (k1.text > k2.text)
				res = 1;
			else
				return r1.rank - r2.rank; // always ascending on initial rank for same content (stable)

			return ascending ? res : -res;
		};
	}
}
// end of SortableRow class

//----------------------------------------------------------------------------
// TableSorter class
// options supported so far : hints, headerRow, fakeFilter, noSortFilter, widgetClass, forceUI
//
class TableSorter {
	static defaultHints = ['+', '-', 'x', 'x'];

	constructor(table, options) {
		this.headerCells = table.tHead.rows[options.headerRow || 0].cells;

		this.source = Array.prototype.flatMap.call(
			table.tBodies,
			(body) => Array.prototype.map.call(
				body.rows,
				(row) => new SortableRow(row, options.fakeFilter))); // sortable version of the original data

		const hints = Object.assign([], TableSorter.defaultHints, options.hints);
		this.hinter = function() {
			const hintIndex = 2 * $(this).hasClass('sort-on') + !$(this).hasClass('sort-asc');
			return hints[hintIndex];
		};

		if (this.source.length > 1 || options.forceUI)
			this.bindWidgets(this, options.noSortFilter, options.widgetClass);
	}

	//----------------------------------------------------------------------------
	// Bind 2 sort buttons on each column unless its header please the filter (class selector
	// '.nosort' by default)
	//
	bindWidgets(sorter, filter, widgetClass) {
		$(this.headerCells)
			.not(filter !== undefined ? filter : '.nosort')
			.each(function(i, cell) {
				const $sortWidget = $('<div>')
					.addClass(widgetClass || 'sort')
					.append($('<button class="sort-asc" />'))
					.append($('<button class="sort-desc" />'));

				// common settings for ascending and descending buttons
				$sortWidget.children()
					.on('click', function() {
						sorter.sort(
							$(this).hasClass('sort-on') ? false : cell.cellIndex,
							$(this).hasClass('sort-asc'));
					})
					.attr({
						type: 'button', // in case the table is in a form
						title: sorter.hinter,
					})
					.text(function() { return this.title; });

				$sortWidget.appendTo(cell);
			});
	}

	//----------------------------------------------------------------------------
	// Sort the table according to column/order or restore the default (initial) order
	// if column = false, and update the UI.
	//
	sort(column, ascending) {
		// update the state of header buttons
		$('.sort-on', this.headerCells)
			.removeClass('sort-on')
			.attr('title', this.hinter)
			.text(function() { return this.title; });

		if (column !== false)
			$(ascending ? '.sort-asc' : '.sort-desc', this.headerCells[column])
				.addClass('sort-on')
				.attr('title', this.hinter)
				.text(function() { return this.title; });
		
		// sort/unsort the row source in memory
		this.source.sort(SortableRow.comparator(column, ascending));
		
		// update the DOM pushing data rows to the end in order and detaching fake rows
		// if not in default order
		$.each(this.source, function() { this.updateDOM(column !== false); });
	}
}
// end of TableSorter class

})(jQuery);
