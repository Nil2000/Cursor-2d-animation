export async function getPythonBlockCodeFromMessage(message: string) {
  const pythonBlockRegex = /```python\n([\s\S]*?)\n```/g;
  const matches = message.match(pythonBlockRegex);
  if (!matches || matches.length === 0) {
    return null;
  }

  // Extract only the first match
  const pythonCode = matches[0].replace(/```python\n/, "").replace(/\n```/, "");
  return pythonCode.trim();
}
