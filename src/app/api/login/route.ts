// src/app/api/login/route.ts
import { PrismaClient } from '@/generated/prisma';
import bcrypt from 'bcrypt';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return new Response(JSON.stringify({ error: 'Invalid credentials' }), { status: 401 });
    }

    cookies().set("auth", "true", {
      httpOnly: true,
      path: "/",
    });

    return new Response(JSON.stringify({ message: "Login successful" }), { status: 200 });
  } catch (error) {
    console.error('❌ Login error:', error);
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
  }
}
