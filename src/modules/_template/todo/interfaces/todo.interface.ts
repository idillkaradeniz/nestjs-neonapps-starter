// Domain type for this module. Exported types live in interfaces/,
// one export per file. When the real database arrives (Day 13) this
// will be replaced by a type inferred from the table schema.
export interface Todo {
  id: number;
  title: string;
  done: boolean;
}
