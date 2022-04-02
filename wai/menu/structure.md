# Menu Structure

Semantic markup conveys the menu structure to users.
Menus coded semantically can easily adapt to different situations,
such as small screen displays, screen magnification, and other assistive technology.

## Criteria

- [4.1.2 Name, Role, Value (Level A)][4.1.2]

## Menu representation

Convey the menu structure, typically by using a list.
Such structural information allows assistive technologies
to announce the number of items in the menu
and provide corresponding navigation functionality.

### Approach 1: Unordered list

Use an unordered list (`<ul>`)
when the menu items are not in a specific order.
Most types of menus, such as website navigation, fall in this category.

```html
<ul>
  <li><a href="...">Home</a></li>
  <li><a href="...">Shop</a></li>
  <li><a href="...">Space Bears</a></li>
  <li><a href="...">Mars Cars</a></li>
  <li><a href="...">Contact</a></li>
</ul>
```

### Approach 2: Ordered list

Use an ordered list (`<ol>`)
when the sequence of the menu items is important.
In the following example,
the menu items represent the steps of a construction manual.

```html
<ol>
  <li><a href="...">Unpacking the Space Craft</a></li>
  <li><a href="...">Check Contents of Package</a></li>
  <li><a href="...">Build Chassis</a></li>
  <li><a href="...">Build Engine</a></li>
  <li><a href="...">Mount Engine to Chassis</a></li>
</ol>
```

## Identify menus

Identify the menu, ideally using the HTML5 `<nav>` element
to allow users access to the menu directly.

## Label menus

Label menus to make them easier to find and understand.
Labels should be short but descriptive,
to allow users to distinguish between multiple menus on a web page.
Use a heading, `aria-label`, or `aria-labelledby` to provide the label.

```html
<nav aria-labelledby="mainmenulabel">
  <h2 id="mainmenulabel" class="visuallyhidden">Main Menu</h2>
</nav>
```

## Indicate the current item

Use markup to indicate the current item of a menu,
such as the current page on a website,
to improve orientation in the menu.

### Approach 1: Using invisible text

Provide an invisible label that is read aloud to screen reader users
and used by other assistive technologies
to mark the current item which allows custom label text.

Remove the anchor(`<a>`),
so users cannot interact with the current item.
That avoids misunderstandings and emphasizes
that the current menu item is active.

In the following example,
the menu item has the invisible text "Current Page:"
and the `<a>` element is replaced by a `<span>` with a class `current`:

```html
<li>
  <span class="current">
    <span class="visuallyhidden">Current Page: </span>
    Space Bears
  </span>
</li>
```

### Approach 2: Using WAI-ARIA

Use the `aria-current="page"` attribute
to indicate the current page in the menu.
This technique is particularly useful
when the anchor (`<a>`) cannot be removed from the HTML.

In the following example the link in the navigation points
to the main content of the page.

```html
<li>
  <a href="#main" aria-current="page">Space Bears</a>
</li>
```

[4.1.2]: https://www.w3.org/WAI/WCAG21/quickref/#qr-ensure-compat-rsv
