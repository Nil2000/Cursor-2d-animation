export function extractPythonCode(message: string): string | null {
  if (!message) return null;
  const pythonBlockRegex = /```python\n([\s\S]*?)\n```/g;
  const matches = message.match(pythonBlockRegex);
  if (!matches || matches.length === 0) {
    return null;
  }

  // Extract only the first match
  const pythonCode = matches[0].replace(/```python\n/, "").replace(/\n```/, "");
  return pythonCode.trim();
}

export async function getPythonBlockCodeFromMessage(message: string) {
  return extractPythonCode(message);
}
