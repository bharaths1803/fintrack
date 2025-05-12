import { seedUpdateAllTransactions } from "../../../actions/seed.action";

export async function GET() {
  const res = await seedUpdateAllTransactions();
  return Response.json(res);
}
