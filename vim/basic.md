# Basic

## Motions

Motions are used to move around in VIM (move your cursor).
There are two ways of using VIM motions:

- Use motions alone (`:h motion`)

```
h   left
j   down
k   up
l   right
w   move forward to the beginning of the next word
e   move forward to the end of the current word
b   move backward to the start of the current word
}   jump to the next paragraph
$   go to the end of the line
^   go to the start of the line
```

- Use `[count]motion`

Motions accept count numbers as arguments.
If you need to go up 3 lines,
instead of pressing `k` 3 times, you can do `3k`.

## Operators

```
y   yank text (copy)
yy  yank entire line
d   delete text and save to register
dd  delete the entire line
c   delete text, save to register, and start insert mode
```

## Operator + Motion

- yank everything from your current location to the end of the line: `y$`
- yank everything from your current location to the end of the word: `yw`
- to delete from your current location to the end of the line: `d$`
- to delete from your current location to the beginning of the next word: `dw`
- to change from your current location to the end of the current paragraph: `c}`
- to change from your current location to the end of the current word: `cw`
- to yank three characters to the left/right: `y3h/y3l`
- to delete the next two words: `d2w`
- to delete the next 2 lines (delete 3 lines): `d2j`
- to change the next 2 lines (change 3 lines): `c2j`

## Operator + Text Object

two types of text objects: inner (`i + object`) and outer (`a + object`) text objects.

```
w       A word
p       A paragraph
s       A sentance
( or )  A pair of ()
{ or }  A pair of {}
[ or ]  A pair of []
< or >  A pair of <>
t       XML tags
"       A pair of ""
'       A pair of ''
`       A pair of ``
```
