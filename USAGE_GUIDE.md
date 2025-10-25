# Agent Workflow Builder - Usage Guide

## Overview

This application allows you to create workflows by connecting different AI nodes. Currently, it supports:

- **Firecrawl Node**: Scrapes content from web pages and converts it to markdown
- **OpenAI Node**: Processes text using OpenAI's GPT models
- **Google Sheets Node**: Writes data from connected nodes to Google Sheets

## Getting Started

### 1. Set up API Keys

Copy the example environment file and add your API keys:

```bash
cp .env.example .env.local
```

Then edit `.env.local` with your actual API keys:

```env
# Firecrawl API Key - Get it from https://firecrawl.dev
NEXT_PUBLIC_FIRECRAWL_API_KEY=your_actual_firecrawl_key

# OpenAI API Key - Get it from https://platform.openai.com
NEXT_PUBLIC_OPENAI_API_KEY=your_actual_openai_key

# Google Sheets Service Account Credentials - Get from Google Cloud Console
GOOGLE_SHEETS_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
GOOGLE_SHEETS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour_actual_private_key\n-----END PRIVATE KEY-----"
```

> **Security Note**: Never commit `.env.local` with real API keys to version control!

> **Google Sheets Setup**: See `docs/google-sheets-setup.md` for detailed Google Sheets API setup instructions.

### 2. How to Use the Workflow

The nodes are pre-connected when you open the application. Here's how to use them:

#### Step 1: Scrape Content with Firecrawl
1. In the **Firecrawl Scraper** node, enter a URL (e.g., `https://example.com`)
2. Click the **Scrape** button
3. Wait for the content to be scraped and processed
4. You'll see a preview of the scraped markdown content

#### Step 2: Process with OpenAI
1. The **OpenAI Chat** node will automatically detect the scraped content
2. You'll see a green "Connected" indicator showing the scraped content
3. Enter your prompt in the OpenAI node
4. **Tip**: Use `{input}` in your prompt to control where the scraped content appears
5. Click **Generate** to process the content with AI

#### Step 3: Save to Google Sheets
1. The **Google Sheets** node will detect data from connected nodes
2. Enter your **Spreadsheet ID** (from the Google Sheets URL)
3. Specify the **Sheet Name** (e.g., "Sheet1")
4. Set the **Start Cell** where data should begin (e.g., "A1")
5. Click **Write to Sheet** to save the processed data

## Node Connection Behavior

### Automatic Context Passing
When nodes are connected, the OpenAI node automatically:
- Detects incoming connections
- Shows a preview of the connected data
- Includes the connected data in the AI prompt

### Prompt Formatting
You have two options for how the scraped content is included:

1. **Automatic**: If you don't use `{input}`, the scraped content is prepended to your prompt
2. **Manual**: Use `{input}` in your prompt to control exactly where the scraped content appears

Example prompts:
- `"Summarize this content"` → Scraped content will be added automatically before your prompt
- `"Here's some content: {input}. Please summarize the main points."` → Scraped content replaces `{input}`

## Troubleshooting

### Connection Issues
- If you don't see the "Connected" indicator in the OpenAI node, make sure the nodes are connected (there should be a line between them)
- The connection will only show data after you've scraped content with Firecrawl

### API Key Issues
- Make sure your `.env.local` file is in the root directory
- Restart the development server after adding API keys
- Check that your API keys are valid and have sufficient credits

### No Content Showing
1. Ensure you've clicked "Scrape" in the Firecrawl node and it completed successfully
2. Check that the URL is accessible and returns content
3. Look for any error messages in the Firecrawl node

### Google Sheets Issues
1. Make sure your Google Sheet is shared with the service account email
2. Verify the Spreadsheet ID is correct (from the URL)
3. Check that both client email and private key are properly set in `.env.local`
4. Ensure the sheet name matches exactly (case-sensitive)

## Example Workflows

### Workflow 1: Content Analysis Pipeline
1. **URL**: `https://news.ycombinator.com`
2. **Firecrawl**: Scrape the content
3. **OpenAI Prompt**: `"Summarize the top 5 stories from this Hacker News page: {input}"`
4. **Google Sheets**: Save the summary to a spreadsheet for tracking

### Workflow 2: Research Documentation
1. **URL**: Research article or blog post
2. **Firecrawl**: Extract the content
3. **OpenAI Prompt**: `"Create key takeaways and action items from: {input}"`
4. **Google Sheets**: Store findings in an organized research log

### Workflow 3: Content Monitoring
1. **Multiple URLs**: Various news sources or competitor sites
2. **Firecrawl**: Scrape content from each source
3. **OpenAI**: Analyze trends or sentiment
4. **Google Sheets**: Maintain a monitoring dashboard

Enjoy building your AI workflows! 🚀