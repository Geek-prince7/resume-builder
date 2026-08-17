const counters = { requests: 0, errors: 0, aiRequests: 0, aiFailures: 0 };
const timings = { requestDurationMs: 0 };
function recordRequest(duration, status) { counters.requests += 1; timings.requestDurationMs += duration; if (status >= 500) counters.errors += 1; }
function snapshot() { return { counters, averages: { requestDurationMs: counters.requests ? Math.round((timings.requestDurationMs / counters.requests) * 100) / 100 : 0 }, uptimeSeconds: Math.round(process.uptime()) }; }
module.exports = { counters, recordRequest, snapshot };
