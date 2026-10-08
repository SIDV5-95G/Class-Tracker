/**
 * Formats name, class, and roll number into standardized Student ID:
 * e.g. "Rohan", "D9B", "28" -> "ROHAN-D9B-28"
 */
export function formatStudentId(name: string, className: string, rollNo: string): string {
  const cleanName = name.trim().replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  const cleanClass = className.trim().replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  const cleanRoll = rollNo.trim().replace(/[^0-9]/g, '');

  if (!cleanName && !cleanClass && !cleanRoll) return '';
  return `${cleanName}-${cleanClass}-${cleanRoll}`;
}

/**
 * Normalizes any entered Student ID to standardized UPPERCASE hyphenated format
 * e.g. "rohan d9b 28" -> "ROHAN-D9B-28"
 */
export function normalizeStudentId(rawId: string): string {
  return rawId
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '-')
    .replace(/_+/g, '-')
    .replace(/-+/g, '-');
}

/**
 * Converts Student ID into a unique internal Supabase Auth domain
 * e.g. "ROHAN-D9B-28" -> "rohan-d9b-28@student.classtracker"
 */
export function studentIdToAuthEmail(studentId: string): string {
  const normalized = normalizeStudentId(studentId).toLowerCase();
  return `${normalized}@student.classtracker`;
}

/**
 * Extracts clean Student ID from internal auth email or metadata
 */
export function extractStudentId(email?: string, metaId?: string): string {
  if (metaId) return metaId.toUpperCase();
  if (!email) return 'STUDENT';
  const prefix = email.split('@')[0];
  return prefix.toUpperCase();
}
