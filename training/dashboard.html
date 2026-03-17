<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>BSA Student Dashboard</title>
  <link rel="stylesheet" href="css/portal.css" />
  <style>
    * { box-sizing: border-box; }

    body {
      margin: 0;
      font-family: Arial, Helvetica, sans-serif;
      background:
        radial-gradient(circle at top, rgba(245,158,11,0.18), transparent 35%),
        linear-gradient(180deg, #0b1220 0%, #111827 100%);
      color: #fff;
      min-height: 100vh;
    }

    .topbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 14px;
      padding: 18px 22px;
      border-bottom: 1px solid rgba(255,255,255,0.08);
      background: rgba(15,23,42,0.88);
      backdrop-filter: blur(8px);
      position: sticky;
      top: 0;
      z-index: 50;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 14px;
    }

    .brand img {
      width: 54px;
      height: 54px;
      object-fit: contain;
      border-radius: 10px;
      background: rgba(255,255,255,0.06);
      padding: 4px;
    }

    .brand h1 {
      margin: 0;
      font-size: 1.25rem;
    }

    .brand p {
      margin: 4px 0 0;
      color: #cbd5e1;
      font-size: 0.92rem;
    }

    .topbar-actions {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }

    .btn {
      border: none;
      border-radius: 12px;
      padding: 11px 15px;
      font-weight: 700;
      cursor: pointer;
      transition: 0.15s ease;
    }

    .btn:hover {
      transform: translateY(-1px);
    }

    .btn-primary {
      background: #f59e0b;
      color: #111827;
    }

    .btn-dark {
      background: #334155;
      color: #fff;
    }

    .wrap {
      max-width: 1280px;
      margin: 0 auto;
      padding: 24px;
    }

    .hero {
      display: grid;
      grid-template-columns: 1.2fr 0.8fr;
      gap: 20px;
      margin-bottom: 22px;
    }

    @media (max-width: 980px) {
      .hero {
        grid-template-columns: 1fr;
      }
    }

    .card {
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 22px;
      padding: 22px;
      box-shadow: 0 16px 40px rgba(0,0,0,0.22);
    }

    .hero-card h2 {
      margin: 0 0 10px;
      font-size: 1.45rem;
    }

    .hero-card p {
      margin: 0;
      color: #dbe4f0;
      line-height: 1.55;
    }

    .student-meta {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 14px;
      margin-top: 18px;
    }

    @media (max-width: 620px) {
      .student-meta {
        grid-template-columns: 1fr;
      }
    }

    .meta-box {
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.07);
      border-radius: 16px;
      padding: 14px;
    }

    .meta-label {
      color: #cbd5e1;
      font-size: 0.88rem;
      margin-bottom: 6px;
    }

    .meta-value {
      font-size: 1.08rem;
      font-weight: 700;
      word-break: break-word;
    }

    .progress-shell {
      display: flex;
      flex-direction: column;
      gap: 12px;
      justify-content: center;
      height: 100%;
    }

    .progress-title {
      margin: 0;
      font-size: 1.1rem;
    }

    .progress-sub {
      margin: 0;
      color: #cbd5e1;
      font-size: 0.94rem;
    }

    .progress-bar {
      width: 100%;
      height: 18px;
      border-radius: 999px;
      background: rgba(255,255,255,0.08);
      overflow: hidden;
      border: 1px solid rgba(255,255,255,0.08);
    }

    .progress-fill {
      height: 100%;
      width: 0%;
      background: linear-gradient(90deg, #f59e0b, #fbbf24);
      border-radius: 999px;
      transition: width 0.35s ease;
    }

    .progress-stats {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
    }

    .stat {
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.07);
      border-radius: 16px;
      padding: 14px;
      text-align: center;
    }

    .stat .label {
      color: #cbd5e1;
      font-size: 0.84rem;
      margin-bottom: 6px;
    }

    .stat .value {
      font-size: 1.2rem;
      font-weight: 800;
    }

    .section-title {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
      margin-bottom: 14px;
    }

    .section-title h2 {
      margin: 0;
      font-size: 1.18rem;
    }

    .section-title p {
      margin: 0;
      color: #cbd5e1;
      font-size: 0.92rem;
    }

    .lessons-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
    }

    @media (max-width: 920px) {
      .lessons-grid {
        grid-template-columns: 1fr;
      }
    }

    .lesson-card {
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 18px;
      padding: 18px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .lesson-top {
      display: flex;
      justify-content: space-between;
      align-items: start;
      gap: 12px;
    }

    .lesson-title {
      margin: 0;
      font-size: 1.05rem;
    }

    .lesson-desc {
      margin: 0;
      color: #dbe4f0;
      line-height: 1.5;
      font-size: 0.93rem;
    }

    .pill {
      display: inline-block;
      padding: 5px 10px;
      border-radius: 999px;
      font-size: 0.8rem;
      font-weight: 800;
      letter-spacing: 0.02em;
      white-space: nowrap;
    }

    .pill.active { background: rgba(21,128,61,0.25); color: #bbf7d0; }
    .pill.locked { background: rgba(148,163,184,0.18); color: #e2e8f0; }
    .pill.completed { background: rgba(59,130,246,0.22); color: #bfdbfe; }
    .pill.expired { background: rgba(185,28,28,0.2); color: #fecaca; }

    .lesson-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      color: #cbd5e1;
      font-size: 0.84rem;
    }

    .lesson-actions {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      margin-top: auto;
    }

    .lesson-actions a,
    .lesson-actions button {
      text-decoration: none;
      border: none;
      border-radius: 12px;
      padding: 11px 14px;
      font-weight: 700;
      cursor: pointer;
      font-size: 0.92rem;
    }

    .lesson-actions .go-btn {
      background: #f59e0b;
      color: #111827;
    }

    .lesson-actions .secondary-btn {
      background: #334155;
      color: #fff;
    }

    .notice {
      margin-top: 18px;
      padding: 14px 16px;
      border-radius: 14px;
      background: rgba(245,158,11,0.12);
      border: 1px solid rgba(245,158,11,0.24);
      color: #fde68a;
      font-size: 0.93rem;
    }

    .footer-box {
      margin-top: 22px;
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
    }

    @media (max-width: 900px) {
      .footer-box {
        grid-template-columns: 1fr;
      }
    }

    .small-muted {
      color: #cbd5e1;
      font-size: 0.9rem;
      line-height: 1.5;
    }

    .error-screen {
      max-width: 640px;
      margin: 80px auto;
      padding: 24px;
    }

    .hidden {
      display: none !important;
    }
  </style>
</head>
<body>
  <div id="loadingView" class="error-screen">
    <div class="card">
      <h2>Loading your training dashboard...</h2>
      <p class="small-muted">Please wait while we verify your access and load your training record.</p>
    </div>
  </div>

  <div id="errorView" class="error-screen hidden">
    <div class="card">
      <h2 id="errorTitle">Unable to load dashboard</h2>
      <p id="errorText" class="small-muted"></p>
      <div style="margin-top:16px;">
        <button id="backToLoginBtn" class="btn btn-primary">Back to Login</button>
      </div>
    </div>
  </div>

  <div id="dashboardView" class="hidden">
    <div class="topbar">
      <div class="brand">
        <img src="images/bsa-logo.png" alt="BSA Logo" />
        <div>
          <h1>Broussard Shooting Academy</h1>
          <p>Student Training Dashboard</p>
        </div>
      </div>

      <div class="topbar-actions">
        <button class="btn btn-dark" id="refreshDashboardBtn">Refresh</button>
        <button class="btn btn-primary" id="logoutBtn">Logout</button>
      </div>
    </div>

    <div class="wrap">
      <div class="hero">
        <div class="card hero-card">
          <h2 id="welcomeTitle">Welcome</h2>
          <p id="welcomeText">
            Review your progress, continue your lessons, and make sure each section is completed before class.
          </p>

          <div class="student-meta">
            <div class="meta-box">
              <div class="meta-label">Student Name</div>
              <div class="meta-value" id="studentNameValue">—</div>
            </div>

            <div class="meta-box">
              <div class="meta-label">Access Code</div>
              <div class="meta-value" id="accessCodeValue">—</div>
            </div>

            <div class="meta-box">
              <div class="meta-label">Tier</div>
              <div class="meta-value" id="tierValue">—</div>
            </div>

            <div class="meta-box">
              <div class="meta-label">Portal Status</div>
              <div class="meta-value" id="statusValue">—</div>
            </div>
          </div>

          <div class="notice" id="dashboardNotice">
            Complete your lessons in order. Locked lessons will open as your training progresses.
          </div>
        </div>

        <div class="card">
          <div class="progress-shell">
            <h3 class="progress-title">Course Progress</h3>
            <p class="progress-sub" id="progressLabelText">Progress is being calculated...</p>

            <div class="progress-bar">
              <div class="progress-fill" id="progressFill"></div>
            </div>

            <div class="progress-stats">
              <div class="stat">
                <div class="label">Lessons Done</div>
                <div class="value" id="completedCountValue">0</div>
              </div>
              <div class="stat">
                <div class="label">Lessons Total</div>
                <div class="value" id="totalLessonsValue">8</div>
              </div>
              <div class="stat">
                <div class="label">Completion</div>
                <div class="value" id="completionPercentValue">0%</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="section-title">
          <div>
            <h2>Your Lessons</h2>
            <p>Continue from the first incomplete lesson. Completed lessons remain available for review.</p>
          </div>
        </div>

        <div class="lessons-grid" id="lessonsGrid"></div>
      </div>

      <div class="footer-box">
        <div class="card">
          <h2 style="margin-top:0;">Training Reminder</h2>
          <p class="small-muted">
            This online portal is your prerequisite training area. Review each lesson carefully, complete quizzes honestly,
            and bring questions to class. Your in-person training and range qualification still matter.
          </p>
        </div>

        <div class="card">
          <h2 style="margin-top:0;">Need Help?</h2>
          <p class="small-muted">
            If your code stops working, your lesson appears locked by mistake, or your dashboard does not show the correct
            progress, contact Broussard Shooting Academy so your record can be checked and corrected.
          </p>
        </div>
      </div>
    </div>
  </div>

  <script type="module" src="js/student-dashboard.js"></script>
</body>
</html>
