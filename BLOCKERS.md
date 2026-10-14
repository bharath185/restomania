# BLOCKERS.md — Mocks, Placeholders & Known Gaps

Items that required a paid credential, external service, or complex infra component — mocked or documented here.

| # | Blocker | Impact | Resolution in Phase 1 | Next Step |
|---|---|---|---|---|
| 1 | Razorpay live API keys | Payment processing with real money | Test keys used (`rzp_test_*`); `MockPaymentProvider` used in test suite | Replace with live keys before going live |
| 2 | SMTP production credentials | Production email delivery | MailHog used locally (catches all emails); Nodemailer config ready for SMTP swap | Set `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` in production `.env` |
| 3 | Custom domain SSL auto-provisioning | Each restaurant's `order.theirsite.com` needs a real SSL cert | Wildcard `*.platform.com` only; custom domain routing logic implemented but SSL cert provisioning is manual | Phase 2: integrate Let's Encrypt ACME (cert-manager on k8s or `acme.sh` on VPS) |
| 4 | SMS / WhatsApp notifications | Order updates via SMS | Skipped in Phase 1; email notifications fully implemented | Phase 2: integrate Twilio or MSG91 |
| 5 | FCM / APNs push notifications (mobile) | Background order alerts on mobile | Expo Push Service used (works without native keys in Expo Go); actual FCM credentials needed for standalone build | Add `EXPO_PUSH_TOKEN` handling + FCM server key for production |
| 6 | Production S3 bucket | Persistent image storage in production | MinIO used locally; S3 client is S3-compatible, just swap env vars | Set `S3_ENDPOINT`, `S3_ACCESS_KEY`, `S3_SECRET_KEY`, `S3_BUCKET` for AWS/Backblaze |
| 7 | Per-restaurant Razorpay keys | Each restaurant collects payments directly | Platform keys used; encrypted per-restaurant key storage schema is in DB | Phase 2: add encrypted key field + key selection logic in PaymentService |
| 8 | GST e-invoice (IRN generation) | Compliance for Indian GST e-invoicing | GST rate field stored and applied to invoice; IRN generation not implemented | Phase 2: integrate GSP API |
| 9 | Mobile app store listing | iOS App Store + Google Play submission | Expo project configured; `app.json` ready; submission not done | Run `eas build` + `eas submit` with Apple/Google developer accounts |
