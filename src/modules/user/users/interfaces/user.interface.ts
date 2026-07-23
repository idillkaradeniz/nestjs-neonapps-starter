// Domain type for this module. In-memory mock data today; a real lookup
// once persistence lands (see _template/todo for the pattern this
// module follows).
export interface User {
  id: number;
  name: string;
  email: string;
}
