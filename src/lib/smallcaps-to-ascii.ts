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

type StringMapper = (string: string) => string;

export const smallCapsToAscii: StringMapper = (string: string) => {
  return string
    .split("")
    .map((c: string) => {
      if (Object.keys(smallCapsToAsciiTable).includes(c)) return smallCapsToAsciiTable[c];
      return c;
    })
    .join("");
};
