# TODO(adopt): project name

TODO(adopt): one paragraph on what this project is and who it is for.

## Run it locally

You need git and Docker with Compose v2. TODO(adopt): language toolchains, if the project needs them outside Docker.

```bash
scripts/stack.sh up      # start this worktree's stack
scripts/stack.sh info    # URLs and ports
scripts/stack.sh seed    # synthetic data and test accounts
scripts/stack.sh logs    # follow the logs
scripts/stack.sh down    # stop it and remove its volumes
```

Each git worktree gets its own stack, so several can run at once.

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
