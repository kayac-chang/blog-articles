# Styling

Clear and consistent styling
allows users to find and recognize menus more quickly.
Such styling includes consistency
in the behavior, appearance, and relative location on pages across a website.

## Criteria

- [1.4.1 Use of Color][1.4.1]

## General considerations

Menus often use images, such as icons,
that can be decorative or communicate functionality.
These images require text alternatives,
as described in the Images Tutorial.
Contrast requirements are also applicable to menus and their items.

### Location

Display the menu where the target audience of the website expects it.
For example, on websites, the main navigation menu
is commonly located either vertically on the left of the pages (in left-to-right languages),
or horizontally across the top.
Application menus are usually expected horizontally across the top.

### Identification

Ensure that menus and their items are identifiable as such.
In addition to the structural markup discussed in the previous section,
the color scheme is necessary to communicate the presence of menus and items visually.

Consider making the label of menus visible to everyone.

### Readability

Ensure appropriate sizing of menus and menu items to fit all text.
The menu size should also adapt to varying text sizes,
to accommodate languages with longer words
and people who need large text.
Where possible avoid all uppercase text, line breaks, and hyphenation,
as these are often distracting and hard to read.

### Size

Provide sufficient white space, like padding,
to support people with reduced dexterity
and small touch screens on mobile devices.
At the same time, make sure that menus do not overlap themselves
and other content of the page when users increase the text size or zoom the page.

## Menu Items

Convey menu items and their states by using color and other styling options.
Don't rely on color alone as some users will be unable to perceive such changes.

### Default state

Use distinct styling to visually indicate menu items
as regions of the page that can be activated.
However, avoid exaggerated text decoration,
such as words in upper case or small caps,
as these make text harder to read.

### Hover and Focus states

Change hovered or focused menu items,
which gives users visual guidance when navigating the menu.

```css
nav a:hover,
nav a:focus {
  color: #036;
  background-color: #fff;
  text-decoration: underline;
}
```

### Active state

Indicate the menu item that was activated through clicking, tapping, or keyboard selection.
Users can identify unintended activation,
for instance when they have clicked on the wrong menu item.

```css
nav a:active {
  color: #fff;
  background-color: #024;
  text-decoration: underline;
}
```

### Current state

Also visually indicate the current menu item
in addition to the structural markup discussed in the previous section.

```css
nav [aria-current="page"] {
  background-color: #bbb;
  color: #000;
  border-bottom: 0.25em solid #444;
}
```

### Visited state

For some types of menus, such as instructional steps,
it maybe useful to indicate menu items that a user had already visited.
However, most menus are not expected to change based on the visited state.

[1.4.1]: https://www.w3.org/WAI/WCAG21/quickref/#qr-visual-audio-contrast-without-color
