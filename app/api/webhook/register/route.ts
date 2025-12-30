// import { Webhook } from "svix";
// import { headers } from "next/headers";
// import { WebhookEvent } from "@clerk/nextjs/server";
// import {prisma} from "@/lib/prisma";

// export async function POST(req: Request) {
//   const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

//   if (!WEBHOOK_SECRET) {
//     throw new Error(
//       "Please add WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local"
//     );
//   }

//   const headerPayload = await headers();
//   const svix_id = headerPayload.get("svix-id");
//   const svix_timestamp = headerPayload.get("svix-timestamp");
//   const svix_signature = headerPayload.get("svix-signature");

//   if (!svix_id || !svix_timestamp || !svix_signature) {
//     return new Response("Error occurred -- no svix headers", {
//       status: 400,
//     });
//   }

//   const payload = await req.json();
//   const body = JSON.stringify(payload);

//   const wh = new Webhook(WEBHOOK_SECRET);
//   let evt: WebhookEvent;

//   try {
//     evt = wh.verify(body, {
//       "svix-id": svix_id,
//       "svix-timestamp": svix_timestamp,
//       "svix-signature": svix_signature,
//     }) as WebhookEvent;
//   } catch (err) {
//     console.error("Error verifying webhook:", err);
//     return new Response("Error occurred", {
//       status: 400,
//     });
//   }

//   const { id } = evt.data;
//   const eventType = evt.type;

//   console.log(`Webhook with an ID of ${id} and type of ${eventType}`);
//   console.log("Webhook body:", body);

//   // Handling 'user.created' event
//   if (eventType === "user.created") {
//     try {
//       const { email_addresses, primary_email_address_id } = evt.data;
//       console.log(evt.data);
//       // Safely find the primary email address
//       const primaryEmail = email_addresses.find(
//         (email) => email.id === primary_email_address_id
//       );
//       console.log("Primary email:", primaryEmail);
//       console.log("Email addresses:", primaryEmail?.email_address);

//       if (!primaryEmail) {
//         console.error("No primary email found");
//         return new Response("No primary email found", { status: 400 });
//       }

//       // Create the user in the database
//       const newUser = await prisma.user.create({
//         data: {
//           id: evt.data.id!,
//           email: primaryEmail.email_address,
//           isSubscribed: false, // Default setting
//         },
//       });
//       console.log("New user created:", newUser);
//     } catch (error) {
//       console.error("Error creating user in database:", error);
//       return new Response("Error creating user", { status: 500 });
//     }
//   }

//   return new Response("Webhook received successfully", { status: 200 });
// }























import { Webhook } from "svix";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

// Ensure Node.js runtime
export const runtime = "nodejs";

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;
  if (!WEBHOOK_SECRET) throw new Error("Missing WEBHOOK_SECRET");

  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Missing headers", { status: 400 });
  }

  const body = await req.text(); // Raw body is required
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: any; // temporarily use 'any'
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as { type: string; data: any }; // type assertion
  } catch (err) {
    console.error("Webhook verification failed", err);
    return new Response("Invalid signature", { status: 400 });
  }

  // Now TypeScript knows evt has 'type' and 'data'
  if (evt.type === "user.created") {
    console.log("User created event:", evt.data.id);

    // Optional: Only log first, do DB operations in background or via email.created event
    const userId = evt.data.id;
    const primaryEmail = evt.data.primary_email_address_id ?? null;

    if (!userId || !primaryEmail) {
      console.error("Missing userId or primary email");
    } else {
      try {
        // Upsert in Prisma
        prisma.user.upsert({
          where: { id: userId },
          update: {},
          create: {
            id: userId,
            email: primaryEmail, // must be non-null string
            isSubscribed: false,
          },
        });
      } catch (error) {
        console.error("DB error:", error);
        return new Response("DB error", { status: 500 });
      }
    }
  }

  // Respond immediately to prevent timeout
  return new Response("Webhook received", { status: 200 });
}
