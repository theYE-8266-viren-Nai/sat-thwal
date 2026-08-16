type QueryResponse = { data?: unknown; error?: unknown; count?: number };
type RpcResponse = { data?: unknown; error?: unknown };

export interface SupabaseCall {
  table?: string;
  method: string;
  args: unknown[];
}

class QueryBuilder {
  constructor(
    private readonly table: string,
    private readonly response: QueryResponse,
    private readonly calls: SupabaseCall[],
  ) {}

  private record(method: string, args: unknown[]) {
    this.calls.push({ table: this.table, method, args });
    return this;
  }

  select(...args: unknown[]) { return this.record("select", args); }
  eq(...args: unknown[]) { return this.record("eq", args); }
  in(...args: unknown[]) { return this.record("in", args); }
  order(...args: unknown[]) { return this.record("order", args); }
  limit(...args: unknown[]) { return this.record("limit", args); }
  insert(...args: unknown[]) { return this.record("insert", args); }
  update(...args: unknown[]) { return this.record("update", args); }
  single(...args: unknown[]) { this.record("single", args); return Promise.resolve(this.response); }
  maybeSingle(...args: unknown[]) { this.record("maybeSingle", args); return Promise.resolve(this.response); }

  then<TResult1 = QueryResponse, TResult2 = never>(
    onfulfilled?: ((value: QueryResponse) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ) {
    return Promise.resolve(this.response).then(onfulfilled, onrejected);
  }
}

export function createSupabaseMock(responses: Record<string, QueryResponse | QueryResponse[]> = {}) {
  const calls: SupabaseCall[] = [];
  const queues = new Map<string, QueryResponse[]>();

  for (const [table, response] of Object.entries(responses)) {
    queues.set(table, Array.isArray(response) ? [...response] : [response]);
  }

  return {
    calls,
    from(table: string) {
      calls.push({ table, method: "from", args: [] });
      const queue = queues.get(table) ?? [];
      const response = queue.length ? queue.shift()! : { data: null, error: null };
      return new QueryBuilder(table, response, calls);
    },
    rpc(name: string, args?: Record<string, unknown>) {
      calls.push({ method: "rpc", args: [name, args] });
      const queue = queues.get(`rpc:${name}`) ?? [];
      const response = (queue.length ? queue.shift()! : { data: null, error: null }) as RpcResponse;
      return Promise.resolve(response);
    },
  };
}