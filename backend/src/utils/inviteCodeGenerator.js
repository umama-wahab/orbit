import { customAlphabet } from "nanoid";

// Unambiguous uppercase alphanumeric set (no 0/O, 1/I confusion)
const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const generate = customAlphabet(alphabet, 4);

/**
 * Generates invite codes in the format ABX7-KP92
 */
export function generateInviteCode() {
  return `${generate()}-${generate()}`;
}
