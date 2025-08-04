import { cookies } from "next/headers";

export async function POST() {
  const cookieStore = await cookies(); // ✅ await this

  cookieStore.set("auth", "", {
    httpOnly: true,
    path: "/",
    expires: new Date(0), // expires the cookie immediately
  });

  return new Response(JSON.stringify({ message: "Logged out" }), {
    status: 200,
  });
}
