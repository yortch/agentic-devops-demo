---
description: 'Javadoc documentation best practices for Java code'
mode: 'agent'
---

# Java Documentation (Javadoc) Best Practices

Your goal is to ensure that Java code in the Three Rivers Bank backend is well-documented following Javadoc best practices.

## Coverage

- All `public` and `protected` members (classes, constructors, methods, fields) must have Javadoc comments.
- Document package-private and `private` members when they are complex or non-obvious.

## Summary Sentence

- The first sentence of a Javadoc comment is the summary description.
- It must be a concise overview of what the member does and end with a period.

## Standard Tags

- Use `@param <name>` for every method parameter. Descriptions start with a lowercase letter and do not end with a period.
- Use `@return` for methods with a non-`void` return type.
- Use `@throws` (or `@exception`) for every checked exception a method declares, and for significant unchecked exceptions.
- Use `@see` to reference related types or members.
- Use `@since` to indicate when the feature was introduced (e.g., version number).
- Use `@version` to specify the current version when relevant.
- Use `@author` to attribute authorship when appropriate.

## Inline Tags

- Use `{@code SomeType}` for inline references to code elements (types, methods, variables).
- Use `<pre>{@code ... }</pre>` for multi-line code examples.

## Inheritance

- Use `{@inheritDoc}` to inherit documentation from a superclass or interface, unless the subclass overrides behavior significantly.
- When overriding behavior, document the differences explicitly rather than relying on `{@inheritDoc}`.

## Generic Types

- Use `@param <T>` to document type parameters on generic classes or methods.

## Deprecation

- Use `@deprecated` to mark members that should no longer be used.
- Always include in the `@deprecated` description an explanation and a reference to the preferred alternative.

## Example

```java
/**
 * Retrieves a credit card by its unique identifier.
 *
 * @param cardId the unique identifier of the credit card
 * @return the {@code CreditCardDto} matching the given identifier
 * @throws CreditCardNotFoundException if no card with the given identifier exists
 */
public CreditCardDto findById(Long cardId) {
    // ...
}
```
