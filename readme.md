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
console.log(`Hello ${name}`); // Hello World
```

---

