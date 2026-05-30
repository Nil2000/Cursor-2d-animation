export function extractPythonCode(message: string): string | null {
  if (!message) return null;
  const pythonBlockRegex =
    /```(?:python|py)\r?\n([\s\S]*?)\r?\n```/;
  const match = message.match(pythonBlockRegex);
  if (!match || match[1] === undefined) {
    return null;
  }
  return match[1].trim();
}

export async function getPythonBlockCodeFromMessage(message: string) {
  return extractPythonCode(message);
}
