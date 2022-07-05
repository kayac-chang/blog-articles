# Tree

![Tree](https://assets.interviewbit.com/assets/skill_interview_questions/data-structure/tree-data-structure-7472419821158750c121c123b9ee58557e4bca11fa7e13e8fe3fa4ed1c55c85d.png.gz)

## Introduction

A tree is a non-linear data structure where a node can have zero or more connections.
The topmost node in a tree is called root.
The linked nodes to the root are called children or descendants.

Tree structures enable efficient access and efficient update to large collections of data.

## Application

- prioritizing jobs
- describing [mathematical expressions](https://www.youtube.com/watch?v=7tCNu4CnjVc&ab_channel=Computerphile)
- the syntactic elements of computer programs (DOM, 3D Stage... etc)
- drive data compression algorithms

## Terminology

- Parent of a Node:
  The node which is a predecessor of a node
  is called the parent node of that node.

- Child of a Node:
  The node which is the immediate successor of a node
  is called the child node of that node.

- Root of a Tree:
  The topest node of a tree,
  the node which doesn't have any parent node
  is called the root node of the tree.

- Degree of a Node:
  The total count of subtrees attached to that node
  is called the degree of the node.
  The degree of a leaf node must be 0.
  The degree of a tree is the maximum degree of a node among all the nodes in the tree.

- Leaf:
  The nodes which do not have any child nodes are called leaf nodes.

- Ancestor of a Node:
  Any predecessor nodes
  on the path of the root to that node
  are called Ancestors of that node.

- Descendant:
  Any successor node on the path from the leaf node to that node.

- Sibling:
  Children of the same parent node are called siblings.

- Depth of a node:
  The count of edges from the root to the node.

- Height of a node:
  The number of edges on the longest path from that node to a leaf.

- Height of a tree:
  The height of a tree is the height of the root node
  i.e the count of edges from the root to the deepest node.

- Level of a node:
  The count of edges on the path from the root node to that node.

- Neighbour of a node:
  Parent or child nodes of that node are called neighbors of that node.

- Subtree:
  Any node of the tree along with its descendant.
