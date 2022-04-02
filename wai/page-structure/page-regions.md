# Page Regions

Mark up different regions of web pages and applications,
so that they can be identified by web browsers and assistive technologies.

### Page header

Most website have a region at the top of every page
that contains site-wide information,
such as the website logo, search function, and navigation options.
HTML5 provides the `<header>` element,
which can be used to define such a region.

> **Note**
> If the `<header>` element is used inside `<article>` and `<section>` elements,
> it is not associated to those elements.
> It does not get the WAI-ARIA banner role
> and does not have special behavior in assistive technologies.

```html
<header>
  <img src="/images/logo.png" alt="SpaceBear Inc." />
</header>
```

### Page footer

Similar to the page header,
most website also have a region at the bottom of every page
that contains site-wide information,
such as copyright information, privacy statements, or disclaimers.
HTML5 provides the `<footer>` element,
which can be used to define such a region.

> **Note**
> If the `<footer>` element is used inside `<article>` and `<section>` elements,
> it is not associated to those elements.
> It does not get the WAI-ARIA contentinfo role
> and does not have special behavior in assistive technologies.

```html
<footer>
  <p>&copy; 2014 SpaceBears Inc.</p>
</footer>
```

### Navigation

The HTML5 `<nav>` element can be used to identify a navigation menu.
A web page can have any number of navigation menus.
Use labels to identify each navigation menu.

```html
<nav aria-label="Main Navigation"></nav>

<nav aria-labelledby="quicknav-heading">
  <h5 id="quicknav-heading">Quick Navigation</h5>
</nav>
```

The Menus tutorial provides more details on creating menus.

### Main content

Use the HTML5 `<main>` element
to identify the main content region of a web page or application.

```html
<main>
  <h1>Stellar launch weekend for the SpaceBear 7!</h1>
</main>
```

### Complementary content

Use the HTML5 `<aside>` element to identify regions
that support the main content,
yet are separate and meaningful sections on their own;
For example,
a side note explaining or annotating the main content.

```html
<aside>
  <h3>Related Articles</h3>
</aside>
```

### Legacy

Most current web browsers support the above HTML5 elements
and convey the information to assistive technology
through the accessibility APIs.
However, to maximize compatibility with web browsers
and assistive technologies that support WAI-ARIA
but do not yet support HTML5,
it is currently advisable to use both the HTML5 elements
and the corresponding WAI-ARIA roles.

```html
<header role="banner"></header>
<main role="main"></main>
<nav role="navigation"></nav>
<footer role="contentinfo"></footer>
```

In HTML4,

```html
<div role="banner"></header>
<div role="main"></main>
<div role="navigation"></nav>
<div role="contentinfo"></footer>
```
