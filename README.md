jquery-tablesort3s
==================

A (very) simple jQuery plugin to add 3-state sort widgets to HTML tables.

Tables can have **fake** rows, that is non-sortable data, such as group labels or delimitors spanning over several cells. Such rows will be **hidden** when the table is in a **sorted state** (ascending or descending). That is where the 3rd state, **unsorted** (or default), comes help to restore the **initial** layout as defined in markup.


Demo
------------------

* Simple table : /demo/nutrition.html or [online version](https://luciole75w.github.io/demo/jquery-tablesort3s/demo/nutrition.html)
* Group headers : /demo/msf-2012.html or [online version](https://luciole75w.github.io/demo/jquery-tablesort3s/demo/msf-2012.html)


Code examples
------------------

Default initialization
```javascript
$('.sortable').tablesort3s();
```

Typical initialization with localized hints
```javascript
const options = { hints: ['Ascending sort', 'Descending sort', 'Cancel the ascending sort', 'Cancel the descending sort'] };
$('.sortable').tablesort3s(options);
```

Custom initialization with widgets split off from headers and an explicit class selector for fake rows
```javascript
const options = { widgetsRow: 'tr:last-child', fakeFilter: '.section' };
$('.sortable').tablesort3s(options);
```

Sort on the 3rd column in ascending order (with prior default initialization if needed)
```javascript
$('.sortable').tablesort3s(2, true);
```

Back to unsorted state
```javascript
$('.sortable').tablesort3s(false);
```


Supported options
------------------

* **hints** : array of 4 strings (see examples above)
    These labels are used as hints (tooltips) and also as text content of the widgets (for accessibility).
    Default : `['+', '-', 'x', 'x']`.

* **widgetsRow** : selector or object suitable for the jQuery method [`.filter()`](https://api.jquery.com/filter/)
    Applied on [`<tr>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/tr) elements within `<thead>` to find dedicated cells to bind widgets to. The purpose of this option is accessibility (see the accessibility note below). If specified, the selected row should contain `<td>` elements (instead of `<tr>`) and must have the same number of columns as the table.
    Default : `undefined` (i.e. widgets inside headers).

* **fakeFilter** : selector or object suitable for the jQuery method [`.is()`](https://api.jquery.com/is/)
    Applied on [`<tr>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/tr) elements to check fakes.
    Default : row containing at least one cell having a colspan > 1.

* **noSortFilter** : selector or object suitable for the jQuery method [`.is()`](https://api.jquery.com/is/)
    Applied on [`<th>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/th) elements to prevent widget binding individually.
    Default : the class selector `.nosort`.

* **widgetClass** : string
    Class of the widget container.
    Default : `sort`.

* **forceUI** : boolean
    True to bind the widgets even if the table has less than 2 rows.
    Default : false.

As of v1.1.0, the option `headerRow` is no longer used. For each column, sort widgets are bound to the last (bottom-most) `<th>` element of `<thead>` not spanning multiple columns.


Limitations
------------------

* Column headers **must** be in the `thead` section. Column headers in `tbody` is not supported.

* Multicolumn sort is not supported. Column headers cannot have a colspan > 1.


HTML / CSS
------------------

Each header cell surviving the noSortFilter will be granted the following UI award. A widget with two separate controls to reach any state in one click instead of cycling.

```html
<div class="sort" role="group">
	<button class="sort-asc [sort-on]"> hints[0] </button>
	<button class="sort-desc [sort-on]"> hints[1] </button>
</div>
```

The inner `<button>` elements receive the additional class "sort-on" when they become active (mutually exclusive), either via an UI event or from code.

The `<th>` owners have their `aria-sort` attribute updated when the sort state changes.

Note that these widgets are not necessarily inside their corresponding header cell. It is possible to put widgets apart (using `widgetsRow` option) to improve accessibility.

See the file "css/tablesort3s.css" for an example of widget styling.


Accessibility concerns
------------------

Sort widgets have accessible names (unless hints above are set to empty strings but please do not do that). Since they are, by default, part of header cells, these names are announced by screen readers not only when browsing headers but also when browsing data cells horizontally, which can be very annoying.

To mitigate this issue, you could use the [`abbr` attribute](https://developer.mozilla.org/en-US/docs/Web/API/HTMLTableCellElement#htmltablecellelement.abbr) of `<th>` elements. This attribute looks like the best standard solution to solve the issue but unfortunately, as of now, there are not many combinations of major screen readers / browsers supporting it.

So, to keep your tables as much screen-readers-friendly as possible, the approach i suggest is to move widgets out of header cells if possible, typically in a dedicated row. The option `widgetsRow` will let you specify the row to use.


Update notes
------------------

* Version 1.1.0
	- Automatic selection of header candidates, possibly in different rows (`headerRow` option removed).
	- Support of multiple `tbody` elements. In sorted state, all rows are moved to the first body.
	- Improved accessibility.


Requirements
------------------

jQuery >= 1.12.4 (may work with older versions too)


License
------------------

[Mozilla Public License 2.0](https://www.mozilla.org/en-US/MPL/2.0/)


Credits
------------------

[UglifyJS](https://github.com/mishoo/UglifyJS) for the minified version.


Future development
------------------

Please note that this plugin is not intended to become a swiss army knife of table sorting. It has been done quickly to answer specific simple needs and is very likely to stick to that.

For sophisticated features, there are very good tools among the 5812 js table sorters around, such as this [Mottie/tablesorter](https://github.com/Mottie/tablesorter) plugin or this [tristen/tablesort](https://github.com/tristen/tablesort) alternative in jQuery-free flavor.
