import { NextResponse } from "next/server";
import { SYSTEM_ROLES } from "../../../lib/constants";

export async function POST(req) {
  try {
    const { role, passcode } = await req.json();

    // Map frontend role selection to server environment variables
    const envKeyMap = {
      [SYSTEM_ROLES.ADMIN]: process.env.ADMIN_PASSCODE,
      [SYSTEM_ROLES.FINANCE]: process.env.FINANCE_PASSCODE,
      [SYSTEM_ROLES.HR]: process.env.HR_PASSCODE,
      [SYSTEM_ROLES.ENGINEERING]: process.env.ENGINEERING_PASSCODE,
      [SYSTEM_ROLES.GENERAL]: process.env.GENERAL_PASSCODE,
    };

    const correctPasscode = envKeyMap[role];

    if (!correctPasscode || passcode !== correctPasscode) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 },
      );
    }

    return NextResponse.json({ success: true, role }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 },
    );
  }
}
