<p align="center">
  <img src="assets/banner.png" alt="Andrezza Medeiros Souza — Backend & AI engineer · Python, Java, LLMs, distributed systems" width="100%">
</p>

<p align="center">
  <i>Backend engineer moving into AI: I build and explain language models, starting with a GPT I trained from scratch.</i><br><br>
  <a href="mailto:andrezzaammss@gmail.com"><img src="https://img.shields.io/badge/✉_andrezzaammss@gmail.com-0d1117?style=for-the-badge&labelColor=0d1117&color=1e293b" alt="Email"></a>
</p>

## Background

Backend developer since 2020, in Brazil and then Germany. I've worked on financial reconciliation,
Kafka consumers for stock exchange orders, and an encrypted email platform running on NATS JetStream
with mTLS between tenants.

A few things from that work that stuck with me:

- Synchronous deletes on a 60 GB object store were blocking NATS and taking the service down for about
  two hours a day. Moving the deletes to an async queue made it go away.
- For an OTP replay bug, the quick fix was an in-memory cache of used codes. I pushed for storing them in
  the database instead, so a restart or a second instance couldn't reopen the hole.
- I've also fixed an XSS, a data leak through an API response and an antivirus bypass on file uploads.

> *The security bugs are the part I liked most, and it's where I want to keep going.*

## Projects

### [pocketchat](https://github.com/dedezza1D/pocketchat) · Python, PyTorch

A small ChatGPT-style model I built and trained from scratch on my laptop's RTX 4060 (8 GB), to understand
language models below the API. No pretrained weights and no model libraries.

- Byte-level BPE tokenizer written by hand. Counting pairs over unique words with a lazy-deletion heap learns 8,192 tokens in about a minute.
- GPT with RoPE, RMSNorm, SwiGLU and tied embeddings: 29.9M parameters, pretrained on 491M tokens of FineWeb-Edu in about 4 hours. Validation perplexity went from ~8,950 (a uniform guess) to 25.6.
- Validation runs on fixed windows. The first version sampled new windows at every evaluation, and the "best" checkpoint it picked was worse than the last one once both were measured on the full set.
- Chat fine-tuning on human-written conversations (oasst1, Dolly), with the loss only on the assistant's tokens. On a fixed question set, answers that end properly went from 0% to 80% and repeated 3-grams fell from 66% to 6.7%.
- Tied embeddings have a side effect: the chat tokens never appear in pretraining, so their rows collapsed to almost the same vector (cosine 0.996). Re-initializing them before fine-tuning helped a little.
- Fine-tuning also made the model forget: after "Water is made of hydrogen and", the chance of "oxygen" dropped from 52.9% to 28.8%.

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

## Open source

I have a contribution in [Spring Boot Migrator](https://github.com/spring-projects-experimental/spring-boot-migrator)
and want more. I try to ship a small Go project most weeks, and I'm looking for messaging or security
projects with open issues — reach out at [andrezzaammss@gmail.com](mailto:andrezzaammss@gmail.com) if you have one.

<p align="center">
  <img src="https://img.shields.io/badge/Python-0d1117?style=flat-square&logo=python&logoColor=94a3b8" alt="Python">
  <img src="https://img.shields.io/badge/PyTorch-0d1117?style=flat-square&logo=pytorch&logoColor=94a3b8" alt="PyTorch">
  <img src="https://img.shields.io/badge/Java-0d1117?style=flat-square&logo=openjdk&logoColor=94a3b8" alt="Java">
  <img src="https://img.shields.io/badge/Go-0d1117?style=flat-square&logo=go&logoColor=94a3b8" alt="Go">
  <img src="https://img.shields.io/badge/Spring_Boot-0d1117?style=flat-square&logo=springboot&logoColor=94a3b8" alt="Spring Boot">
  <img src="https://img.shields.io/badge/TypeScript-0d1117?style=flat-square&logo=typescript&logoColor=94a3b8" alt="TypeScript">
  <img src="https://img.shields.io/badge/Kafka-0d1117?style=flat-square&logo=apachekafka&logoColor=94a3b8" alt="Kafka">
  <img src="https://img.shields.io/badge/NATS-0d1117?style=flat-square&logo=natsdotio&logoColor=94a3b8" alt="NATS">
  <img src="https://img.shields.io/badge/PostgreSQL-0d1117?style=flat-square&logo=postgresql&logoColor=94a3b8" alt="PostgreSQL">
  <img src="https://img.shields.io/badge/mTLS-0d1117?style=flat-square&logo=letsencrypt&logoColor=94a3b8" alt="mTLS">
</p>

<p align="center">
  <sub>Portuguese (native) · English (fluent, day-to-day work language) · German (B1) · Spanish (learning)</sub>
</p>
