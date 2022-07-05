# Learn Data Structure - Queue

## Problem

Now, imagine you're a cashier not a programmer
and there have so many customers are waiting for you to checkout.

You are not good at doing multiple tasks at once,
some how the problem is that customers just come together without any rules and orders.

You really want to serve only one customer at the same time,
how do we accomplish that?

## Queue to rescue

You're clever,
by drawing a line using a mark pen
and asked for customers follow the line with the order.

Now, every customers need to follow the rule, first come, first served.
you will never be embarrassed of the fat-finger you have.

And also, we can take advantage of parallel processing
by asking your colleague serve customer if you're busy,
because we asked the customer follow the line,
so they still keeping the order without any hush.

## Queue in Programming

Just like stack,
queue is linear data structure that restricted access to its elements.

There are only two ways to mutate the queue,
one is insert at the end of the queue called _enqueue_,
and another is removed from the start called _dequeue_.

Here is a queue ADT, let's take a look:

```
interface Queue {
  // Reinitialize queue
  void clear();

  // Put element on rear
  boolean enqueue(Object it);

  // Remove and return element from front
  Object dequeue();

  // Return front element
  Object frontValue();

  // Return queue size
  int length();

  // Return true if the queue is empty
  boolean isEmpty();
}
```

## Implementation - Array-Based

## Implementation - Pointer-Based
