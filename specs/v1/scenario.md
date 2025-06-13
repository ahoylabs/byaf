# Backyard Archive Format - Scenario Specification

**Version:** 1.0.0  
**Status:** RFC  
**Last Updated:** 2025-06-06  
**Schema:** [byaf-scenario.schema.json](../../schemas/v1/byaf-scenario.schema.json)

## Overview

The Scenario Specification defines the structure for storing conversation scenarios within a Backyard Archive Format (`.byaf`) file. It provides a comprehensive format for representing chat interactions, model settings, and formatting instructions, enabling consistent character behavior across different implementations.

## File Location

Scenario files MUST be named with a `.json` extension and MUST be located in the `scenarios/` directory of the archive.

## Structure

The scenario manifest MUST NOT contain any properties not defined in this specification (additionalProperties: false).

### Required Fields

- `schemaVersion` (integer, const: 1): The version of the scenario schema. Currently fixed at 1.
- `formattingInstructions` (string): Instructions for formatting model output.
- `minP` (number): Minimum probability threshold for token selection.
- `minPEnabled` (boolean): Whether to use the minimum probability threshold.
- `temperature` (number): Model temperature setting.
- `repeatPenalty` (number): Penalty for repeating tokens.
- `repeatLastN` (number): Number of tokens to consider for repetition penalty.
- `topK` (number): Number of tokens to consider for top-k sampling.
- `topP` (number): Probability threshold for nucleus sampling.
- `exampleMessages` (array): Example messages for the scenario.
- `canDeleteExampleMessages` (boolean): Whether example messages can be removed to save tokens.
- `firstMessages` (array): Initial messages for the scenario.
- `narrative` (string): Narrative description of the scenario.
- `promptTemplate` (string or null): Template type for model prompting.
- `grammar` (string or null): Optional grammar rules.
- `messages` (array): Conversation message history.

### Optional Fields

- `$schema` (string): URI reference to the JSON schema for validation.
- `title` (string): The title of the scenario.
- `model` (string): The model most recently used in the scenario.
- `backgroundImage` (string): Path to a background image for the scenario.

## Field Details

### Model Settings

The following fields control model behavior:

- `temperature`: Controls randomness (0.0 to 1.0)
- `topK`: Limits token selection to top K tokens
- `topP`: Nucleus sampling threshold (0.0 to 1.0)
- `minP`: Minimum probability threshold
- `repeatPenalty`: Penalty for token repetition
- `repeatLastN`: Context window for repetition penalty

### Message Types

The `messages` array contains two types of messages:

#### AI Messages

```json
{
  "type": "ai",
  "outputs": [
    {
      "createdAt": "2024-03-21T12:00:00Z",
      "updatedAt": "2024-03-21T12:00:00Z",
      "text": "Message content",
      "activeTimestamp": "2024-03-21T12:00:00Z"
    }
  ]
}
```

#### Human Messages

```json
{
  "type": "human",
  "createdAt": "2024-03-21T12:00:00Z",
  "updatedAt": "2024-03-21T12:00:00Z",
  "text": "Message content"
}
```

### Prompt Templates

The `promptTemplate` field supports the following values:

- `"general"`: General-purpose template
- `"ChatML"`: ChatML format
- `"Llama3"`: Llama 3 format
- `"Gemma2"`: Gemma 2 format
- `"CommandR"`: Command R format
- `"MistralInstruct"`: Mistral Instruct format
- `null`: No specific template

### First Messages

The `firstMessages` array MUST contain at most one message (maxItems: 1) and MAY be empty (minItems: 0). Each message in the array MUST contain:

- `characterID` (string): The ID of the character sending the message
- `text` (string): The message content

## Versioning

The scenario specification is versioned independently of other specifications. Version changes will be indicated by the `schemaVersion` field. Future versions may introduce:

- Additional model settings
- New message types
- Extended prompt templates
- Structured grammar rules
- Custom field support

## Validation

All scenario files MUST:

1. Be valid JSON
2. Conform to the JSON Schema definition
3. Include all required fields
4. Contain valid timestamps in ISO-8601 format
5. Have valid message structures
6. Use supported prompt template values

## Example

```json
{
  "$schema": "https://backyard.ai/schemas/byaf-scenario.schema.json",
  "schemaVersion": 1,
  "model": "llama-3-8b",
  "formattingInstructions": "Respond in a friendly and helpful manner...",
  "temperature": 0.7,
  "topK": 40,
  "topP": 0.9,
  "minP": 0.1,
  "minPEnabled": true,
  "repeatPenalty": 1.1,
  "repeatLastN": 64,
  "narrative": "A casual conversation in a coffee shop...",
  "promptTemplate": "ChatML",
  "grammar": null,
  "exampleMessages": [
    {
      "characterID": "character1",
      "text": "Hello! How are you today?"
    }
  ],
  "canDeleteExampleMessages": true,
  "firstMessages": [
    {
      "characterID": "character1",
      "text": "Welcome to the coffee shop!"
    }
  ],
  "messages": [
    {
      "type": "human",
      "createdAt": "2024-03-21T12:00:00Z",
      "updatedAt": "2024-03-21T12:00:00Z",
      "text": "Hi there!"
    }
  ]
}
```

## Security Considerations

- Message content should be sanitized to prevent injection attacks
- Timestamps should be validated for reasonable ranges
- Model settings should be validated to prevent resource exhaustion
- Grammar rules should be validated to prevent malicious patterns

## Implementation Notes

- The `messages` array should be processed in chronological order
- AI messages may have multiple outputs, but only one should be active
- Example messages should be used to guide model behavior
- First messages should be used to initialize the conversation
- The `canDeleteExampleMessages` flag allows for token optimization
- Future versions may introduce additional required or optional fields
- Implementations should handle missing or invalid model settings gracefully
- The current version supports multiple message types, but implementations should consider performance implications when handling large message histories
