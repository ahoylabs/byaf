# Backyard Archive Format - Root Manifest Specification

**Version:** 1.0.0  
**Status:** RFC  
**Last Updated:** 2025-06-06  
**Schema:** [byaf-manifest.schema.json](../../schemas/v1/byaf-manifest.schema.json)

## Overview

The Root Manifest is the entry point for all Backyard Archive Format (`.byaf`) files. It serves as the index and metadata container for the entire archive, providing references to character definitions and scenarios while maintaining archive-level metadata.

## File Location

The root manifest MUST be named `manifest.json` and MUST be located at the root of the `.byaf` archive.

## Structure

### Required Fields

- `schemaVersion` (integer, const: 1): The version of the manifest schema. Currently fixed at 1.
- `createdAt` (string, date-time): ISO-8601 timestamp indicating when the archive was created.
- `characters` (array): List of character manifest paths. MUST contain exactly one character (minItems: 1, maxItems: 1).
- `scenarios` (array): List of scenario manifest paths. MUST contain at least one scenario (minItems: 1).

### Optional Fields

- `$schema` (string): URI reference to the JSON schema for validation.
- `author` (object): Optional author information containing:
  - `name` (string): Human-readable author name
  - `backyardURL` (string, uri): Canonical Backyard profile URL

## Path Conventions

### Character Paths

Character manifest paths MUST:

- Follow the pattern: `characters/<character-id>/character.json`
- Reference exactly one character (array length must be 1, enforced by maxItems: 1)
- Point to a valid character manifest file

Example:

```json
"characters": ["characters/character1/character.json"]
```

### Scenario Paths

Scenario manifest paths MUST:

- Follow the pattern: `scenarios/<scenario-id>.json`
- Include at least one scenario (enforced by minItems: 1)
- Point to valid scenario manifest files

Example:

```json
"scenarios": [
  "scenarios/scenario1.json",
  "scenarios/scenario2.json"
]
```

## Versioning

The root manifest specification is versioned independently of other specifications. Version changes will be indicated by the `schemaVersion` field. Future versions may introduce:

- Support for multiple characters
- Additional metadata fields
- Extended author information
- Archive-level settings

## Validation

All root manifest files MUST:

1. Be valid JSON
2. Conform to the JSON Schema definition
3. Include all required fields
4. Follow the specified path conventions
5. Contain valid timestamps in ISO-8601 format

## Example

```json
{
  "$schema": "https://backyard.ai/schemas/byaf-manifest.schema.json",
  "schemaVersion": 1,
  "createdAt": "2024-03-21T12:00:00Z",
  "author": {
    "name": "Example Author",
    "backyardURL": "https://backyard.ai/hub/user/example"
  },
  "characters": ["characters/character1/character.json"],
  "scenarios": ["scenarios/scenario1.json", "scenarios/scenario2.json"]
}
```

## Implementation Notes

- The root manifest should be the first file read when processing a `.byaf` archive
- Implementations should validate the manifest before attempting to access referenced files
- Future versions may introduce additional required or optional fields
- The current version enforces a single-character limitation, but implementations should be prepared for multi-character support in future versions
