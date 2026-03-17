# Zuhal LMS — TODO

## ✅ Completed
- [x] Project scaffold (Next.js 15, Prisma, tRPC, Docker)
- [x] GitHub repo: https://github.com/yhsclaw/zuhal-lms
- [x] Docker Compose (app + PostgreSQL + Nginx)
- [x] Auth (APP_PASSWORD plain text login)
- [x] Schedule list — import / manual entry / delete schedule
- [x] Manual entry page — date-first flow, auto-format time input, per-row save
- [x] Schedule detail — inline edit/delete lessons, add new lesson, attendance toggle
- [x] D52 chapter seed (52 chapters)
- [x] Students page — add / inline edit / delete
- [x] Lesson detail — absent toggle, duration, trial, practices, PDF attacher

## 🐛 Bugs
- [ ] Lesson detail — Practices Done This Session: Save butonu yok, değişiklikler kaydedilmiyor
- [ ] Lesson detail — D52 bölüm listesi soldan sağa değil yukarıdan aşağıya sıralanmalı

## 🚧 In Progress
- [ ] Test: manual entry timezone fix
- [ ] Test: students edit/delete
- [ ] Lessons detail: edit (startTime, student name?)

## 📋 Backlog
- [ ] Ders süresi seçimine 15 dakika ekle (trial dersler için)
- [ ] Students liste sayfasında her öğrencinin yanında en son işlenen D52 bölümünü göster
- [ ] Lesson detail — clarify what "edit" means (startTime? student?)
- [ ] Monthly report page
- [ ] OCR / photo import flow
- [ ] PDF exercise library
- [ ] D52 chapter tracking in lesson detail
- [ ] Nginx domain (musiclms.yhs) — hosts file setup on all devices
- [ ] VPN access setup
- [ ] Auto-deploy on git push (webhook or scheduled pull)
