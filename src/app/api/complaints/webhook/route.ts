import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // In a real application, you would save to database here first
    // Then trigger the n8n webhook
    
    const N8N_WEBHOOK_URL = process.env.N8N_COMPLAINT_WEBHOOK_URL || 'https://n8n.example.com/webhook/complaint';

    // Send to n8n
    // We use a try-catch for the fetch to ensure we don't break the user flow if n8n is down
    try {
      const n8nResponse = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...body,
          timestamp: new Date().toISOString(),
          source: 'portal_aduan_rakyat'
        }),
      });

      if (!n8nResponse.ok) {
        console.error('Failed to trigger n8n webhook', await n8nResponse.text());
      }
    } catch (error) {
      console.error('Error calling n8n webhook:', error);
      // We continue execution even if webhook fails, as the complaint should still be saved locally
    }

    return NextResponse.json({ success: true, message: 'Complaint submitted successfully' });
  } catch (error) {
    console.error('Error processing complaint:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to process complaint' },
      { status: 500 }
    );
  }
}
