# JavaScript Concepts — Q&A

---

## 1. What is the difference between `var`, `let`, and `const`?

| Keyword | Scope | Redeclarable | Reassignable | Version |
|---------|-------|-------------|-------------|---------|
| `var` | Function | ✅ Yes | ✅ Yes | ES5 |
| `let` | Block | ❌ No | ✅ Yes | ES6 |
| `const` | Block | ❌ No | ❌ No | ES6 |

---

## 2. What is the spread operator (`...`)?

The spread operator is a JavaScript syntax introduced in **ES6**. It allows expanding elements of an array or object.

**Example:**
```js
const arr1 = [1, 2];
const arr2 = [...arr1, 3, 4]; // [1, 2, 3, 4]
```

---

## 3. What is the difference between `map()`, `filter()`, and `forEach()`?

| Method | Returns | Purpose |
|--------|---------|---------|
| `map()` | New array | Transforms every element |
| `filter()` | New array | Keeps elements matching a condition |
| `forEach()` | `undefined` | Runs a function for each element |

---

## 4. What is an arrow function?

An arrow function is a concise way to write functions in JavaScript, introduced in **ES6**.

**Example:**
```js
const add = (a, b) => a + b;
```

---

## 5. What are template literals?

Template literals are a modern way to create strings in JavaScript. They use **backticks** (`` ` ``) instead of quotes and support embedded expressions.

**Example:**
```js
const name = "World";
console.log(`Hello ${name}`); // Hello World
```

---

## 6. What is the difference between `getElementById`, `getElementsByClassName`, and `querySelector` / `querySelectorAll`?

The main difference lies in their **selection flexibility** — which kind of selector they accept:

| Method | Selector Type | Returns |
|--------|--------------|---------|
| `getElementById` | ID (`myID`) | Single element |
| `getElementsByClassName` | Class name (`myClass`) | HTMLCollection (live) |
| `querySelector` | Any CSS selector (`.myClass`, `#id`, `div`) | First matching element |
| `querySelectorAll` | Any CSS selector | NodeList (all matches) |

---

## 7. How do you create and insert a new element into the DOM?

Follow these steps:

1. Create a new element using `document.createElement()`.
2. Add content using `.textContent` or `.innerHTML`.
3. Find the parent and insert it using `.appendChild()`.

**Example:**
```js
const newEl = document.createElement("p");
newEl.textContent = "Hello!";
document.getElementById("container").appendChild(newEl);
```

---

## 8. What is Event Bubbling? And how does it work?

**Event bubbling** is a DOM event concept where an event starts from the **target element** and moves **upward** through its parent elements.

**How it works** (e.g. clicking a button inside a div):
1. The event fires on the clicked element (button).
2. It "bubbles up" to the parent element (div).
3. It continues upward: `body` → `html` → `document`.

---

## 9. What is Event Delegation in JavaScript? Why is it useful?

**Event Delegation** is a pattern where a **single event listener is attached to a parent element** instead of adding separate listeners to every child element.

**Why it's useful:**
- ✅ Better performance — fewer event listeners
- ✅ Handles dynamically added elements automatically
- ✅ Keeps code clean and organized

**Example:**
```js
document.getElementById("list").addEventListener("click", (e) => {
  if (e.target.tagName === "LI") {
    console.log("Clicked:", e.target.textContent);
  }
});
```

---

## 10. What is the difference between `preventDefault()` and `stopPropagation()`?

| Method | What it does |
|--------|-------------|
| `preventDefault()` | Stops the browser's **default behavior** (e.g. a link navigating to a URL) |
| `stopPropagation()` | Stops the event from **bubbling up** to parent elements in the DOM |
