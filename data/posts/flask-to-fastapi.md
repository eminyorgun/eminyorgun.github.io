---
id: flask-to-fastapi
title: Why I’m Moving from Flask to FastAPI
author: Emin
tags:
  - python
  - backend
  - fastapi
  - flask
  - web-apis
excerpt: My firsthand reasons for switching from Flask to FastAPI—less boilerplate, built-in validation, async performance, and a smoother developer experience.
---
I like Flask. I’ve shipped plenty of small APIs and dashboards with it. But as my services grew—more endpoints, more integrations, Flask started costing me time in places FastAPI just… doesn’t. Here’s what finally pushed me to switch, and what I’m getting back.

## What slowed me down in Flask

- Manual request parsing and validation scattered across views. I’ve hand-rolled shape checks, duplicated error messages, or relied on separate schema layers that drift from the code.
- Blueprint sprawl and implicit contracts. It’s easy to add routes; it’s hard to keep their request/response shapes consistent and discoverable.
- Concurrency is an afterthought. For IO-bound work (DB calls, downstream APIs), I ended up juggling threads/processes or blocking the server.
- Docs are never up to date. Swagger setups worked, but they’re extra glue and break silently.

## What I get with FastAPI on day one

- Request/response models with Pydantic. The function signature is the contract, and it’s validated for me.
- Async first. I can write `async def` and stop pretending my IO is synchronous.
- Auto docs. `/docs` and `/redoc` are there, correct, and require zero extra effort.
- Better editor help. Types mean jumps, refactors, and autocomplete that actually reflects runtime.

Here’s a tiny slice of why it feels cleaner to me:

```python
from fastapi import FastAPI
from pydantic import BaseModel, EmailStr

app = FastAPI()

class UserIn(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: int
    email: EmailStr

@app.post('/users', response_model=UserOut)
def create_user(user: UserIn):
    return {"id": 1, "email": user.email}
```

- No hand-parsing, no “did I remember to validate this?”
- Response shape is enforced; secrets don’t accidentally leak.

## The async win (for my workloads)

Most of my endpoints are IO-bound. With FastAPI + Uvicorn, concurrency is built in. I can fetch from a database and a third-party API concurrently without blocking a worker per call.

```python
@app.get('/items')
async def items():
    data = await fetch_from_db()
    return data
```

I’m not rebuilding an async stack; I’m just using it.

## Migration: how I’m doing it

1. Keep Flask running. Add a FastAPI app alongside it.
2. Move the IO-heavy endpoints first (biggest win, smallest risk).
3. Introduce Pydantic models that mirror my existing payloads.
4. Proxy selected routes and cut over behind feature flags.
5. Clean up shared utilities as I go (auth, settings, DB access).

This keeps risk low and lets me ship improvements incrementally.

## Where Flask still fits for me

- Tiny internal tools or admin panels
- Apps where I already have solid extensions and patterns
- CPU-bound work where async doesn’t help much

Flask is great for small and simple. FastAPI shines when the surface area and concurrency grow.

## Why I’m switching

I’m trading ad-hoc validation and drift-prone docs for strong, typed contracts. I’m getting async without ceremony. And I’m spending less time on glue and more on features. That’s enough for me.


