/**
 * The JavaScript code in this file is free software: you can redistribute it
 * and/or modify it under the terms of the Mozilla Public License version 2.0
 * (MPL 2.0) as published by the Mozilla Foundation.
 * The code is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the license <http://mozilla.org/MPL/2.0/> for more details.
 *
 * @license		Mozilla Public License 2.0	http://mozilla.org/MPL/2.0/
 * @author		luciole75w <luciole75w@gmail.com>
 */

(function($){
'use strict';

//----------------------------------------------------------------------------
// Public API
//
$.fn.extend(
{
	//----------------------------------------------------------------------------
	// Bind 3-state sort widgets to tables with static content and/or sort/unsort them. Called in the context of a jQuery object.
	//
	tablesort3s: function(param, ascending)
	{
		return this.filter('table').each(function()
		{
			var sorter = $(this).data('tablesort3s');
			if (!sorter)
				$(this).data('tablesort3s', sorter = new TableSorter(this, typeof param == 'object' ? param : {}));
			
			if (typeof param == 'number' || param === false)
				sorter.sort(param, ascending);
		});
	}
});

//----------------------------------------------------------------------------
// SortableRow class
//
function SortableRow(row, fakeFilter)
{
	this.$row = $(row);
	this.$tbody = this.$row.parent();
	this.fake = fakeFilter ? this.$row.is(fakeFilter) : this.$row.children().is(function() { return this.colSpan > 1; }); // 'td[colspan]' bugged in IE8
	this.rank = row.rowIndex; // the (unique) initial index of the row is also useful as a fallback id for cells with same content (stable sort)

	if (this.fake)
		this.fakeKey = { text: '#' + this.rank, num: this.rank }; // arbitrary but distinct values help speed up a bit the compare function
	else
		this.keys = this.parse();
}

SortableRow.prototype =
{
	//----------------------------------------------------------------------------
	// Either move the row to the end of tbody or detach it.
	//
	updateDOM: function(discardFake)
	{
		if (this.fake && discardFake)
			this.$row.detach();
		else
			this.$row.appendTo(this.$tbody); // already attached so actually set as last child
	},
	//----------------------------------------------------------------------------
	// Extract a sort key from each cell combining at least the text content (lowercased) + a numerical digest when possible (leading part).
	//
	parse: function()
	{
		return $.map(this.$row.prop('cells'), function(cell)
		{
			var text = $(cell).text().toLowerCase();
			var numDigest = /^[+-]?\d+(?:\.\d+)?/.exec(text); // real numbers must have an explicit integer part (no .5 instead of 0.5)
			return { text: text, num: numDigest !== null ? Number(numDigest[0]) : null };
		});
	}
};

//----------------------------------------------------------------------------
// First compare numerically if possible, then switch to text mode and finally use the initial rank for same content.
// The keys also respect a prior class order (required for transitivity), here we have text < num.
//
SortableRow.comparator = function(column, ascending)
{
	if (column === false)
		return function(r1, r2) { return r1.rank - r2.rank; }; // restore the initial rank (ascending implicit)
	
	return function(r1, r2)
	{
		var k1 = r1.fake ? r1.fakeKey : r1.keys[column];
		var k2 = r2.fake ? r2.fakeKey : r2.keys[column];
		var res;
		
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
};

// end of SortableRow class

//----------------------------------------------------------------------------
// TableSorter class
// options supported so far : hints, headerRow, fakeFilter, noSortFilter, widgetClass, forceUI
//
function TableSorter(table, options)
{
	this.headerCells = table.tHead.rows[options.headerRow || 0].cells;
	this.source = $.map(table.tBodies[0].rows, function(row) { return new SortableRow(row, options.fakeFilter); }); // sortable version of the original data
	this.hinter = options.hints ? function() { return options.hints[2 * $(this).hasClass('sort-on') + !$(this).hasClass('sort-asc')]; } : ''; // hint mapper
	
	if (this.source.length > 1 || options.forceUI)
		this.bindWidgets(this, options.noSortFilter, options.hints, options.widgetClass);
}

TableSorter.prototype =
{
	//----------------------------------------------------------------------------
	// Bind 2 sort buttons on each column unless its header please the filter (class selector '.nosort' by default)
	//
	bindWidgets: function(sorter, filter, hints, widgetClass)
	{
		$(this.headerCells).not(filter ? filter : '.nosort').each(function(i, cell)
		{
			var $sortWidget = $('<div>').addClass(widgetClass || 'sort')
				.append($('<div>').addClass('sort-asc').text(hints ? hints[0] : '+'))
				.append($('<div>').addClass('sort-desc').text(hints ? hints[1] : '-'));
				
			// common settngs for ascending and descending buttons
			$sortWidget.children()
				.click(function() { sorter.sort($(this).hasClass('sort-on') ? false : cell.cellIndex, $(this).hasClass('sort-asc')); })
				.keyup(function(e) { if (e.which == 13) this.click(); })
				.attr({ tabindex: 0, title: sorter.hinter });
			
			$sortWidget.appendTo(this);
		});
	},
	//----------------------------------------------------------------------------
	// Sort the table according to column/order or restore the default (initial) order if column = false, and update the UI.
	//
	sort: function(column, ascending)
	{
		// update the state of header buttons
		$('.sort-on', this.headerCells).removeClass('sort-on').attr('title', this.hinter);
		if (column !== false)
			$(ascending ? '.sort-asc' : '.sort-desc', this.headerCells[column]).addClass('sort-on').attr('title', this.hinter);
		
		// sort/unsort the row source in memory
		this.source.sort(SortableRow.comparator(column, ascending));
		
		// update the DOM pushing data rows to the end in order and detaching fake rows if not in default order
		$.each(this.source, function() { this.updateDOM(column !== false); });
	}
};

// end of TableSorter class

})(jQuery);
