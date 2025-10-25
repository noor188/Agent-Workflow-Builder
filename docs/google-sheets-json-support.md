# Google Sheets Node - JSON Support

The Google Sheets node now automatically detects and parses JSON output from OpenAI nodes, creating separate columns for each JSON property.

## How it Works

### Single JSON Object
When the OpenAI node outputs a single JSON object:
```json
{
  "name": "John Doe",
  "age": 30,
  "city": "New York"
}
```

The Google Sheets node will create:
- **Column A**: Property names ("Property")
- **Column B**: Values ("Value")

Resulting in:
| Property | Value    |
|----------|----------|
| name     | John Doe |
| age      | 30       |
| city     | New York |

### Array of JSON Objects
When the OpenAI node outputs an array of objects:
```json
[
  {"name": "John", "age": 30, "city": "New York"},
  {"name": "Jane", "age": 25, "city": "Boston"}
]
```

The Google Sheets node will create:
- **Row 1**: Header row with property names
- **Subsequent rows**: Data for each object

Resulting in:
| name | age | city     |
|------|-----|----------|
| John | 30  | New York |
| Jane | 25  | Boston   |

### Simple Arrays
For simple arrays like `["apple", "banana", "cherry"]`, each item becomes a separate row in column A.

### Nested Objects
Complex nested objects are converted to JSON strings in their respective cells.

## Visual Indicators

- When JSON is detected, the connection preview will show "AI Response (JSON detected)"
- A hint will appear: "🔗 JSON data detected - each property will become a separate column"

## Usage Tips

1. **Prompt Engineering**: Structure your OpenAI prompts to return well-formatted JSON
2. **Cell Position**: The `startCell` setting determines where the JSON table begins
3. **Mixed Content**: If non-JSON content is mixed with JSON, only the JSON portion will be parsed as columns

## Example Prompts for JSON Output

```
Analyze this data and return a JSON array with objects containing: name, email, and score fields.
```

```
Extract key information and format as JSON: {"title": "", "summary": "", "category": "", "priority": ""}
```