
import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { v4 as uuidv4 } from "uuid";

// Simple helper to generate ticket ID
function generateTicketId() {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const random = Math.floor(1000 + Math.random() * 9000);
  return `WA-${date}-${random}`;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("WAHA Webhook received:", JSON.stringify(body, null, 2));

    // Handle WAHA 'message' event
    // Note: WAHA structure might vary, we assume standard payload for 'message' or 'message.any'
    // { event: "message", payload: { from: "...", body: "...", ... } }
    
    const eventType = body.event;
    const payload = body.payload;

    if (eventType !== "message" && eventType !== "message.any" && eventType !== "message.created") {
        // Ignore other events (like status updates, ack, etc.)
        return NextResponse.json({ status: "ignored", reason: "Not a message event" });
    }

    if (!payload || !payload.from || !payload.body) {
        return NextResponse.json({ status: "ignored", reason: "Invalid payload" });
    }

    // Ignore messages from status (stories) or groups if needed
    // Typically groups have '@g.us', individual chats have '@c.us'
    if (payload.from.includes("@g.us") || payload.from === "status@broadcast") {
         return NextResponse.json({ status: "ignored", reason: "Group/Status message" });
    }

    // Ignore outgoing messages (from me)
    if (payload.fromMe) {
        return NextResponse.json({ status: "ignored", reason: "Outgoing message" });
    }

    const senderPhone = payload.from.split("@")[0];
    const messageBody = payload.body;
    const senderName = payload.notifyName || payload._data?.notifyName || "Pengguna WhatsApp";
    
    // Check if it has media
    // WAHA usually provides a mediaUrl or similar if configured, or base64. 
    // For MVP, we'll just handle text or mention if there's an image.
    // If payload.hasMedia is true, we might need to fetch it.
    // For now, we'll append a note if media is present.
    let description = messageBody;
    const images: string[] = [];

    if (payload.hasMedia) {
        description += "\n\n[Nota: Mesej ini mengandungi lampiran media yang mungkin tidak dipaparkan di sini.]";
        // TODO: Implement media handling (download from WAHA API / get URL)
        // If WAHA sends 'mediaUrl', push to images.
        if (payload.mediaUrl) {
            images.push(payload.mediaUrl);
        }
    }

    const prisma = getPrisma();

    // Create Complaint
    const ticketId = generateTicketId();
    
    await prisma.complaint.create({
        data: {
            ticketId,
            title: `Aduan WhatsApp dari ${senderName}`,
            description: description,
            category: "Lain-lain (WhatsApp)", // Default category
            location: "Tidak dinyatakan", // Can be parsed if location is shared
            reporterName: senderName,
            reporterPhone: senderPhone,
            channel: "WHATSAPP",
            status: "PENDING",
            images: images,
            // Create a timeline entry
            timeline: {
                create: {
                    status: "PENDING",
                    title: "Aduan Diterima",
                    note: "Aduan diterima melalui integrasi WhatsApp (WAHA).",
                    actorName: "Sistem",
                }
            }
        }
    });

    return NextResponse.json({ success: true, ticketId });

  } catch (error) {
    console.error("WAHA_WEBHOOK_ERROR", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
