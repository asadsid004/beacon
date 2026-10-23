// Article URLs checked on 2026-10-23. Commentary below is fictional demo content.
export const articles = [
  [
    "Building effective agents",
    "ai",
    "https://www.anthropic.com/research/building-effective-agents",
  ],
  [
    "The think tool for complex tool use",
    "ai",
    "https://www.anthropic.com/research/claude-think-tool",
  ],
  [
    "How Anthropic built its multi-agent research system",
    "ai",
    "https://www.anthropic.com/research/multi-agent-research-system",
  ],
  [
    "Contextual retrieval for AI applications",
    "ai",
    "https://www.anthropic.com/research/contextual-retrieval",
  ],
  [
    "Effective context engineering for AI agents",
    "ai",
    "https://www.anthropic.com/research/effective-context-engineering-for-ai-agents",
  ],
  [
    "Open sourcing Pingora",
    "rust",
    "https://blog.cloudflare.com/pingora-open-source/",
  ],
  [
    "How Cloudflare built Pingora",
    "infrastructure",
    "https://blog.cloudflare.com/how-we-built-pingora-the-proxy-that-connects-cloudflare-to-the-internet/",
  ],
  [
    "When TCP sockets refuse to die",
    "networking",
    "https://blog.cloudflare.com/when-tcp-sockets-refuse-to-die/",
  ],
  [
    "The problem with event loops",
    "performance",
    "https://blog.cloudflare.com/the-problem-with-event-loops/",
  ],
  [
    "Designing robust APIs with idempotency",
    "api-design",
    "https://stripe.com/blog/idempotency",
  ],
  [
    "Online migrations at scale",
    "databases",
    "https://stripe.com/blog/online-migrations",
  ],
  [
    "Stripe's payments APIs: the first 10 years",
    "api-design",
    "https://stripe.dev/blog/payment-api-design",
  ],
  [
    "How Discord stores trillions of messages",
    "databases",
    "https://discord.com/blog/how-discord-stores-trillions-of-messages",
  ],
  [
    "Why Discord switched from Go to Rust",
    "rust",
    "https://discord.com/blog/why-discord-is-switching-from-go-to-rust",
  ],
  [
    "How Discord indexes trillions of messages",
    "search",
    "https://discord.com/blog/how-discord-indexes-trillions-of-messages",
  ],
  [
    "Scaling Slack's job queue",
    "distributed-systems",
    "https://slack.engineering/scaling-slacks-job-queue/",
  ],
  [
    "Migrating millions of concurrent WebSockets to Envoy",
    "networking",
    "https://slack.engineering/migrating-millions-of-concurrent-websockets-to-envoy/",
  ],
  [
    "Designing Schemaless: Uber's MySQL datastore",
    "databases",
    "https://www.uber.com/blog/schemaless-part-one-mysql-datastore/",
  ],
  [
    "Monitoring distributed systems",
    "observability",
    "https://sre.google/sre-book/monitoring-distributed-systems/",
  ],
  [
    "Handling overload",
    "reliability",
    "https://sre.google/sre-book/handling-overload/",
  ],
  [
    "Timeouts, retries, and backoff with jitter",
    "reliability",
    "https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/",
  ],
  [
    "Avoiding fallback in distributed systems",
    "distributed-systems",
    "https://aws.amazon.com/builders-library/avoiding-fallback-in-distributed-systems/",
  ],
] as const;

export const discussions = [
  [
    "What belongs in an agent evaluation suite?",
    "ai",
    "We have tests for tool selection and final answers, but failures often happen between those steps.\n\nHow do you test recovery after a tool times out? I would like examples of evaluations that caught a regression before deployment.",
  ],
  [
    "When did your team outgrow a single Postgres instance?",
    "databases",
    "Connection pooling and query indexes have taken us further than expected.\n\nWhat was the first limit you could not fix with a simpler query or more memory? Please include workload size if you can.",
  ],
  [
    "How do you keep retry budgets from multiplying?",
    "reliability",
    "Our client, gateway, and worker each retry independently. A short outage can produce a long backlog.\n\nDo you assign one layer ownership of retries, or pass a deadline through every hop?",
  ],
  [
    "Show your smallest useful on-call dashboard",
    "observability",
    "I am trying to replace a wall of charts with something we can actually use at 3 a.m.\n\nWhich signals tell you whether customers are affected, and which ones help you narrow down the cause?",
  ],
  [
    "What do you measure before rewriting a service in Rust?",
    "rust",
    "A rewrite proposal needs more than a CPU benchmark.\n\nI would compare tail latency, peak memory, deployment time, and the cost of maintaining the old service during migration. What am I missing?",
  ],
  [
    "How much context should a coding agent keep?",
    "ai",
    "Keeping every tool response makes the history expensive and hard to inspect. Summarizing too early loses details needed for the next edit.\n\nWhat do you keep verbatim, and what do you retrieve again?",
  ],
  [
    "Cursor pagination when the sort order keeps changing",
    "api-design",
    "A feed sorted by score can move items between requests. A timestamp cursor is easy for the new feed, but does not solve the hot feed.\n\nDo you accept occasional repeats, snapshot the ranking, or use another approach?",
  ],
  [
    "A checklist for an online schema migration",
    "databases",
    "Here is the sequence I start with:\n\n1. Add the new nullable column.\n2. Deploy dual writes.\n3. Backfill in bounded batches.\n4. Compare old and new reads.\n5. Switch readers and remove the old path later.\n\nWhich step has caused the most trouble for your team?",
  ],
  [
    "Should background jobs share the API connection pool?",
    "infrastructure",
    "A backfill can starve interactive requests even when database CPU is low.\n\nSeparate pools help, but their total still needs to fit the database connection budget. How do you enforce that across replicas?",
  ],
  [
    "What is your policy for high-cardinality trace attributes?",
    "observability",
    "Request IDs are useful in traces and expensive as metric labels. The boundary gets blurry when teams build dashboards from trace data.\n\nWhere do you set limits, and how do you show developers what was dropped?",
  ],
  [
    "Testing what happens when DNS fails",
    "networking",
    "Most fault injection tests I see add latency or return HTTP errors. DNS failures and stale connections seem harder to reproduce.\n\nHow do you exercise these paths without breaking unrelated developer traffic?",
  ],
  [
    "Do you keep search indexing synchronous?",
    "search",
    "An asynchronous index makes writes cheaper, but the author expects a new post to appear immediately.\n\nDo you show recent writes from the primary database, expose indexing status, or accept a short delay?",
  ],
  [
    "The deploy succeeded, but the queue stopped moving",
    "distributed-systems",
    "A worker can pass its health check while doing no useful work.\n\nI want an alert on the age of the oldest eligible job, with separate signals for delayed and running jobs. What else should a worker health check include?",
  ],
  [
    "What should an error response say about retrying?",
    "api-design",
    "A generic 500 response leaves callers guessing whether a write happened.\n\nWould you include an operation ID, a retry-after value, or a link to check operation status? I am interested in patterns that work across SDKs.",
  ],
  [
    "How do you benchmark a cache with a realistic key distribution?",
    "performance",
    "Uniform random keys make our cache look much worse than production. A tiny fixed key set makes it look much better.\n\nHow do you capture hot keys and churn without copying private request data?",
  ],
  [
    "One service or several workers for a small team?",
    "infrastructure",
    "We have three engineers and a workload with a few slow tasks. Moving those tasks into workers seems useful; splitting every domain into a service seems expensive.\n\nWhich boundary paid for itself first?",
  ],
  [
    "Where should load shedding happen?",
    "reliability",
    "Rejecting work at the edge saves resources, but the edge does not always know which dependency is saturated.\n\nDo you use queue depth, concurrency limits, deadlines, or a combination?",
  ],
  [
    "What belongs in a runbook besides commands?",
    "reliability",
    "A command without its expected output can make an incident worse.\n\nI would like each step to say what it checks, what a normal result looks like, and when to stop. What makes a runbook useful to someone outside the owning team?",
  ],
] as const;

export const members = [
  ["Maya Chen", "mayac"],
  ["Arjun Rao", "arjunrao"],
  ["Sofia Martins", "sofiam"],
  ["Noah Brooks", "noahb"],
  ["Aisha Khan", "aishak"],
  ["Leo Fischer", "leof"],
  ["Priya Shah", "priyashah"],
  ["Daniel Park", "dpark"],
  ["Amara Okafor", "amarao"],
  ["Oliver Reed", "oreed"],
  ["Yuki Tanaka", "yukit"],
  ["Elena Rossi", "elenar"],
  ["Sam Rivera", "samrivera"],
  ["Fatima Ali", "fatimaa"],
  ["Lucas Silva", "lucass"],
  ["Nora Berg", "norab"],
  ["Rohan Mehta", "rohanm"],
  ["Chloe Laurent", "chloel"],
  ["Mateo Garcia", "mateog"],
  ["Zoe Walker", "zoew"],
  ["Ibrahim Hassan", "ibrahimh"],
  ["Hana Kim", "hanak"],
  ["Ethan Cole", "ethanc"],
  ["Anika Bose", "anikab"],
  ["Felix Weber", "felixw"],
  ["Leila Haddad", "leilah"],
  ["Oscar Nguyen", "oscarng"],
  ["Mila Novak", "milan"],
  ["Kai Anderson", "kaianderson"],
  ["Sara Ahmed", "saraa"],
  ["Theo Wilson", "theow"],
  ["Ines Costa", "inesc"],
  ["Dev Patel", "devpatel"],
  ["Lena Hoffmann", "lenah"],
  ["Adam Wright", "adamw"],
  ["Nia Williams", "niaw"],
  ["Owen Murphy", "owenm"],
  ["Tara Singh", "taras"],
  ["Ben Carter", "benc"],
] as const;

export const conversations = {
  general: [
    "What would make you choose a simpler implementation for a smaller workload?",
    "I would like to see the resource limits used for the comparison. Defaults can change the result quite a bit.",
    "How would you roll this out to a small group of users before enabling it everywhere?",
    "The operational cost is easy to miss. Who owns debugging this when it fails outside working hours?",
    "Could the same approach work across regions, or does it depend on keeping everything close together?",
    "Would you keep a fallback path during rollout? I would want a clear condition for switching back.",
  ],
  ai: [
    "How do you distinguish a model failure from a tool failure in the evaluation results?",
    "I would keep the raw tool response in a separate log and pass only the fields needed for the next decision.",
    "A fixed set of tasks is useful, but it can hide regressions on longer runs.",
    "Cost per completed task seems more useful here than cost per token.",
    "I would start with a workflow that has explicit steps before giving the model control of the whole loop.",
  ],
  systems: [
    "What happens when the downstream service takes longer than the caller's deadline?",
    "A bounded queue helps only if producers have a clear response when it fills up.",
    "I would test recovery as well as failure. Draining the backlog can be harder than handling the initial outage.",
    "The rollback path deserves the same attention as the migration itself.",
    "Is there a way to limit this per tenant so one busy customer cannot consume the whole budget?",
  ],
  data: [
    "How would this behave with a few very large tenants and many small ones?",
    "I would compare the query plan before changing the storage model.",
    "The interesting part is keeping old and new readers working during the backfill.",
    "Does the index update need to be atomic with the write, or can the UI tolerate a short delay?",
    "A replica helps read throughput, but I would still measure how far it falls behind during bursts.",
  ],
  operations: [
    "What signal would tell the on-call engineer that customers are affected?",
    "I would add a deadline to the test so a stalled connection cannot hang it indefinitely.",
    "A percentile alone can hide a small group of users having a consistently bad experience.",
    "It would help to see the behavior under sustained load rather than a short spike.",
    "The runbook should include the expected output and a point where the operator stops and escalates.",
  ],
} as const;

export const replies = [
  "That is worth testing separately. I would add a case where the dependency recovers while the backlog is still growing.",
  "Agreed about measuring this first. Comparing the same workload before and after would make the tradeoff easier to judge.",
  "I would keep that limit configurable and record how often it is reached. A fixed value can become stale as traffic changes.",
  "The failure mode matters here. Returning an explicit error seems easier for callers to handle than silently serving an incomplete result.",
  "Good point. I would include that condition in the rollout checklist and verify it before increasing traffic.",
] as const;
