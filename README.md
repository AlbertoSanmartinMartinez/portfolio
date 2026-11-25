# Alberto Sanmartín Martínez — portfolio

The personal website of Alberto Sanmartín Martínez: who he is, his experience and projects, and a way to get in touch. Built with Next.js and PostgreSQL, hosted on DigitalOcean App Platform.

## Run it locally

You need git, Docker with Compose v2, Node.js and pnpm (versions in `package.json` once `specs/001` lands). The stack runs PostgreSQL; the site runs with `pnpm dev`.

```bash
scripts/stack.sh up      # start this worktree's stack
scripts/stack.sh info    # URLs and ports
scripts/stack.sh seed    # synthetic data and test accounts
scripts/stack.sh logs    # follow the logs
scripts/stack.sh down    # stop it and remove its volumes
```

Each git worktree gets its own stack, so several can run at once.

Then run the site against it:

```bash
nvm use                                         # Node from .nvmrc
pnpm install --frozen-lockfile
eval "$(scripts/stack.sh info | grep ^export)"  # database and SMTP (Mailpit) variables
export SITE_URL=http://localhost:3000
pnpm db:migrate && scripts/stack.sh seed
pnpm dev                                        # emails sent by the form show up in Mailpit ($MAILPIT_URL)
```

## How this repo works

- [Architecture](docs/architecture.md): what lives where and how the parts connect.
- [Specs](specs/README.md): every feature goes intent → spec → plan before code.
- [Guides](docs/guides/): migrations, dependencies, CI/CD, releases and more.
- [Decisions](docs/decisions.md): why things are the way they are.
- [Environments](docs/environments.md): local, dev, stage and prod.
- [Working with coding agents](docs/harness.md): `AGENTS.md` holds the rules every agent follows.

## Contributing

Branch from `main`, open a draft pull request with the template, run the checks in `AGENTS.md` and fill in Risk and After Merge. A person marks it ready and merges.

Built from the Agentic SDLC harness template; the version is in `.harness-version`.
