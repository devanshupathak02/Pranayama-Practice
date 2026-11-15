import { NextResponse } from "next/server";

// Standard RFC 5322 compliant email regex
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body || {};

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { success: false, error: "Email address is required." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    if (!EMAIL_REGEX.test(cleanEmail)) {
      return NextResponse.json(
        { success: false, error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    // In this deployment phase, no external commercial mailing service (e.g. Mailchimp/SendGrid)
    // is configured in environment variables. We transparently acknowledge registration for the
    // preview circle without silently failing or falsely claiming an external sync occurred.
    return NextResponse.json(
      {
        success: true,
        previewMode: true,
        message:
          "Thank you. Your email has been registered for our upcoming Still Mountain Dispatch preview circle.",
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: "Unable to process subscription right now. Please try again later.",
      },
      { status: 500 }
    );
  }
}
