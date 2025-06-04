# Backyard Archive Format - Character Specification

**Version:** 1.0.0  
**Status:** RFC  
**Last Updated:** 2025-06-06  
**Schema:** [byaf-character.schema.json](../../schemas/v1/byaf-character.schema.json)

## Overview

The Character Specification defines the structure for storing character data within a Backyard Archive Format (`.byaf`) file. It provides a standardized way to represent character information, including identification, persona, images, and lore items.

## File Location

Character manifests MUST be named `character.json` and MUST be located within a character-specific directory under the `characters/` directory in the archive. The name of the folder `character/[id]/` MUST be the same as the `id` in the`character.json`.

## Structure

The character manifest MUST NOT contain any properties not defined in this specification (additionalProperties: false).

### Required Fields

- `schemaVersion` (integer, const: 1): The version of the character schema. Currently fixed at 1.
- `id` (string): Unique identifier for the character within the archive.
- `name` (string): Shorthand name or nickname for the character.
- `displayName` (string): Full name of the character.
- `isNSFW` (boolean): Flag indicating if the character contains NSFW content.
- `persona` (string): Detailed character description and personality.
- `createdAt` (string, date-time): ISO-8601 timestamp of character creation.
- `updatedAt` (string, date-time): ISO-8601 timestamp of last update.
- `loreItems` (array): List of key-value pairs containing character lore.
- `images` (array): List of character images with paths and labels.

### Optional Fields

- `$schema` (string): URI reference to the JSON schema for validation.

## Field Details

### Lore Items

The `loreItems` array contains objects with:

- `key` (string): Identifier for the lore item
- `value` (string): Content of the lore item

Example:

```json
"loreItems": [
  {
    "key": "background",
    "value": "Character's background story"
  },
  {
    "key": "relationships",
    "value": "Character's relationship information"
  }
]
```

### Images

The `images` array contains objects with:

- `path` (string): Relative path to the image file, following the pattern `images/<filename>.<ext>`
- `label` (string): Human-readable label for the image

Supported image formats:

- PNG (`.png`)
- JPEG (`.jpg`, `.jpeg`)
- WebP (`.webp`)
- GIF (`.gif`)

When reading `BYAF` files, only images that are included in the `images` array should be processed. If there are other images in the `images/` folder, they should not be processed. If an image path is present in the `images` array, parsing should either ignore it or fail.

Example:

```json
"images": [
  {
    "path": "images/portrait.png",
    "label": "Character Portrait"
  },
  {
    "path": "images/expression.jpg",
    "label": "Happy Expression"
  }
]
```

## Versioning

The character specification is versioned independently of other specifications. Version changes will be indicated by the `schemaVersion` field. Future versions may introduce:

- Additional character metadata
- Extended image support
- Structured lore format
- Character relationship definitions
- Custom field support

## Validation

All character manifest files MUST:

1. Be valid JSON
2. Conform to the JSON Schema definition
3. Include all required fields
4. Contain valid timestamps in ISO-8601 format
5. Have valid image paths following the specified pattern
6. Have unique lore item keys within the character

## Example

```json
{
  "$schema": "https://backyard.ai/schemas/byaf-character.schema.json",
  "schemaVersion": 1,
  "id": "character1",
  "name": "alice",
  "displayName": "Alice Smith",
  "isNSFW": false,
  "persona": "A friendly and curious character who loves to explore...",
  "createdAt": "2024-03-21T12:00:00Z",
  "updatedAt": "2024-03-21T12:00:00Z",
  "loreItems": [
    {
      "key": "background",
      "value": "Alice grew up in a small town..."
    }
  ],
  "images": [
    {
      "path": "images/portrait.png",
      "label": "Default Portrait"
    }
  ]
}
```

## Security Considerations

- Image paths should be validated to prevent directory traversal
- Image files should be validated for size and format
- NSFW content should be properly flagged
- Timestamps should be validated for reasonable ranges

## Implementation Notes

- Character IDs should be unique within an archive
- Image paths are relative to the character's directory
- The persona field may contain markdown or other formatting
- Implementations should handle missing or invalid images gracefully
- Future versions may introduce additional required or optional fields
- The current version supports multiple images, but implementations should consider performance implications when handling large numbers of images
