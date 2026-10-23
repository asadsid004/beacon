# Demo data

Adds 40 users, 40 posts, and 328 comments, including engineering article links and original discussions.

Set `DATABASE_URL` to the target database, apply migrations, then run:

```bash
bun run db:seed:demo
```

## Main login

- Email: `alex.morgan@example.com`
- Username: `alexm`
- Password: printed on the first run, or set with `DEMO_PASSWORD` before running.

Only the main account can sign in. Reruns update the original placeholder identities and preserve posts, comments, and passwords without adding duplicates.

Use `db:seed:demo` for production demos. The separate `db:seed` command resets local/CI test fixtures.
