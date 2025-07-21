export {}

const smallCapsToAsciiTable: Record<string, string> = {
  "ᴀ": "a",
  "ʙ": "b",
  "ᴄ": "c",
  "ᴅ": "d",
  "ᴇ": "e",
  "ꜰ": "f",
  "ɢ": "g",
  "ʜ": "h",
  "ɪ": "i",
  "ᴊ": "j",
  "ᴋ": "k",
  "ʟ": "l",
  "ᴍ": "m",
  "ɴ": "n",
  "ᴏ": "o",
  "ᴘ": "p",
  "ꞯ": "q",
  "ʀ": "r",
  "ꜱ": "s",
  "ᴛ": "t",
  "ᴜ": "u",
  "ᴠ": "v",
  "ᴡ": "w",
  "ʏ": "y",
  "ᴢ": "z",
};

declare global {
    interface String {
        smallCapsToAscii(): string;
    }
}

String.prototype.smallCapsToAscii = function(): string {
  return this
    .split("")
    .map((c: string) => smallCapsToAsciiTable[c] || c)
    .join("");
};
