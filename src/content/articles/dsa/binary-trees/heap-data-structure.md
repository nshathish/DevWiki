---
title: Heap Data Structure
description: Checklist of Heap Data Structure topics from beginner to advanced.
category: Data Structures and Algorithms
published: 2026-09-16
minutes: 10
sidebar:
    order: 1
---

# Heap Data Structure

## 1. What is a Heap?

A **heap** is a special **complete binary tree** that follows a heap-order rule.

```text
Heap = Complete Binary Tree + Heap Property
```

A **complete binary tree** is filled:

- level by level
- from left to right

---

## 2. Min-Heap

A **min-heap** follows this rule:

```text
parent <= children
```

Example:

```text
        2
       / \
      5   8
     / \
    9   7
```

Important property:

```text
root = minimum value
```

So getting the minimum value is:

```text
O(1)
```

A min-heap is **not fully sorted**. Only the parent-child relationship matters.

---

## 3. Max-Heap

A **max-heap** follows this rule:

```text
parent >= children
```

Example:

```text
        20
       /  \
      15   12
     / \
    8  10
```

Important property:

```text
root = maximum value
```

So getting the maximum value is:

```text
O(1)
```

---

## 4. Heap vs Binary Search Tree

A BST follows:

```text
left < parent < right
```

A heap follows:

```text
Min-heap: parent <= children
Max-heap: parent >= children
```

A heap does **not** care whether the left child is smaller than the right child.

---

## 5. Array Representation

Heaps are usually stored in arrays/lists instead of using explicit tree nodes.

Example tree:

```text
        2
       / \
      5   8
     / \
    9   7
```

Stored as:

```python
heap = [2, 5, 8, 9, 7]
```

For a node at index `i`:

```python
left = 2 * i + 1
right = 2 * i + 2
parent = (i - 1) // 2
```

These formulas work because a heap is a **complete binary tree**.

---

# Min-Heap Operations

## 6. Insert into a Min-Heap

Steps:

```text
1. Append the new value at the end
2. Compare it with its parent
3. If child < parent, swap
4. Repeat upward
```

This process is called:

- sift up
- bubble up
- heapify up

Code:

```python
def insert_min(heap, value):
    heap.append(value)

    i = len(heap) - 1

    while i > 0:
        parent = (i - 1) // 2

        if heap[i] < heap[parent]:
            heap[i], heap[parent] = heap[parent], heap[i]
            i = parent
        else:
            break
```

Example:

```python
heap = [4, 7, 6, 10, 9]

insert_min(heap, 2)

print(heap)
```

Output:

```python
[2, 7, 4, 10, 9, 6]
```

The inserted `2` swaps:

```text
2 <-> 6
2 <-> 4
```

Complexity:

```text
O(log n)
```

---

## 7. Remove Root from a Min-Heap

For a min-heap:

```text
root = minimum
```

So removing the root removes the minimum value.

Steps:

```text
1. Save the root
2. Move the last element to the root
3. Remove the last position
4. Sift down
```

During sift-down:

```text
swap with the smaller child
```

Code:

```python
def remove_min(heap):
    if not heap:
        return None

    if len(heap) == 1:
        return heap.pop()

    min_value = heap[0]

    heap[0] = heap.pop()

    i = 0

    while True:
        left = 2 * i + 1
        right = 2 * i + 2
        smallest = i

        if left < len(heap) and heap[left] < heap[smallest]:
            smallest = left

        if right < len(heap) and heap[right] < heap[smallest]:
            smallest = right

        if smallest == i:
            break

        heap[i], heap[smallest] = heap[smallest], heap[i]
        i = smallest

    return min_value
```

Example:

```python
heap = [2, 5, 4, 9, 7, 8]

removed = remove_min(heap)

print(removed)
print(heap)
```

Output:

```text
2
[4, 5, 8, 9, 7]
```

Complexity:

```text
O(log n)
```

---

# Max-Heap Operations

## 8. Insert into a Max-Heap

For a max-heap:

```text
parent >= children
```

After appending a new value:

```text
if child > parent:
    swap upward
```

Code:

```python
def insert_max(heap, value):
    heap.append(value)

    i = len(heap) - 1

    while i > 0:
        parent = (i - 1) // 2

        if heap[i] > heap[parent]:
            heap[i], heap[parent] = heap[parent], heap[i]
            i = parent
        else:
            break
```

Example:

```python
heap = [20, 15, 12, 8, 10]

insert_max(heap, 25)

print(heap)
```

Output:

```python
[25, 15, 20, 8, 10, 12]
```

Complexity:

```text
O(log n)
```

---

## 9. Remove Root from a Max-Heap

For a max-heap:

```text
root = maximum
```

So removing the root removes the largest value.

Steps:

```text
1. Save the root
2. Move the last element to the root
3. Remove the last position
4. Sift down
```

During sift-down:

```text
swap with the larger child
```

Code:

```python
def remove_max(heap):
    if not heap:
        return None

    if len(heap) == 1:
        return heap.pop()

    max_value = heap[0]

    heap[0] = heap.pop()

    i = 0

    while True:
        left = 2 * i + 1
        right = 2 * i + 2
        largest = i

        if left < len(heap) and heap[left] > heap[largest]:
            largest = left

        if right < len(heap) and heap[right] > heap[largest]:
            largest = right

        if largest == i:
            break

        heap[i], heap[largest] = heap[largest], heap[i]
        i = largest

    return max_value
```

Example:

```python
heap = [25, 15, 20, 8, 10, 12]

removed = remove_max(heap)

print(removed)
print(heap)
```

Output:

```text
25
[20, 15, 12, 8, 10]
```

Complexity:

```text
O(log n)
```

---

# 10. Important Sift-Down Detail

For a min-heap:

```text
swap with the smaller child
```

For a max-heap:

```text
swap with the larger child
```

Example for min-heap:

```python
if left < len(heap) and heap[left] < heap[smallest]:
    smallest = left

if right < len(heap) and heap[right] < heap[smallest]:
    smallest = right
```

The order of checking left and right does **not** matter.

What matters is comparing against:

```python
heap[smallest]
```

because `smallest` stores the best candidate found so far.

Also, the bounds check must come first:

```python
left < len(heap)
```

before accessing:

```python
heap[left]
```

---

# 11. Find the Kth Largest Element Using a Min-Heap

Example:

```python
arr = [4, 5, 9, 12, 9, 22, 45, 7]
k = 4
```

Goal:

```text
4th largest = 9
```

The key idea is:

> Keep only the `k` largest elements seen so far in a min-heap.

Whenever the heap grows larger than `k`:

```text
remove the minimum
```

At the end:

```text
heap[0] = kth largest
```

Using our manual min-heap functions:

```python
def kth_largest(arr, k):
    heap = []

    for num in arr:
        insert_min(heap, num)

        if len(heap) > k:
            remove_min(heap)

    return heap[0]
```

Example:

```python
arr = [4, 5, 9, 12, 9, 22, 45, 7]

print(kth_largest(arr, 4))
```

Output:

```text
9
```

Why it works:

The final heap contains the four largest values:

```text
9, 12, 22, 45
```

The smallest among those four is:

```text
9
```

So:

```text
4th largest = 9
```

Complexity:

```text
Time:  O(n log k)
Space: O(k)
```

---

# 12. Key Rules to Remember

```text
Min-heap:
root = minimum

Max-heap:
root = maximum
```

```text
Insert:
append + sift up
```

```text
Remove root:
move last element to root + sift down
```

```text
Min-heap sift up:
child < parent -> swap
```

```text
Max-heap sift up:
child > parent -> swap
```

```text
Min-heap sift down:
swap with smaller child
```

```text
Max-heap sift down:
swap with larger child
```

```text
Kth largest:
use a min-heap of size k
```

---

# 13. Complexity Summary

| Operation | Min-Heap | Max-Heap |
|---|---:|---:|
| Peek root | O(1) | O(1) |
| Insert | O(log n) | O(log n) |
| Remove root | O(log n) | O(log n) |
| Space for heap | O(n) | O(n) |

For the kth-largest problem:

```text
Time:  O(n log k)
Space: O(k)
```
