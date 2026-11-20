/**
 * Implementación estándar RFC 6238 (TOTP - Time-Based One-Time Password)
 * 100% compatible con la aplicación móvil oficial Google Authenticator.
 */

const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

/**
 * Genera o recupera un secreto Base32 de 16 caracteres (80 bits) único por correo
 * para vincular con la app Google Authenticator.
 */
export function getOrCreateTotpSecret(email: string): string {
  const normalized = email.trim().toLowerCase();
  const storageKey = `iinicia_totp_secret_${normalized}`;

  if (typeof window !== 'undefined') {
    const existing = window.localStorage.getItem(storageKey);
    if (existing && /^[A-Z2-7]{16,32}$/.test(existing)) {
      return existing;
    }
  }

  // Derivar un secreto determinístico Base32 a partir del correo para que sea consistente
  const seed = `IINICIA-2FA-SECRET-2026::${normalized}::TOTP-KEY`;
  let secret = '';
  for (let i = 0; i < 16; i++) {
    const charCode =
      seed.charCodeAt(i % seed.length) ^
      seed.charCodeAt((i * 7 + 3) % seed.length) ^
      (i * 19);
    secret += BASE32_ALPHABET[Math.abs(charCode) % 32];
  }

  if (typeof window !== 'undefined') {
    window.localStorage.setItem(storageKey, secret);
  }
  return secret;
}

/**
 * Indica si el usuario ya vinculó previamente su Google Authenticator en este dispositivo.
 */
export function isTotpEnrolled(email: string): boolean {
  if (typeof window === 'undefined') return false;
  const normalized = email.trim().toLowerCase();
  return (
    window.localStorage.getItem(`iinicia_totp_enrolled_${normalized}`) === 'true'
  );
}

/**
 * Marca el dispositivo como vinculado con Google Authenticator para ese correo.
 */
export function markTotpEnrolled(email: string): void {
  if (typeof window === 'undefined') return;
  const normalized = email.trim().toLowerCase();
  window.localStorage.setItem(`iinicia_totp_enrolled_${normalized}`, 'true');
}

/**
 * Construye la URL oficial otpauth:// para escanear desde Google Authenticator.
 */
export function buildOtpAuthUri(email: string, secret: string): string {
  const issuer = 'Universidad IINICIA';
  const account = email.trim().toLowerCase();
  const label = encodeURIComponent(`${issuer}:${account}`);
  const params = new URLSearchParams({
    secret,
    issuer,
    algorithm: 'SHA1',
    digits: '6',
    period: '30',
  });
  return `otpauth://totp/${label}?${params.toString()}`;
}

/**
 * Decodifica una cadena Base32 a Uint8Array.
 */
function base32ToBytes(base32: string): Uint8Array {
  const clean = base32.toUpperCase().replace(/[^A-Z2-7]/g, '');
  let bits = '';
  for (let i = 0; i < clean.length; i++) {
    const val = BASE32_ALPHABET.indexOf(clean[i]);
    if (val === -1) continue;
    bits += val.toString(2).padStart(5, '0');
  }
  const bytes = new Uint8Array(Math.floor(bits.length / 8));
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(bits.slice(i * 8, i * 8 + 8), 2);
  }
  return bytes;
}

/**
 * Calcula el código TOTP de 6 dígitos (RFC 6238) para un contador de tiempo dado.
 */
async function generateHotp(
  secretBase32: string,
  counter: number,
): Promise<string> {
  const keyBytes = base32ToBytes(secretBase32);
  const counterBytes = new Uint8Array(8);
  let temp = Math.floor(counter);
  for (let i = 7; i >= 0; i--) {
    counterBytes[i] = temp & 0xff;
    temp = Math.floor(temp / 256);
  }

  const cryptoKey = await window.crypto.subtle.importKey(
    'raw',
    keyBytes.buffer as ArrayBuffer,
    { name: 'HMAC', hash: 'SHA-1' },
    false,
    ['sign'],
  );

  const signature = await window.crypto.subtle.sign(
    'HMAC',
    cryptoKey,
    counterBytes.buffer as ArrayBuffer,
  );
  const hmac = new Uint8Array(signature);
  const offset = hmac[hmac.length - 1] & 0x0f;
  const binary =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);

  const otp = binary % 1_000_000;
  return otp.toString().padStart(6, '0');
}

/**
 * Verifica si el código de 6 dígitos introducido por el usuario coincide
 * con el código actual de Google Authenticator (ventana de ±1 paso de 30s).
 */
export async function verifyTotpCode(
  secretBase32: string,
  inputCode: string,
): Promise<boolean> {
  const cleanCode = inputCode.replace(/\s+/g, '');
  if (!/^\d{6}$/.test(cleanCode)) {
    return false;
  }

  const currentCounter = Math.floor(Date.now() / 1000 / 30);

  for (const offset of [-1, 0, 1]) {
    const expected = await generateHotp(secretBase32, currentCounter + offset);
    if (expected === cleanCode) {
      return true;
    }
  }

  return false;
}
