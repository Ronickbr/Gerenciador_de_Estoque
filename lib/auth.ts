"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { z } from "zod"

// Usuários válidos para o sistema
const VALID_USERS = [
  {
    id: "admin",
    username: "admin",
    password: "admin123",
    name: "Administrador",
    role: "admin",
  },
  {
    id: "operator",
    username: "operador",
    password: "operador123",
    name: "Operador",
    role: "operator",
  },
]

// Schema para a sessão
const sessionSchema = z.object({
  id: z.string(),
  user: z.object({
    id: z.string(),
    name: z.string(),
    role: z.string(),
  }),
  expiresAt: z.number(),
})

type Session = z.infer<typeof sessionSchema>

// Criar uma sessão para um usuário
export async function createSession(userId: string): Promise<void> {
  const user = VALID_USERS.find((u) => u.id === userId)

  if (!user) {
    throw new Error("User not found")
  }

  // Criar uma sessão que expira em 24 horas
  const session: Session = {
    id: crypto.randomUUID(),
    user: {
      id: user.id,
      name: user.name,
      role: user.role,
    },
    expiresAt: Date.now() + 24 * 60 * 60 * 1000,
  }

  // Armazenar a sessão em um cookie
  cookies().set("session", JSON.stringify(session), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: new Date(session.expiresAt),
    path: "/",
  })
}

// Obter a sessão atual
export async function getSession(): Promise<Session | null> {
  const sessionCookie = cookies().get("session")

  if (!sessionCookie) {
    return null
  }

  try {
    const session = sessionSchema.parse(JSON.parse(sessionCookie.value))

    // Verificar se a sessão expirou
    if (session.expiresAt < Date.now()) {
      cookies().delete("session")
      return null
    }

    return session
  } catch (error) {
    cookies().delete("session")
    return null
  }
}

// Função de login
export async function login(username: string, password: string): Promise<{ success: boolean; error?: string }> {
  const user = VALID_USERS.find((u) => u.username === username && u.password === password)

  if (!user) {
    return { success: false, error: "Usuário ou senha inválidos" }
  }

  await createSession(user.id)
  return { success: true }
}

// Função de logout
export async function logout(): Promise<void> {
  cookies().delete("session")
}

// Middleware para proteger rotas
export async function requireAuth() {
  const session = await getSession()

  if (!session) {
    redirect("/login")
  }

  return session
}
