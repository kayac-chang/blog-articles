# Labeling Regions

Provide labels to distinguish two page regions of the same type,
such as "main navigation" and "sub-navigation" menus using a `<nav>` element on the same page.
Labels are also used to change the default identification of page regions,
for example, to identify a `<aside>` region as "advertisement".
Regions that are unique, such as `<main>`, do not need additional labels.

## Criteria

- [2.4.1 Bypass Blocks][2.4.1]
- [2.4.6 Headings and Labels][2.4.6]

## Approach 1: Using aria-labelledby

Use `aria-labelledby` to point to an existing element by its (unique) `id`.
The label of the region is the current of the referenced element.
Every element can be a label this way.
Labels should be short and descriptive.
If a heading is present in the region, consider using it as the label:

```
<nav aria-labelledby="regionheading">
  <h3 id="regionheading">On this page</h3>
  ...
</nav>
```

## Approach 2: Using aria-label

Use the WAI-ARIA `aria-label` attribute to label the region.
Consider this approach if the label should not appear visually on the page.

```html
<nav aria-label="Main Navigation">...</nav>
```

[2.4.1]: https://www.w3.org/WAI/WCAG21/quickref/#qr-navigation-mechanisms-skip
[2.4.6]: https://www.w3.org/WAI/WCAG21/quickref/#qr-navigation-mechanisms-descriptive
