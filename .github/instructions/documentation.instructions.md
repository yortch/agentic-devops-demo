---
description: 'Documentation and Javadoc standards'
applyTo: 'backend/src/main/**/*.java'
---

# Java Documentation (Javadoc) Standards

## Coverage

- All `public` and `protected` members (classes, methods, constructors, fields) must have Javadoc comments.
- Document package-private and private members when they are complex or non-obvious.

## Summary Sentence

- The first sentence of a Javadoc comment is the summary description.
- It must be concise, describe what the member does, and end with a period.

## Standard Tags

- Use `@param <name>` for every method parameter. Descriptions start with a lowercase letter and do not end with a period.
- Use `@return` for methods with a non-void return type.
- Use `@throws` (or `@exception`) for every checked exception a method declares, and for significant unchecked exceptions.
- Use `@see` to reference related types or members.
- Use `@since` to indicate the version when a feature was introduced.

## Inline Tags

- Use `{@code SomeType}` for inline references to code elements (types, methods, variables).
- Use `<pre>{@code ... }</pre>` for multi-line code examples.

## Inheritance

- Use `{@inheritDoc}` to inherit documentation from a superclass or interface.
- If the subclass overrides behavior significantly, document the differences rather than using `{@inheritDoc}`.

## Generic Types

- Use `@param <T>` to document type parameters on generic classes or methods.

## Deprecation

- Use `@deprecated` to mark members that should no longer be used.
- Always include an explanation and reference to the preferred alternative in the `@deprecated` description.
