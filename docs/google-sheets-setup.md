# Google Sheets API Setup Guide

This guide will help you set up the Google Sheets API to enable the Google Sheets node in your workflow builder.

## Step 1: Create a Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Create Project" or select an existing project
3. Give your project a name (e.g., "Agent Workflow Builder")
4. Click "Create"

## Step 2: Enable the Google Sheets API

1. In the Google Cloud Console, go to **APIs & Services** > **Library**
2. Search for "Google Sheets API"
3. Click on "Google Sheets API" in the results
4. Click the **"Enable"** button

## Step 3: Create Service Account Credentials

1. Go to **APIs & Services** > **Credentials**
2. Click **"+ CREATE CREDENTIALS"** > **"Service account"**
3. Enter a service account name (e.g., "sheets-writer")
4. Click **"Create and Continue"**
5. For the role, select **"Editor"** or **"Google Sheets API"** > **"Google Sheets Editor"**
6. Click **"Continue"** then **"Done"**
7. Click on the created service account email
8. Go to the **"Keys"** tab
9. Click **"ADD KEY"** > **"Create new key"**
10. Select **"JSON"** format and click **"Create"**
11. Save the downloaded JSON file securely

## Step 4: Configure Your Environment

1. Open the downloaded JSON file and extract the following values:
   - `client_email`
   - `private_key`

2. Add these credentials to your `.env.local` file:
   ```env
   GOOGLE_SHEETS_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
   GOOGLE_SHEETS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour_private_key_content_here\n-----END PRIVATE KEY-----"
   ```

**Important**: Keep the private key wrapped in quotes and preserve the `\n` characters for line breaks.

**Quick Setup**: You can use the included helper script to extract credentials:
```bash
node scripts/extract-credentials.js path/to/your-service-account.json
```
This will output the properly formatted environment variables for you to copy.

## Step 5: Prepare Your Google Sheet

1. Create a new Google Sheet or open an existing one
2. Copy the **Spreadsheet ID** from the URL:
   ```
   https://docs.google.com/spreadsheets/d/[SPREADSHEET_ID]/edit
   ```
3. **Share the sheet with your service account**:
   - Go to **Share** in your Google Sheet
   - Add the service account email (from your JSON file) as an editor
   - This gives the service account permission to read and write to the sheet
   - You can keep the sheet private - no need to make it publicly accessible

## Step 6: Test the Integration

1. Start your development server: `npm run dev`
2. In the Google Sheets node:
   - Enter your **Spreadsheet ID**
   - Specify the **Sheet Name** (e.g., "Sheet1")
   - Set the **Start Cell** (e.g., "A1")
3. Connect data sources (Firecrawl or OpenAI nodes)
4. Process data in the connected nodes
5. Click **"Write to Sheet"** to test the integration

## Troubleshooting

### Common Issues:

1. **"Service account credentials not configured"**
   - Make sure both `GOOGLE_SHEETS_CLIENT_EMAIL` and `GOOGLE_SHEETS_PRIVATE_KEY` are set in your `.env.local` file
   - Restart your development server after adding the credentials
   - Ensure the private key includes the full content with `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`

2. **"Permission denied" or "Forbidden"**
   - Ensure the Google Sheet is shared with your service account email
   - Check that the Google Sheets API is enabled in your Google Cloud project
   - Verify the service account has "Editor" permissions on the sheet

3. **"Spreadsheet not found"**
   - Double-check the Spreadsheet ID is correct
   - Make sure you copied only the ID part from the URL, not the entire URL

4. **"Sheet not found"**
   - Verify the sheet name matches exactly (case-sensitive)
   - Check for extra spaces in the sheet name

### Testing with a Sample Sheet:

You can test with this public Google Sheet:
- **Spreadsheet ID**: `1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms`
- **Sheet Name**: `Class Data`
- **Start Cell**: `A1`

## Security Considerations

- **Never commit your service account credentials to version control**
- Use environment variables for sensitive credentials
- Store the JSON key file securely and don't share it publicly
- Service accounts provide better security than API keys for server-to-server communication
- Consider using different service accounts for different environments (dev/staging/prod)
- Regularly rotate your service account keys if needed

## Data Format

The Google Sheets node will automatically format incoming data:
- **Firecrawl content**: Organized by lines, excluding markdown headers
- **OpenAI responses**: Split into paragraphs for better readability
- **Multiple inputs**: Each source gets a header and separator

## Next Steps

Once set up, you can create workflows like:
1. **Firecrawl** → **OpenAI** → **Google Sheets**: Scrape content, analyze with AI, save results
2. **Multiple data sources** → **Google Sheets**: Combine different inputs into one sheet
3. **Chain workflows**: Use Google Sheets as a data checkpoint in larger workflows

Happy automating! 🚀