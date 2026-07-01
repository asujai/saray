<!-- BEGIN TESTSPRITE AGENT SECTION (testsprite agent install codex) -->
# TestSprite Verification Loop

After finishing a feature or fix in a TestSprite-tested repo, use the `testsprite`
CLI to run the relevant TestSprite tests against the change and inspect any failure
artifacts before reporting the work as done. Use whenever code has changed outside
docs/config and is about to be reported complete.

## When to run

Run after a feature or fix lands. Skip only for: docs-only edits, pure
build/config changes, or when the repo has no TestSprite project linked.

## Core loop

### 1. Preflight

```bash
testsprite --version          # CLI installed?
testsprite auth whoami        # credentials valid?
```

If `--version` fails, tell the user to install the CLI and stop.
If `auth whoami` fails, tell the user to run `testsprite auth configure` and stop.

### 2. Find the project

In order: `$TESTSPRITE_PROJECT_ID` → `.testsprite/config.json` → `testsprite project list --output json`.

### 3. Run

```bash
# New frontend test from plan (most common)
testsprite test create --plan-from plan.json --run --wait \
  --target-url https://staging.example.com --timeout 600 --output json

# Existing test
testsprite test run <test-id> --target-url https://staging.example.com \
  --wait --timeout 600 --output json

# New backend test from Python assertion file
testsprite test create --type backend --name "Login rejects empty password" \
  --project <id> --code-file /tmp/test.py --run --wait --timeout 600

# Replay (cheaper than a fresh run — reuses saved test code)
testsprite test rerun <test-id> --wait --output json

# Backend tests sharing state: declare the dependency graph at create time;
# the wave engine orders runs (producers → consumers → teardown last)
testsprite test create --type backend --project <id> --code-file /tmp/login.py \
  --name "login issues an auth token" --produces auth_token
testsprite test create --type backend --project <id> --code-file /tmp/profile.py \
  --name "profile update accepts the token" --needs auth_token
testsprite test create --type backend --project <id> --code-file /tmp/cleanup.py \
  --name "fixture user is deleted" --category teardown

# Wave-ordered batch fresh run (BE tests, all or filtered)
testsprite test run --all --project <id> [--filter <substr>] \
  --wait --max-concurrency 4 --output json
```

**Key behaviors:**

- `--target-url` must be publicly reachable (no localhost / RFC1918) and must
  already have the change deployed (e.g. a CI preview deploy) — the CLI tests a
  deployed URL, it doesn't host your environment. Running earlier verifies the
  previous build.
- `--wait` long-polls until terminal. Do not wrap it in a retry loop.
- Exit `0` = passed; `1` = failed/blocked; `7` = timeout (resume with `test wait <run-id>`).
- BE dependency flags (`--produces`/`--needs`/`--category`) are backend-only and
  **create-only** — they can't be read back or edited later (delete + recreate to
  change the graph). Don't hand-sequence `test run` calls to fake ordering; use
  `test run --all` so the engine passes captured variables between waves.
- A BE `test rerun` dispatches the whole producer/teardown closure, side effects
  included; `--skip-dependencies` reruns only the named test. If a producer failed
  in the same closure, the consumer's failure is starvation (missing token/fixture)
  — triage the producer first; it does not implicate your change.
- `create` and `--wait` output include a `dashboardUrl` — if the user wants to
  inspect a test or run themselves, point them there.

### 4. On failure — download the artifact

```bash
testsprite test artifact get <run-id> --out ./.testsprite/runs/<run-id>/
```

Inspect the bundle (failing step, screenshots, root-cause hypothesis) before
deciding whether your change caused the failure.

### 5. One more tool — dry-run for learning

Every command works without credentials under `--dry-run`:

```bash
testsprite test run <test-id> --dry-run --output json
testsprite test create --plan-from plan.json --dry-run --output json
```

## Exit-code quick reference

| Code | Meaning                                           |
| ---- | ------------------------------------------------- |
| 0    | Success (passed)                                  |
| 1    | Failed / blocked / cancelled                      |
| 3    | Auth error                                        |
| 4    | Not found                                         |
| 5    | Validation error                                  |
| 6    | Conflict (already running)                        |
| 7    | Timeout — resume: `testsprite test wait <run-id>` |
| 11   | Rate limited (retriable)                          |
| 12   | Insufficient credits                              |

## Bootstrap (first-time setup)

```bash
npm install -g @testsprite/testsprite-cli
testsprite setup         # configure + verify + install agent skill in one shot
```

Verify your setup anytime: `testsprite auth status`.
<!-- END TESTSPRITE AGENT SECTION -->

---

# Atrium 3D — Saray Ajanı Yönergeleri (Saray Ajanı Guidelines)

Bu projede yapılacak her geliştirme ve hata çözümü, **Saray Ajanı** (Agent League) sistemindeki uzman ajanların sorumluluğu ve kuralları altında yürütülür.

## 🛠️ Temel Kurallar ve Çağırma Yapısı

1. **Saray Ajanı Tetikleme Komutları:**
   Kullanıcı aşağıdaki şablonlardan biriyle talimat verdiğinde sistem otomatik olarak Agent League iş akışını tetikler:
   * **“Saray Ajanı ile şunu yap: [görev]”**
   * **“Saray Ajanı başlat. Görev: [görev]”**
   
   Bu tetikleyicilerle birlikte ana ajan (Antigravity), görevi otomatik olarak uzmanlık alanlarına göre alt subagent'lara böler ve koordine eder.

2. **Alt Ajan Rollerine Saygı:**
   * **Orchestrator Agent:** Görev paylaşımı, subagent koordinasyonu ve nihai entegrasyon kararlarından sorumludur.
   * **Product Agent:** Kapsam, MVP sınırları ve test edilebilir Kabul Kriterleri (Acceptance Criteria) hazırlar.
   * **Architecture Agent:** Dosya yapısı, modülerlik ve sürdürülebilirlikten sorumludur.
   * **UI/UX Agent:** 3D uzamsal deneyim ve glassmorphism temasına uyumluluğu denetler.
   * **Implementation Agent:** Sadece geliştirme yapıp değiştirdiği dosyaları raporlar, varsayımlarını açıkça yazar.
   * **QA/Test Agent:** Kabul kriterlerine göre test senaryoları yazar ve doğrular.
   * **Judge/Audit Agent:** Hataların kaynağını adil ve kanıta dayalı olarak belirler, puanları günceller.

3. **Dosya Tabanlı Takip:**
   * Skorlar `agent-system/scoreboard.json` içinde tutulur.
   * Hatalar `agent-system/bug-log.md` dosyasına kaydedilir.
   * Görevler `agent-system/task-log.md` dosyasında loglanır.
   * Her döngü sonu final raporu `agent-system/final-report.md` dosyasına yazılır.

4. **Puanlama ve İtirazlar:**
   * Her ajan 100 puan ile başlar.
   * Puanlar sadece **Judge Agent** tarafından ve somut teknik kanıtlara dayanılarak güncellenebilir.
   * Ajanlar birbirinin kodunu ve puanını doğrudan değiştiremez.
   * Hatalı veya kanıtsız suçlamada bulunan ajanın puanı düşürülür.
   * TestSprite E2E test kanıtı sunmak veya erken hata düzeltmek ek puan kazandırır.
