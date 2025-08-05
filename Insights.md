# Logger use in express(morgan or winston)
- professional debugging setup tools instaed of console.log
- a dedicated tool for recording info bout your application as it runs.In an Express app, its primary job is to create a structured, useful record of every incoming request and any errors that occur.
# Morgan: The Simple HTTP Request Reporter
- to middleware to log details about incoming HTTP requests.
- add it as a piece of middleware to your Express app, and it automatically logs every request that comes in
  # different format or modes of morgan
  It gives colored status codes for quick visual feedback.
  - app.use(morgan('dev')) The 'dev' format is great for development.
  - morgan('tiny')       // minimal
  - morgan('combined')   // detailed (good for production logs)
  - morgan('common')     // standard Apache log format

- In short, Morgan tells you what happened, and Winston gives you the power to record it properly, route it anywhere, and analyze it automatically.

- It's often better to crash the process so that an orchestrator (like PM2, Docker, or Kubernetes) can restart it, rather than letting it run in a broken state.

--testTimeout=10000	Each test can take up to 10 seconds before being marked as failed.
--runInBand	Tests run one at a time, not in parallel — helps avoid DB/test issues.
"testEnvironment": "node"	Ensures Node.js environment for testing, not browser-based jsdom
