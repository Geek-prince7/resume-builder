# Job search CRM and safe automation

The application treats the job URL as optional. A source link is useful for returning to the original posting, but postings expire, some applications arrive by email or referral, and users may only have copied text. Company, role, and job description can therefore remain useful without a URL.

## What is automated

- Every job keeps its application stage, applied date, next action, original URL, generated resumes, and cover letters.
- Referral contacts can be linked to a tracked job.
- Adding a contact prepares four editable drafts: connection note, welcome note, referral request, and one follow-up.
- Marking a request as sent schedules a follow-up seven days later.
- Dashboard counters show application activity, interviews, offers, and overdue referral follow-ups.

Messages are intentionally copied and sent by the user. This preserves authenticity, allows a final factual review, and avoids accidentally sending repeated or inappropriate outreach.

## What not to automate

Do not build a LinkedIn scraper, browser extension, Selenium/Playwright bot, cookie-based script, or automatic connection/message sender. LinkedIn states that third-party software may not scrape profiles or automate invitations/messages, and accounts using it may be restricted or closed:

- https://www.linkedin.com/help/linkedin/answer/a1341387/prohibited-software-and-extensions
- https://www.linkedin.com/help/linkedin/answer/a1340567/automated-activity-on-linkedin

LinkedIn's official Invitations API can send invitations, but access is restricted to approved partners. Only add direct sending after receiving that approval and completing OAuth/API compliance:

- https://learn.microsoft.com/en-us/linkedin/shared/integrations/communications/invitations

## Safe next automation steps

1. Add email/calendar reminders through user-authorized Google or Microsoft OAuth.
2. Send a daily digest containing due applications and referral follow-ups.
3. Add a browser share/bookmark action that opens this app with the current job URL prefilled; the user still pastes the JD and submits it.
4. Generate drafts with AI using only the user's profile, job record, and manually entered contact context.
5. Track response and conversion rates by message type, without collecting private profile data.
