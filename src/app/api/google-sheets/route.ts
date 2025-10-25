import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function POST(request: NextRequest) {
  try {
    const { spreadsheetId, sheetName, startCell, data } = await request.json();
    
    // Validate required fields
    if (!spreadsheetId || !sheetName || !startCell || !data) {
      return NextResponse.json(
        { error: 'Missing required fields: spreadsheetId, sheetName, startCell, data' },
        { status: 400 }
      );
    }

    // Get service account credentials from environment variables
    const clientEmail = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
    const privateKey = process.env.GOOGLE_SHEETS_PRIVATE_KEY;
    
    if (!clientEmail || !privateKey) {
      return NextResponse.json(
        { error: 'Google Sheets service account credentials not configured on server' },
        { status: 500 }
      );
    }

    // Create JWT auth client
    const auth = new google.auth.JWT({
      email: clientEmail,
      key: privateKey.replace(/\\n/g, '\n'), // Handle escaped newlines in private key
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });

    // Initialize Google Sheets API with authenticated client
    const sheets = google.sheets({ version: 'v4', auth });
    
    // Write data to Google Sheets
    const response = await sheets.spreadsheets.values.update({
      spreadsheetId: spreadsheetId,
      range: `${sheetName}!${startCell}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: data,
      },
    });

    return NextResponse.json({
      success: true,
      updatedRows: response.data.updatedRows || 0,
      updatedCells: response.data.updatedCells || 0,
      range: `${sheetName}!${startCell}`,
    });

  } catch (error) {
    console.error('Google Sheets API Error:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to write to Google Sheets' },
      { status: 500 }
    );
  }
}