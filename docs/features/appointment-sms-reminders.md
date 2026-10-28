# Approved appointment SMS reminders

## Agreed behavior

- Send a separate reminder at **10:00 Asia/Tehran on the calendar day before the appointment**.
- Only approved (`scheduled`) appointments qualify, including bookings entered directly by staff.
- Approval/rejection SMS text, patterns, timing, endpoints, and responses remain unchanged.
- Approval after the cutoff is skipped, including approval during the remainder of the 10:00 minute.
- Save failed attempts and their error; **never retry automatically**.
- Repeated worker runs and multiple workers must not send the same reminder twice.
- Dates in SMS use Jalali `YYYY/MM/DD`; times use 24-hour `HH:MM`, matching existing appointment SMS.

## Separate PanelChi pattern

Create a **new** pattern in PanelChi and set its identifier in
`PANELCHI_PATTERN_APPOINTMENT_REMINDER`. Its variables are exactly
`full_name`, `date`, and `time`:

```text
%full_name% عزیز 🌸
یادآوری نوبت شما در کلینیک دکتر معشوری
تاریخ: %date%
ساعت: %time%
منتظر حضور شما هستیم.
```

The existing `PANELCHI_PATTERN_APPOINTMENT_APPROVED` and
`PANELCHI_PATTERN_APPOINTMENT_REJECTED` settings are not changed. Provider
credentials and sender are reused from the shared PanelChi client. As with
existing appointment SMS, an empty patient name uses `مراجع کننده`.

## Implementation and records

The existing Django app `apps.appointments` owns the reminder model, migrations,
management command, and read-only Django admin. Reminder-specific scheduling,
delivery, signals, admin, and tests live in dedicated modules under
`apps.appointments.reminders`. No extra Django app is registered. There are no
new REST endpoints or frontend changes.

An appointment `post_save` receiver schedules a record when the appointment is
approved. This covers dedicated approval, admin PATCH/PUT, Django admin, and
staff bookings without changing the existing decision-notification functions.
Cancellation invalidates pending reminders. Rescheduling invalidates the old
slot and evaluates the new slot against its own cutoff. Persisted fields are
read after `save(update_fields=...)` so unrelated unsaved attributes cannot
change eligibility. New write paths must use model saves; bulk ORM updates do
not emit Django save signals.

`AppointmentReminder` stores the appointment, date/time snapshot, absolute
scheduled time, status, attempt timestamp, and error. A database unique
constraint covers `(appointment, appointment_date, appointment_time)`.
`attempted_at` is null before an attempt; `error_message` is empty unless there
is a failure or a reason for skipping. The record is removed if its appointment
is deleted, following the appointment's lifecycle.

| Status | Meaning |
|---|---|
| `pending` | Approved before the cutoff; not attempted yet |
| `processing` | Attempt durably claimed; final delivery outcome may be unknown |
| `sent` | Accepted by PanelChi; does not assert handset delivery |
| `failed` | Failure recorded; no automatic retry |
| `skipped` | Late approval, cancelled/rescheduled appointment, missed schedule, or console mode |

The worker polls every 15 seconds and starts the daily batch during the 10:00
Tehran minute. It uses an explicit `ZoneInfo("Asia/Tehran")`, independent of the
server or Django timezone. Missed batches are skipped rather than sent later.
Each pending record is locked, its current appointment is checked, and
`processing` is committed **before** the provider call. Concurrent workers and
restarts cannot reclaim it. If a process stops after claiming an attempt, the
record stays `processing` with an unknown outcome and is not automatically
retried. This favors preventing duplicates over attempting uncertain sends.

The appointments migrations `0006_appointmentreminder` and
`0007_seed_existing_reminders` create reminder records and schedule already-approved
future bookings without sending any messages. Existing bookings whose cutoff has
passed are skipped.

Staff with Django admin view permission can inspect reminder status and saved
errors under **Appointment reminders**. The admin is read-only: no resend action,
record deletion, or status reset is exposed.

## Activation

1. The separate PanelChi reminder pattern identifier is `k8zqo`. Ensure it is
   approved and uses the `full_name`, `date`, and `time` variables above.
2. Set `PANELCHI_PATTERN_APPOINTMENT_REMINDER=k8zqo` in the deployment
   environment, alongside the existing `SMS_PROVIDER=panelchi` configuration.
3. Build the updated application, apply migrations, and start the worker:

   ```sh
   docker compose build backend appointment-reminders
   docker compose stop backend appointment-reminders
   docker compose run --rm backend python manage.py migrate
   docker compose up -d backend appointment-reminders
   ```

   Restarting both processes is necessary so all appointment writes register
   reminder schedules. Stop older backend instances during the rollout to avoid
   writes from code that does not yet register reminders.

The Compose service restarts automatically. It refuses to start while migrations
are unapplied. For deployments without Compose, supervise
`python manage.py run_appointment_reminders` as a separate persistent process.
`--once` checks the schedule once and exits; it never forces an out-of-schedule
send. `SMS_PROVIDER=console` never contacts PanelChi and never records a successful
send. Configure the pattern before enabling the live worker: a missing pattern
is a saved failure, not a retryable job.

## Verification

Run the reminder tests with the existing backend suites using explicit modules
(the repository's `apps` directory is a namespace package):

```sh
python manage.py test \
  apps.appointments.reminders.tests.test_reminders \
  apps.appointments.reminders.tests.test_worker \
  apps.appointments.reminders.tests.test_backfill \
  apps.users.tests apps.articles.tests
```

Tests mock SMS calls and cover Tehran timing with UTC input, approved-only
eligibility, late approvals, staff bookings, cancellation/rescheduling, saved
failures without retries, duplicate prevention, process interruption, concurrent
PostgreSQL workers, console mode, and unchanged decision SMS/API fields.
