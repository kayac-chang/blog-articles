# Binary Trees in Action

For example, let's say that
we're creating an application
that maintains a list of book titles.
We'd want our application to have the following functionality:

- Our program should be able to print out the list of book titles in alphabetical order.
- Our program should allow for constant changes to the list.
- Our program should allow the user to search for a title within the list.

If we didn't anticipate that our booklist would be changing that often,
an ordered array would be a suitable data structure to contain our data.

However, we're building an app that should be able to handle many changes in realtime.
If our list had millions of titles, we'd better use a binary tree.

Such a tree might look something like this:

Now, we've already covered how to search, insert, and delete data from a binary tree.
We mentioned, though, that
we also want to be able to print the entire list of book titles in alphabetical order.
How can we do that?

Firstly, we need the ability to visit every single node in the tree.
The process of visiting every node in data structure is known as traversing the data structure.

Secondly, we need to make sure that we traverse the tree in alphabetically ascending order
so that we can print out the list in that order.

There are multiple ways to traverse a tree, but for this application,
we will perform what is known as inorder traversal,
so that we can print out each title in alphabetical order.

Recursion is a great tool for performing inorder traversal.
We'll create a recursive function called traverse
that can be called on a particular node.
The function then performs the following steps:

1. Call itself (traverse) on the node's left child if has one.
2. Visit the node. (For our book title app, we print the value of the node at this steps.)
3. Call itself (traverse) on the node's right child if it has one.

For this recursive algorithm,
the base case is when a node has no children,
in which case we simply print the node's title but do not call traverse again.

If we called traverse on the "Moby Dick" node,
we'd visit all the nodes of the tree in the order shown on the diagram.

And that's exactly how we can print out our list of book titles in alphabetical order.
Note that tree traversal is O(N), since by definition,
traversal visits every node of the tree.

Here's a Python traverse_and_print function that works for our list of book titles:

```python
def traverse_and_print(node):
  if node is None:
    return
  traverse_and_print(node.leftChild)
  print(node.value)
  traverse_and_print(node.rightChild)
```

## Exercises 1

In the text I demonstrated how to use inorder traversal
to print a list of all the book titles.

Another way to traverse a tree is known as preorder traversal.
Here is the code for it as applied to our book app:

```python
def traverse_and_print(node):
  if node is None:
    return
  print(node.value)
  traverse_and_print(node.leftChild)
  traverse_and_print(node.rightChild)
```

For the example tree in the text (the one with Moby Dick and the other book titles),
write out the order in which the book titles are printed with preorder traversal.

## Exercises 2

There is yet another form of traversal called postorder traversal.
Here is the code as applied to our book app:

```python
def traverse_and_print(node):
  if node is None:
    return
  traverse_and_print(node.leftChild)
  traverse_and_print(node.rightChild)
  print(node.value)
```

For the example tree in the text (which also appears in the previous exercise),
write out the order in which the book titles are printed with postorder traversal.

