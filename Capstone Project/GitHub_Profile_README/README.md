<h1 align="center">Hi, I'm Ariel</h1>

<p align="center">
  <em>Full-Stack Developer</em>
</p>

---

## About

Full-stack developer working across the JavaScript and TypeScript ecosystem — React on
the front end, Node and Express on the back, PostgreSQL underneath.

Currently interested in the engineering discipline around LLM-powered applications:
constraining generative systems so their output is auditable rather than merely fluent.

---

## Tech Stack

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Git](https://img.shields.io/badge/Git-F05032?style=for-the-badge&logo=git&logoColor=white)

---

## Featured Project

### [biz2code — A Linear Gatekeeper for Business-Validated Development](https://github.com/arielzin33-creator/DI-Bootcamp/tree/main/Capstone%20Project)

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=nodedotjs&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white)

A gated workflow that walks a software idea through four human-approved phases and
generates a Market Requirements Document, a Product Requirements Document and a Business
Plan from the answers.

**The problem it addresses.** General-purpose language models cannot reliably infer which
analysis a given business idea actually needs — a judgement that changes case by case. Left
unconstrained, they produce confident, fluent, unsourced analysis.

**How it works.** The model is constrained into a fixed sequence of questions it cannot
alter, and permitted to cite only three things: the user's own answers, a curated benchmark
file with per-entry provenance, and two keyless public APIs. Anything it cannot source
renders as **unvalidated** rather than invented. Where published sources disagree, the
generated document reports the disagreement instead of silently picking a winner. All
derived figures — unit economics, payback period — are computed deterministically, so the
same inputs always produce the same numbers.

**What I took from building it.** That the interesting engineering in an LLM application
is rarely the prompt. It's the boundary work: deciding what the model is allowed to assert,
making unsourced output visibly unsourced, and keeping arithmetic away from a system that
cannot be audited when it errs.

---

<sub>Built during the Developers Institute Full-Stack & AI Bootcamp.</sub>
