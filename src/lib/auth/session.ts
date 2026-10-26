import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const COOKIE_NAME = "kt_session";
const SESSION_DURATION = "30d";

export type Session = {
  householdId: string;
  householdName: string;
  memberId?: string;
  memberName?: string;
};

function getSecretKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET environment variable is not set.");
  }
  return new TextEncoder().encode(secret);
}

export async function createSessionToken(session: Session) {
  return new SignJWT(session)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(SESSION_DURATION)
    .sign(getSecretKey());
}

export async function verifySessionToken(
  token: string,
): Promise<Session | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    if (
      typeof payload.householdId !== "string" ||
      typeof payload.householdName !== "string"
    ) {
      return null;
    }
    const session: Session = {
      householdId: payload.householdId,
      householdName: payload.householdName,
    };
    if (typeof payload.memberId === "string") {
      session.memberId = payload.memberId;
    }
    if (typeof payload.memberName === "string") {
      session.memberName = payload.memberName;
    }
    return session;
  } catch {
    return null;
  }
}

export async function setSessionCookie(session: Session) {
  const token = await createSessionToken(session);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export async function setSessionMember(member: { id: string; name: string }) {
  const current = await getSession();
  if (!current) {
    throw new Error("No active household session.");
  }
  await setSessionCookie({
    householdId: current.householdId,
    householdName: current.householdName,
    memberId: member.id,
    memberName: member.name,
  });
}
