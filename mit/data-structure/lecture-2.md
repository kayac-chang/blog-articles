# MIT 6.006 Introduction to Algorithms 2020 Note - Lecture 2

## Interface (API / ADT) vs Data Structure

### Interface (API / ADT) - What you want to do

- specification
- what data can store
- what operations are support & what hey mean
- problem

### Data Structure - How you do it

- representation
- how to store data
- algorithms to support operations
- solution

### 2 Main Interfaces in this lecture

- Set
- Sequence

### 2 Main DS approaches

- arrays
- pointer based (linked list ...etc)

## Static Sequence Interface

maintain a sequence of items X0, X1, ... , Xn-1,
subject to these operations:

- build(x): make new DS for items in X
- len(): return n
- iter_seq(): output X0, X1, ..., Xn-1 in sequence order
- get_at(i): return Xi (index i)
- set_at(i, x): set Xi to X
