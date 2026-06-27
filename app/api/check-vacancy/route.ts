import { NextResponse } from "next/server";
import { checkVacancyAndSave } from "@/lib/vacancy-monitor";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.json(await checkVacancyAndSave());
  } catch (error) {
    console.error("Failed to check vacancy.", error);

    return NextResponse.json(
      {
        ok: false,
        error: "Failed to check vacancy.",
      },
      { status: 500 },
    );
  }
}
