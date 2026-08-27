import { NextResponse } from "next/server";
import { manejarErrorApi } from "@/lib/api-helpers";
import { calcularDashboardStats } from "@/lib/services/extintor.service";

export async function GET() {
  try {
    const stats = await calcularDashboardStats();
    return NextResponse.json(stats);
  } catch (error) {
    return manejarErrorApi(error);
  }
}
