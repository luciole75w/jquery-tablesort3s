jquery-tablesort3s
==================

A (very) simple jQuery plugin to add 3-state sort widgets to HTML tables.

Tables can have **fake** rows, that is non-sortable data, such as group labels or delimitors spanning over several cells. Such rows will be **hidden** when the table is in a **sorted state** (ascending or descending). That is where the 3rd state, **unsorted** (or default), comes help to restore the **initial** layout as defined in markup.


Demo
------------------

* cf. /demo/msf-2012.html


Code examples
------------------

Default initialization :  
```javascript  
$('.sortable').tablesort3s();
```

Typical initialization with localized hints :  
```javascript  
var options = { hints: ['ascending sort', 'descending sort', 'cancel the ascending sort', 'cancel the descending sort'] };  
$('.sortable').tablesort3s(options);
```

Custom initialization with widgets on the 2nd header row and an explicit class selector for fake rows :  
```javascript  
var options = { headerRow: 1, fakeFilter: '.category' };  
$('.sortable').tablesort3s(options);
```

Sort on the 3rd column in ascending order (with prior default initialization if needed) :  
```javascript  
$('.sortable').tablesort3s(2, true);
```

Back to unsorted state :  
```javascript  
$('.sortable').tablesort3s(false);
```


Supported options
------------------

* **hints** : array of 4 strings (see examples above)  
    These labels are used as hints (tooltips) and also as text content of the controls (for accessibility).
    Default : `['+', '-', 'x', 'x']`.

* **headerRow** : number  
    0-based index of the header row to bind widgets on.  
    Default : 0.

* **fakeFilter** : selector or function suitable for the jQuery method [`.is()`](https://api.jquery.com/is/)
    Applied on [`<tr>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/tr) elements to check fakes.
    Default : row containing at least one cell having a colspan > 1.

* **noSortFilter** : selector or function suitable for the jQuery method [`.not()`](https://api.jquery.com/not/)
    Applied on [`<th>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/th) elements to prevent widget binding individually.
    Default : the class selector `.nosort`.

* **widgetClass** : string  
    Class of the widget container.  
    Default : `sort`.

* **forceUI** : boolean  
    True to bind the widgets even if the table has less than 2 rows.  
    Default : false.


HTML / CSS
------------------

Each header cell surviving the noSortFilter will be granted the following UI award. Two separate controls to reach any state in one click instead of cycling.  

```html  
<div class="sort">  
	<button class="sort-asc [sort-on]"> hint[0] </button>
	<button class="sort-desc [sort-on]"> hint[1] </button>
</div>
```

The inner `<button>` elements receive the additional class "sort-on" when they become active (mutually exclusive), either via an UI event or from code.

See the file "css/tablesort3s.css" for an example of widget styling.


Requirements
------------------

jQuery >= 1.6.4  
(not tested with older versions, may work too)


Compatibility
------------------

All decent browsers. IE (6 and later) as well.


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
