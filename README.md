# Backyard Archive Format `BYAF`

This repository contains the specification and implementation for Backyard AI character export formats. It defines both the legacy PNG-based format (now deprecated) and the current Backyard Archive Format (`.byaf`).

> [!IMPORTANT]  
> While the `BYAF` v1 spec is finalized, there is still some work to be done on the packaging front to
> make the npm `byaf` package easy to use - function signatures may change without following semantic versioning
> until v1.0.0

## Overview

The repository provides tools and schemas for:

1. Creating and parsing Backyard Archive Format (`.byaf`) files
2. Creating and parsing character PNG files (legacy)
3. Type definitions and validation for both formats
4. Test cases and examples

## Backyard Archive Format (`.byaf`)

The Backyard Archive format (`.byaf`) is the current recommended format for character exports. It's a structured archive format that provides better organization, validation, and extensibility.

### Archive Structure

A `.byaf` file is a ZIP archive containing:

```txt
archive.byaf/
├── manifest.json           # Archive manifest
├── characters/            # Character definitions
│   └── character1/       # Character directory
│       ├── character.json # Character manifest
│       └── images/       # Character images
│           └── ...
└── scenarios/            # Scenario definitions
    └── scenario1.json    # Scenario data
```

### Schema Definitions

The archive format is defined by three main JSON schemas:

1. `byaf-manifest.schema.json`: Defines the root manifest structure

   - Character file references (currently limited to one character)
   - Scenario file references (one or more scenarios)
   - Optional author information

2. `byaf-character.schema.json`: Defines character data structure

   - Character identification (id, name, displayName)
   - Character Persona
   - Timestamps (createdAt, updatedAt)
   - Lore items (key-value pairs)
   - Image references

3. `byaf-scenario.schema.json`: Defines scenario data structure
   - Narrative description
   - Message history (AI and human messages)
   - Example messages and first messages
   - Model settings (temperature, topK, topP, etc.)
   - Model Formatting instructions
   - Prompt template support

### Key Features

- **Extensibility**: Schema design allows for future format evolution
- **Metadata**: Comprehensive metadata tracking
- **Image Support**: Dedicated image storage with format validation
- **Scenario Management**: Structured scenario format with support for:
  - Multiple message types
  - Example messages
  - First messages
  - Narrative context
  - Model settings
  - Formatting instructions

## Character PNG Format (Deprecated)

The legacy format stored character data in PNG files using EXIF metadata. While this format is deprecated (due to limits in EXIF metadata and lack of support for multiple images & multiple characters), the repository maintains support for parsing these files for backward compatibility.

### PNG Format Implementation

The PNG format implementation consists of two main functions:

1. `createCharacterPng`: Creates a PNG file with character metadata embedded in EXIF data

   - Takes an image file and character data as input
   - Uses `exiftool-vendored` to write metadata
   - Supports quality settings for the output PNG
   - Node.js only due to EXIF tool dependencies

2. `parseCharacterPng`: Extracts character data from PNG files
   - Supports multiple image formats (PNG, JPEG, WebP, GIF)
   - Validates file size (max 10MB)
   - Extracts and decodes base64-encoded metadata
   - Supports multiple character export versions (V1-V4)
   - Handles date conversion for timestamps

The character data in PNGs evolved through several versions (V1-V4), with each version adding new features:

- V1: Basic character data with mirostat settings
- V2: Added minP and minPEnabled settings
- V3: Added promptTemplate support
- V4: Added canDeleteCustomDialogue flag

## Usage

The repository provides TypeScript types and validation functions for working with both formats. The code is designed to be used in both Node.js and browser environments (with some limitations for PNG creation which is Node.js only).

### Type Safety

All formats are defined using Zod schemas

### Testing

The repository includes test suites for:

- PNG format parsing
- Character data validation
- Archive format validation
- Version compatibility
- Edge cases and error handling

## Migration

Users of the legacy PNG format are encouraged to migrate to the `.byaf` format, which provides:

- Better organization of character data and assets
- Improved validation and type safety
- Support for multiple images
- Better scenario management
- Future extensibility

## LICENSE

MIT © 2025 Ahoy Labs, Inc.
