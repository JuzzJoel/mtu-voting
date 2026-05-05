import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guards";
import { createAdminNominee, getAdminNominees } from "@/server/services/admin-nominee-service";
import { nomineeCreateSchema } from "@/server/validators/admin";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req);
    const nominees = await getAdminNominees();
    return NextResponse.json({ nominees });
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin(req);
    const body = nomineeCreateSchema.parse(await req.json());
    const nominee = await createAdminNominee(body);
    return NextResponse.json({ nominee });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid request";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
