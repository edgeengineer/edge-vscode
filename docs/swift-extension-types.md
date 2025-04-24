# Adding Swift Extension Types to Your Project

This guide explains how to integrate type definitions from the Swift VSCode extension into your own extension.

## Overview

The Swift extension for VS Code provides an API that other extensions can consume. To use this API with TypeScript's type checking, we need to create type definition files (`.d.ts`) based on the Swift extension's source code.

## Prerequisites

- Access to the Swift extension source code (typically cloned from the repository)
- Basic understanding of TypeScript type definitions

## Process for Adding New Types

1. **Identify the needed types** from the Swift extension source code
2. **Create type definition files** in your project's `types` directory
3. **Update imports and references** to ensure proper type resolution

## Step-by-Step Guide

### 1. Examine the Swift Extension Source

```bash
# Navigate to your local copy of the Swift extension
cd ~/Developer/swiftlang/vscode-swift

# Find relevant TypeScript files
find src -name "*.ts" | grep -i <feature>
```

### 2. Create Type Definition Files

For each needed type:

1. Examine the source file in the Swift extension
2. Create a corresponding `.d.ts` file in your `types` directory
3. Define the class/interface structure, focusing on public properties and methods

Example:

```typescript
// types/SwiftFeature.d.ts
import * as vscode from "vscode";

export class SwiftFeature {
  property1: string;
  property2: number;

  method1(): void;
  method2(): Promise<string>;
}
```

### 3. Handle Circular Dependencies

When types reference each other:

1. Use forward declarations to break circular dependencies
2. Minimize imports between type definition files
3. Consider consolidating related types in a single file

Example:

```typescript
// Forward declare in the same file
export class TypeA {
  // Minimal definition
}

export class TypeB {
  instanceOfA: TypeA;
}
```

### 4. Update the Main API Type

All Swift extension types are consolidated in `swift-vscode-api.d.ts`:

```typescript
import * as vscode from "vscode";

// Type definitions...

export interface SwiftExtensionApi {
  workspaceContext?: WorkspaceContext;
  newFeature?: NewFeature; // Add the new feature here
  activate(): Promise<SwiftExtensionApi>;
  deactivate(): Promise<void>;
}
```

### 5. Test and Iterate

1. Build your extension to verify there are no type errors
2. Test the API interactions with the Swift extension
3. Refine type definitions as needed for better accuracy

## Tips

- Start with minimal type definitions and expand as needed
- Comment out complex dependencies until you need them
- Use TypeScript's `any` temporarily for complex types until you can properly define them
- Focus on defining the properties and methods you actually use

## Important: Use `import type` for Swift Extension Types

Always use `import type` instead of regular imports when importing from the Swift extension package. This ensures you're only importing the types for compile-time type checking, not trying to load the module at runtime (which would fail).

```typescript
// CORRECT: Use import type for Swift extension types
import type * as Swift from "swiftlang.swift-vscode";
import type { SwiftExtensionApi } from "swiftlang.swift-vscode";

// INCORRECT: Don't use direct imports
// import * as Swift from 'swiftlang.swift-vscode';
// import { SwiftExtensionApi } from 'swiftlang.swift-vscode';
```

Benefits of using `import type`:

- Prevents runtime errors when trying to directly import from another extension
- Makes it clear that you're only using the type information, not the implementation
- Helps bundling tools like esbuild properly handle external dependencies

## Example Usage

```typescript
// Import only the types
import type { SwiftExtensionApi } from "swiftlang.swift-vscode";
import * as vscode from "vscode";

async function example() {
  // Get the Swift extension at runtime via VS Code API
  const swiftExtension = vscode.extensions.getExtension<SwiftExtensionApi>(
    "swiftlang.swift-vscode"
  );

  if (!swiftExtension) {
    throw new Error("Swift extension not found");
  }

  const api = await swiftExtension.activate();

  if (api.workspaceContext) {
    // Work with Swift workspaces
    console.log(api.workspaceContext.folders.length);
  }
}
```

By following this process, you can gradually incorporate more Swift extension APIs into your project with proper TypeScript type safety.
