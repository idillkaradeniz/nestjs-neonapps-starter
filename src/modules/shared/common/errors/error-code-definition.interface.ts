// A catalog entry: every domain error is described by one of these.
// `message` is a template — {param} placeholders get filled in by
// formatMessage() using the params passed when the error is thrown.
export interface ErrorCodeDefinition {
  code: string;
  status: number;
  message: string;
}
