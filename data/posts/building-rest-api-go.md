---
id: building-rest-api-go
title: Building a REST API with Go
author: Emin
tags:
  - go
  - api
  - web-development
  - backend
excerpt: Learn how to create a robust REST API using Go, including authentication, validation, and testing.
---

I’ve built a few Go APIs for couple of internal tools. Here’s the short, from-the-trenches version of what actually works, what to skip, and the snippets I reuse.

## Why Go worked well for me

- **Fast deploys:** One static binary, tiny memory footprint, predictable perf.
- **Great stdlib:** `net/http`, `encoding/json`, `context` cover 80% of needs.
- **Obvious concurrency:** Goroutines for background work without ceremony.
- **Operationally boring:** Health checks, timeouts, and logs are straightforward.

## Minimal HTTP setup that scales later

Start with the standard library (Go 1.22+ `ServeMux` patterns are enough). Add a router only when you truly need advanced matching.

```go
func main() {
    mux := http.NewServeMux()

    mux.HandleFunc("GET /v1/health", func(w http.ResponseWriter, r *http.Request) {
        w.Header().Set("Content-Type", "application/json")
        w.WriteHeader(http.StatusOK)
        w.Write([]byte(`{"status":"ok"}`))
    })

    srv := &http.Server{
        Addr:              ":8080",
        Handler:           requestID(recoverer(logger(cors(mux)))),
        ReadHeaderTimeout: 5 * time.Second,
        IdleTimeout:       60 * time.Second,
    }

    log.Fatal(srv.ListenAndServe())
}
```

If/when you outgrow this, `chi` gives you lightweight routing and middleware without the bloat.

## JSON helpers I keep reusing

```go
func writeJSON(w http.ResponseWriter, status int, data any) {
    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(status)
    _ = json.NewEncoder(w).Encode(data)
}

func readJSON(r *http.Request, dst any) error {
    dec := json.NewDecoder(r.Body)
    dec.DisallowUnknownFields()
    return dec.Decode(dst)
}
```

Use `DisallowUnknownFields` so payload drift gets caught early. Keep error shapes boring and consistent:

```go
func errorJSON(w http.ResponseWriter, status int, msg string) {
    writeJSON(w, status, map[string]string{"error": msg})
}
```

## Middleware that pays for itself

- **Request ID:** add one if missing; include it in every log line.
- **Structured logs:** method, path, status, duration. Nothing fancy.
- **Recoverer:** never leak panics; return 500 and log the stack.
- **CORS:** allow only what you need; handle `OPTIONS` quickly.

Wire them as a simple chain. No need for a framework.

## Handlers: context and timeouts first

Every handler should honor deadlines and be easy to test.

```go
func listUsers(w http.ResponseWriter, r *http.Request) {
    ctx, cancel := context.WithTimeout(r.Context(), 3*time.Second)
    defer cancel()

    users, err := store.ListUsers(ctx) // pgx + context
    if err != nil {
        errorJSON(w, http.StatusInternalServerError, "unable to list users")
        return
    }
    writeJSON(w, http.StatusOK, users)
}
```

## Auth, validation, and data

- **Auth:** start with `Authorization: Bearer <jwt>` and verify signatures server-side. Cache JWKS if you use an IdP.
- **Validation:** validate at the edge; reject early; prefer clear error messages over cleverness.
- **Postgres:** `pgxpool` with short timeouts; migrations via `golang-migrate`.

## Tests that catch regressions without ceremony

```go
func TestHealth(t *testing.T) {
    rr := httptest.NewRecorder()
    req := httptest.NewRequest(http.MethodGet, "/v1/health", nil)
    handler := buildServer().Handler // compose mux + middleware
    handler.ServeHTTP(rr, req)
    if rr.Code != http.StatusOK { t.Fatalf("got %d", rr.Code) }
}
```

## Production checklist I actually use

- Env-driven config and secrets; no flags in containers.
- Health/readiness endpoints; startup probe if DB is required.
- Metrics (Prometheus) and structured logs (zap/zerolog/log/slog).
- Rate limiting at the edge (CDN/reverse proxy) before the app.

## Lessons learned

- Prefer the standard library until it hurts, then add small, focused libs.
- Keep handlers pure and fast; do heavy lifting in services/background jobs.
- Measure before “optimizing.” Most wins came from timeouts and backpressure.

That’s the practical core. With this setup, I can spin up a new API in an afternoon and feel confident putting it behind a load balancer the same day.
