# Job discovery configuration

The discovery engine imports published jobs from configured Greenhouse and Lever boards, stores each job once globally, and computes user-specific recommendations from profile preferences. It does not scrape LinkedIn or arbitrary websites.

## Configure sources

Set `DISCOVERY_SOURCES_JSON` in `backend/.env` to a JSON array. Each source is also stored as a reusable company record.

```env
DISCOVERY_SOURCES_JSON=[{"name":"Example Inc","slug":"example","source":"greenhouse","country":"US","companyType":"startup_growth","industries":["software"],"careersUrl":"https://example.com/careers"}]
```

- Greenhouse `slug` is the board token in `boards.greenhouse.io/<slug>`.
- Lever `slug` is the site name in `jobs.lever.co/<slug>`.
- `country` uses an ISO 3166-1 alpha-2 code such as `US`, `ES`, or `DE`.
- Company types: `startup_early`, `startup_growth`, `small`, `mid_market`, `enterprise`, `public_company`, `agency_consulting`, `nonprofit`.

`DISCOVERY_INTERVAL_MS` defaults to six hours. BullMQ uses Redis to run one shared import rather than scraping separately for every user. The worker marks postings inactive when they disappear from a configured board, then recalculates recommendations for profiles with target countries.

Manual discovery requests are deduplicated into five-minute windows so multiple users cannot create an external-request storm.

Users can edit target countries, roles, company types, work modes, relocation, sponsorship, score threshold, and digest frequency in Profile. The Opportunities page supports refreshing matches, saving a recommendation into the job tracker, and dismissing it.

Production source onboarding should be curated or fed by licensed APIs. Add source-level rate limits and terms metadata before introducing another provider.
