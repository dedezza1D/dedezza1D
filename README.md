<!-- The pages are generated from book/build.js — edit the text there and run `node book/build.js`. -->

<p align="center">
  <a href="mailto:andrezzaammss@gmail.com"><img src="assets/pages/0-title.svg" width="100%" alt="Andrezza Medeiros Souza. Backend Engineer. Java & Go · Security. Java and Go day to day — increasingly focused on the security side of both. Leipzig. andrezzaammss@gmail.com"></a>
</p>

<p align="center">
  <img src="assets/pages/1-background.svg" width="100%" alt="Chapter I, Background. Backend developer since 2020, in Brazil and then Germany. See the plain-text version below.">
</p>

<p align="center">
  <a href="https://github.com/dedezza1D/taskflow"><img src="assets/pages/2-taskflow.svg" width="100%" alt="Chapter II, TaskFlow — Go, React/TypeScript. Click to open the repository."></a>
</p>

<p align="center">
  <a href="https://github.com/dedezza1D/paywallet"><img src="assets/pages/3-paywallet.svg" width="100%" alt="Chapter III, PayWallet — Java 21, Spring Boot. Click to open the repository."></a>
</p>

<p align="center">
  <a href="https://github.com/spring-projects-experimental/spring-boot-migrator"><img src="assets/pages/4-open-source.svg" width="100%" alt="Chapter IV, Open Source. See the plain-text version below."></a>
</p>

<details>
<summary><sub>Read as plain text</sub></summary>

## Andrezza Medeiros Souza

Backend engineer in Leipzig. Java and Go day to day — increasingly focused on the security side of both.

[andrezzaammss@gmail.com](mailto:andrezzaammss@gmail.com)

### Background

Backend developer since 2020, in Brazil and then Germany. I've worked on financial reconciliation,
Kafka consumers for stock exchange orders, and an encrypted email platform running on NATS JetStream
with mTLS between tenants.

A few things from that work that stuck with me:

- Synchronous deletes on a 60 GB object store were blocking NATS and taking the service down for about
  two hours a day. Moving the deletes to an async queue made it go away.
- For an OTP replay bug, the quick fix was an in-memory cache of used codes. I pushed for storing them in
  the database instead, so a restart or a second instance couldn't reopen the hole.
- I've also fixed an XSS, a data leak through an API response and an antivirus bypass on file uploads.

The security bugs are the part I liked most, and it's where I want to keep going.

### [TaskFlow](https://github.com/dedezza1D/taskflow) · Go, React/TypeScript

My first real Go project. It started as a task queue on NATS JetStream and Postgres, and I gave it a
job to make it honest: you upload a PDF or a scan, it runs OCR (Tesseract), finds the personal data,
writes a GDPR/LGPD report and deletes the original.

- Messages can arrive twice, so handlers are idempotent. Failed tasks retry with backoff and end up in a DLQ.
- The task row doubles as an outbox. If the process dies between the Postgres commit and the NATS publish, it gets republished.
- Workers hold heartbeat leases, so a crashed worker's task gets picked up by someone else and never by two at once.
- A 16-digit number isn't a card number until it passes Luhn. Same idea for IBANs (mod-97) and CPF/CNPJ (mod-11).
- Document text and PII never go into logs, traces, error messages or the DLQ.
- Ships as a server behind nginx, and as a desktop app for people who don't want their documents leaving the machine.
- Observability via OpenTelemetry/Prometheus/Grafana/Loki, integration tests against real Postgres in CI.

### [PayWallet](https://github.com/dedezza1D/paywallet) · Java 21, Spring Boot

A wallet with transfers, Pix and merchant charges.

- Double-entry ledger. A balance is never updated on its own: every transfer writes postings that sum to zero, and Postgres constraints reject anything that doesn't.
- The Kafka event is written to an outbox table in the same transaction as the transfer, so there's no transfer without an event or event without a transfer.
- Feed in MongoDB, idempotency keys and daily limits in Redis, KYC documents in a private S3 bucket.
- Access tokens are signed with RS256 and published on a JWKS endpoint. Reusing an old refresh token kills the whole session. Login runs BCrypt even for unknown emails, so response time doesn't tell you if an account exists.

### Open source

I have a contribution in [Spring Boot Migrator](https://github.com/spring-projects-experimental/spring-boot-migrator)
and want more. I try to ship a small Go project most weeks, and I'm looking for messaging or security
projects with open issues — reach out at [andrezzaammss@gmail.com](mailto:andrezzaammss@gmail.com) if you have one.

Portuguese (native) · English (fluent, day-to-day work language) · German (B1) · Spanish (learning)

</details>
