<p align="center">
  <img src="assets/banner.svg" alt="Andrezza Medeiros Souza — Backend & AI engineer · Python & Java" width="100%">
</p>

<p align="center">
  <i>Backend engineer moving into AI: I build and explain language models, starting with a GPT I trained from scratch.</i><br><br>
  <a href="mailto:andrezzaammss@gmail.com"><img src="https://img.shields.io/badge/✉_andrezzaammss@gmail.com-0b0a0c?style=for-the-badge&labelColor=0b0a0c&color=5a1320" alt="Email"></a>
</p>

<p align="center"><img src="assets/divider.svg" width="420" alt=""></p>

## ✠ Background

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

<p align="center"><img src="assets/divider.svg" width="420" alt=""></p>

## ✠ Projects

### † [pocketchat](https://github.com/dedezza1D/pocketchat) · Python, PyTorch

A small ChatGPT-style model I built and trained from scratch on my laptop's RTX 4060 (8 GB), to understand
language models below the API. No pretrained weights and no model libraries.

- Byte-level BPE tokenizer written by hand. Counting pairs over unique words with a lazy-deletion heap learns 8,192 tokens in about a minute.
- GPT with RoPE, RMSNorm, SwiGLU and tied embeddings: 29.9M parameters, pretrained in about 4 hours on 491M token positions sampled from a 483M-token FineWeb-Edu corpus (sampling with replacement left about a third of it unseen). Perplexity went from ~9,000 at the start (close to a uniform guess over 8,192 tokens) to 25.6 on validation.
- Validation runs on fixed windows. The first version sampled new windows at every evaluation, and the "best" checkpoint it picked was worse than the last one once both were measured on the full set.
- Chat fine-tuning on human-written conversations (oasst1, Dolly), with the loss only on the assistant's tokens. On a fixed set of 30 questions, 80% of the answers end with the end-of-turn token; the base model never saw that token, so it scores 0% by construction. Repeated 3-grams fell from 66% to 6.7%.
- Tied embeddings have a side effect: the chat tokens never appear in pretraining, so their rows collapsed to almost the same vector (cosine 0.996). Re-initializing them lowers the starting fine-tuning loss; after fine-tuning, the two runs are within noise.
- Fine-tuning also made the model forget: perplexity on the pretraining validation text rose from 25.6 to 30.1, and after "Water is made of hydrogen and" the chance of "oxygen" dropped from 52.9% to 28.8%.
- The weights are published with the tokenizer, so the model runs without training: the [pretrained model](https://github.com/dedezza1D/pocketchat/releases/tag/v0.1.0) (MIT) and the [chat model](https://github.com/dedezza1D/pocketchat/releases/tag/v0.2.0) (CC BY-SA 3.0, because of the Dolly data).

### † [TaskFlow](https://github.com/dedezza1D/taskflow) · Go, React/TypeScript

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

### † [PayWallet](https://github.com/dedezza1D/paywallet) · Java 21, Spring Boot

A wallet with transfers, Pix and merchant charges.

- Double-entry ledger. A balance is never updated on its own: every transfer writes postings that sum to zero, and Postgres constraints reject anything that doesn't.
- The Kafka event is written to an outbox table in the same transaction as the transfer, so there's no transfer without an event or event without a transfer.
- Feed in MongoDB, idempotency keys and daily limits in Redis, KYC documents in a private S3 bucket.
- Access tokens are signed with RS256 and published on a JWKS endpoint. Reusing an old refresh token kills the whole session. Login runs BCrypt even for unknown emails, so response time doesn't tell you if an account exists.

<p align="center"><img src="assets/divider.svg" width="420" alt=""></p>

## ✠ Writing

### † [Inside a ChatGPT](https://dedezza1d.github.io/inside-a-chatgpt/) · a series in three parts

How a language model works, for people starting out without a math background. It follows one sentence,
"Water is made of hydrogen and", through pocketchat, and every example and number in it is measured on the model.
Also in Portuguese: [Como um ChatGPT funciona por dentro](https://dedezza1d.github.io/como-um-chatgpt-funciona/).

- [Part 0 — The math of AI, without fear](https://dedezza1d.github.io/inside-a-chatgpt/part-0-the-math.html): vectors, dot products, softmax and gradient descent, with additions and multiplications only.
- [Part 1 — Inside the model](https://dedezza1d.github.io/inside-a-chatgpt/part-1-inside-the-model.html): tokens, attention, training, and where the model's wrong answers come from.
- [Part 2 — Teaching the model to chat](https://dedezza1d.github.io/inside-a-chatgpt/part-2-teaching-it-to-chat.html): chat fine-tuning, what it teaches, and the facts the model forgets along the way.

<p align="center"><img src="assets/divider.svg" width="420" alt=""></p>

## ✠ Open source

I have a contribution in [Spring Boot Migrator](https://github.com/spring-projects-experimental/spring-boot-migrator)
and want more. I try to ship a small Go project most weeks, and I'm looking for messaging or security
projects with open issues — reach out at [andrezzaammss@gmail.com](mailto:andrezzaammss@gmail.com) if you have one.

<p align="center"><img src="assets/divider.svg" width="420" alt=""></p>

<p align="center">
  <img src="https://img.shields.io/badge/Python-0b0a0c?style=flat-square&logo=python&logoColor=b8aa94" alt="Python">
  <img src="https://img.shields.io/badge/PyTorch-0b0a0c?style=flat-square&logo=pytorch&logoColor=b8aa94" alt="PyTorch">
  <img src="https://img.shields.io/badge/Java-0b0a0c?style=flat-square&logo=openjdk&logoColor=b8aa94" alt="Java">
  <img src="https://img.shields.io/badge/Go-0b0a0c?style=flat-square&logo=go&logoColor=b8aa94" alt="Go">
  <img src="https://img.shields.io/badge/Spring_Boot-0b0a0c?style=flat-square&logo=springboot&logoColor=b8aa94" alt="Spring Boot">
  <img src="https://img.shields.io/badge/TypeScript-0b0a0c?style=flat-square&logo=typescript&logoColor=b8aa94" alt="TypeScript">
  <img src="https://img.shields.io/badge/Kafka-0b0a0c?style=flat-square&logo=apachekafka&logoColor=b8aa94" alt="Kafka">
  <img src="https://img.shields.io/badge/NATS-0b0a0c?style=flat-square&logo=natsdotio&logoColor=b8aa94" alt="NATS">
  <img src="https://img.shields.io/badge/PostgreSQL-0b0a0c?style=flat-square&logo=postgresql&logoColor=b8aa94" alt="PostgreSQL">
  <img src="https://img.shields.io/badge/mTLS-5a1320?style=flat-square&logo=letsencrypt&logoColor=efe6d6" alt="mTLS">
</p>

<p align="center">
  <sub>Portuguese (native) · English (fluent, day-to-day work language) · German (B1) · Spanish (learning)</sub>
</p>
