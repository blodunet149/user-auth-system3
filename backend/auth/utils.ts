import { secret } from "encore.dev/config";

const jwtSecret = secret("JWTSecret");

export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const hashedPassword = await hashPassword(password);
  return hashedPassword === hash;
}

export function generateToken(payload: { userId: number; email: string }): string {
  const header = {
    alg: "HS256",
    typ: "JWT"
  };

  const now = Math.floor(Date.now() / 1000);
  const jwtPayload = {
    ...payload,
    iat: now,
    exp: now + (7 * 24 * 60 * 60) // 7 days
  };

  const encodedHeader = btoa(JSON.stringify(header)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const encodedPayload = btoa(JSON.stringify(jwtPayload)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  
  const signature = createSignature(`${encodedHeader}.${encodedPayload}`, jwtSecret());
  
  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

export function verifyToken(token: string): { userId: number; email: string } {
  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new Error('Invalid token format');
  }

  const [header, payload, signature] = parts;
  
  // Verify signature
  const expectedSignature = createSignature(`${header}.${payload}`, jwtSecret());
  if (signature !== expectedSignature) {
    throw new Error('Invalid token signature');
  }

  // Decode payload
  const decodedPayload = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
  
  // Check expiration
  if (decodedPayload.exp && decodedPayload.exp < Math.floor(Date.now() / 1000)) {
    throw new Error('Token expired');
  }

  return {
    userId: decodedPayload.userId,
    email: decodedPayload.email
  };
}

function createSignature(data: string, secret: string): string {
  // Simple HMAC-like signature using built-in crypto
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(data);
  
  // Create a simple hash-based signature
  const combined = new Uint8Array(keyData.length + messageData.length);
  combined.set(keyData);
  combined.set(messageData, keyData.length);
  
  // Use a synchronous approach for signature
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    hash = ((hash << 5) - hash + combined[i]) & 0xffffffff;
  }
  
  return Math.abs(hash).toString(36);
}
