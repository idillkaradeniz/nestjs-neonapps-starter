// Fills {param} placeholders in a message template with real values.
// e.g. formatMessage('User {id} not found', { id: 42 })

export function formatMessage(
  template: string,
  params: Record<string, string | number> = {},
): string {
  return template.replace(/\{(\w+)\}/g, (_match, key: string) =>
    key in params ? String(params[key]) : `{${key}}`,
  );
}
