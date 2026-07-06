# PRD: Job Tracker with Analytics

## 1. Problem

Tracking job applications in a spreadsheet makes it hard to spot patterns (which sources get responses) and easy to miss follow-ups.

## 2. Goals

- Single source of truth for all applications
- Never miss a follow-up
- See job search as data (best sources, resume versions)
- Track interview prep per company
- Get friends to adopt it and give feedback

## 3. Non-Goals

- Auto-import from job boards (browser extension/bookmarklet)
- Push notifications (email/SMS reminders)
- Shared/collaborative views between users
- Resume builder or scoring
- In-app job search / auto-apply

## 4. Users

Multi-user. Each user's data is private — no sharing between accounts. Initial users: me + a few friends.

## 5. Features (v1)

1. **Auth** — signup/login, private per-user data
2. **Applications CRUD** — company, role, resume version, source, applied date, status
3. **Interview rounds** — type, date, outcome, notes (linked to an application)
4. **Prep tracking** — status per application (not started / in progress / done)
5. **To-do list** — simple task tracker (add, edit, done, delete)
6. **Analytics dashboard** — applications over time, status funnel, response rate by source
7. **Feedback mechanism** — lightweight way for friends to send feedback

## 6. Data Model

```
users            id, email, password_hash, created_at
resumes          id, user_id, resume_filename, resume_url, created_at
applications     id, user_id→users, company, role, resume_version,
                 source, applied_date, status, prep_status, notes
interview_rounds id, application_id→applications, round_type, date, outcome, notes
tasks            id, user_id→users, title, category, is_done, created_date
```

## 7. Tech Stack

| Layer    | Choice                               | Why                                             |
| -------- | ------------------------------------ | ----------------------------------------------- |
| Frontend | React + Vite                         | fast dev, fits dashboard/forms                  |
| Backend  | Node + Express                       | JS across the stack                             |
| Database | PostgreSQL (NeonDB)                  | relational fit + SQL aggregations for analytics |
| Auth     | JWT                                  | stateless, standard practice                    |
| Other    | Recharts + hand-rolled SVG, Tailwind | mix of standard + custom viz practice           |

## 8. Success Metrics

- I use it instead of a spreadsheet for a month
- 2–3 friends use it for a week and give feedback
- Dashboard surfaces at least one real insight
- Deployed and usable via a live link

## 9. Open Questions

- Prep status: per-application, or a separate general tracker?
- Feedback: in-app form, or just a WhatsApp group for v1?
- Data isolation: must test that users can't see each other's data
- Will friends actually use it consistently?
- Confirm Supabase/hosting free-tier limits are enough
