# 48.Group Anagrams

[source](https://leetcode.com/problems/group-anagrams/description/)

Given an array of strings strs, group the anagrams together. You can return the answer in any order.

An Anagram is a word or phrase formed by rearranging the letters of a different word or phrase, typically using all the original letters exactly once.

### Example 1:

```
Input: strs = ["eat","tea","tan","ate","nat","bat"]
Output: [["bat"],["nat","tan"],["ate","eat","tea"]]
```

### Example 2:

```
Input: strs = [""]
Output: [[""]]
```

### Example 3:

```
Input: strs = ["a"]
Output: [["a"]]
```

## Approach

For this question, we can divide it into two sub-questions:

1. How do we determine whether words are anagrams?
2. How do we group words that are anagrams?

So before we start answering the first question,
we need to think about what's make words anagrams.

## How do we determine whether words are anagrams?

According to the description,
an anagram typically **uses all the original letters exactly once**.
This means that if some words are formed as anagrams,
they will have same character set, and each character count should be the same.
We can create a table to count the usage of every character in a single word.
If some words have the same character table, they could be considered as anagrams.

## How do we group words that are anagrams?

We can group words using a map or object,
using the character table as the key because that is how we determine anagrams.
However, in Javascript, we cannot use non-primary values as keys,
Instead of using an array directly,
we can transform the array to a string format using methods such as `.join` or `.toString`.
This way, we can get a unique key for every anagram group.

## Solution

```typescript
function groupAnagrams(strs: string[]): string[][] {
  const group = {};

  for (const str of strs) {
    // str => char table
    const table = Array.from({ length: 26 }).fill(0) as number[];
    for (const char of str) {
      const index = char.charCodeAt(0) - "a".charCodeAt(0);
      table[index] += 1;
    }

    const key = table.join();
    group[key] ??= [];
    group[key].push(str);
  }

  return Object.values(group);
}
```

## Complexity

- Time complexity: $$O(nm)$$

The time complexity of the given code is $$O(nm)$$,
where `n` is the length of the input array `strs`
and `m` is the maximum length of any string in `strs`.

The for loop iterates over the input array strs, which takes $$O(n)$$ time.
Inside this loop, there is another for loop that iterates over the characters in each string.
Since the length of each string can be up to `m`,
the total time complexity of this inner loop across all strings is $$O(nm)$$.

- Space complexity: $$O(nm)$$

The space complexity of the code is $$O(nm)$$,
since we are storing the group object,
which can potentially contain every string in `strs`.
In the worst case, there could be `n` distinct anagram groups, each containing `m` strings of length `m`.
