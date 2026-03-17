<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>BSA Admin Dashboard</title>
  <link rel="stylesheet" href="../css/portal.css" />
  <style>
    * { box-sizing: border-box; }

    body {
      margin: 0;
      font-family: Arial, Helvetica, sans-serif;
      background: #0b1220;
      color: #fff;
    }

    .hidden { display: none !important; }

    .screen {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }

    .card {
      width: 100%;
      max-width: 540px;
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 22px;
      padding: 24px;
      box-shadow: 0 16px 36px rgba(0,0,0,0.26);
    }

    .card h2 {
      margin-top: 0;
    }

    .field {
      margin-bottom: 14px;
    }

    .field label {
      display: block;
      margin-bottom: 6px;
      font-weight: 700;
      color: #e2e8f0;
    }

    .field input,
    .field select,
    .field textarea {
      width: 100%;
      padding: 12px;
      border-radius: 12px;
      border: 1px solid #475569;
      background: #111827;
      color: white;
      outline: none;
    }

    .field textarea {
      min-height: 90px;
      resize: vertical;
    }

    .field input:focus,
    .field select:focus,
    .field textarea:focus {
      border-color: #38bdf8;
      box-shadow: 0 0 0 3px rgba(56,189,248,0.18);
    }

    .actions {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      margin-top: 16px;
    }

    .btn {
      border: none;
      border-radius: 12px;
      padding: 11px 15px;
      font-weight: 800;
      cursor: pointer;
    }

    .btn-primary { background: #f59e0b; color: #111827; }
    .btn-dark { background: #334155; color: white; }
    .btn-danger { background: #b91c1c; color: white; }
    .btn-success { background: #15803d; color: white; }

    .message {
      margin-top: 12px;
      min-height: 22px;
      font-size: 0.94rem;
    }

    .message.error { color: #fecaca; }
    .message.success { color: #bbf7d0; }

    .app-shell {
      min-height: 100vh;
    }

    .topbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
      padding: 18px 22px;
      border-bottom: 1px solid rgba(255,255,255,0.08);
      background: #111827;
      position: sticky;
      top: 0;
      z-index: 50;
    }

    .topbar h1 {
      margin: 0;
      font-size: 1.2rem;
    }

    .topbar-actions {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }

    .wrap {
      max-width: 1360px;
      margin: 0 auto;
      padding: 24px;
    }

    .grid {
      display: grid;
      grid-template-columns: 400px 1fr;
      gap: 20px;
    }

    @media (max-width: 1020px) {
      .grid {
        grid-template-columns: 1fr;
      }
    }

    .panel {
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 22px;
      padding: 22px;
      box-shadow: 0 16px 36px rgba(0,0,0,0.22);
    }

    .panel h2 {
      margin-top: 0;
      margin-bottom: 16px;
      font-size: 1.1rem;
    }

    .toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
      margin-bottom: 14px;
    }

    .toolbar input {
      width: 360px;
      max-width: 100%;
      padding: 12px;
      border-radius: 12px;
      border: 1px solid #475569;
      background: #111827;
      color: white;
    }

    .table-wrap {
      overflow-x: auto;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      min-width: 1280px;
    }

    th, td {
      text-align: left;
      padding: 12px 10px;
      border-bottom: 1px solid rgba(255,255,255,0.07);
      vertical-align: top;
    }

    th {
      color: #cbd5e1;
      font-size: 0.9rem;
    }

    td {
      font-size: 0.94rem;
    }

    .pill {
      display: inline-block;
      padding: 5px 10px;
      border-radius: 999px;
      font-size: 0.78rem;
      font-weight: 800;
    }

    .pill.active { background: rgba(21,128,61,0.25); color: #bbf7d0; }
    .pill.locked { background: rgba(180,83,9,0.24); color: #fde68a; }
    .pill.expired { background: rgba(185,28,28,0.2); color: #fecaca; }

    .code {
      font-family: Consolas, monospace;
      color: #fde68a;
      font-weight: 800;
      word-break: break-word;
    }

    .mini-grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(110px, 1fr));
      gap: 8px;
      margin-top: 8px;
    }

    .mini-grid-2 {
      display: grid;
      grid-template-columns: repeat(2, minmax(110px, 1fr));
      gap: 8px;
      margin-top: 8px;
    }

    .mini-grid select,
    .mini-grid input,
    .mini-grid-2 input {
      width: 100%;
      padding: 9px;
      border-radius: 10px;
      border: 1px solid #475569;
      background: #111827;
      color: white;
    }

    .row-actions {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      margin-top: 10px;
    }

    .row-actions button {
      border: none;
      border-radius: 10px;
      padding: 8px 10px;
      font-size: 0.82rem;
      font-weight: 800;
      cursor: pointer;
    }

    .muted {
      color: #cbd5e1;
      font-size: 0.9rem;
      line-height: 1.5;
    }
  </style>
</head>
<body>

  <div id="loginScreen" class="screen">
    <div class="card">
      <h2>Admin Sign In</h2>

      <div class="field">
        <label for="adminEmail">Firebase Admin Email</label>
        <input type="email" id="adminEmail" autocomplete="username" />
      </div>

      <div class="field">
        <label for="adminPassword">Firebase Admin Password</label>
        <input type="password" id="adminPassword" autocomplete="current-password" />
      </div>

      <div class="field">
        <label for="bossCode">Boss Code</label>
        <input type="password" id="bossCode" placeholder="Enter admin code" autocomplete="off" />
      </div>

      <div class="actions">
        <button id="signInBtn" class="btn btn-primary">Sign In</button>
      </div>

      <div id="loginMessage" class="message"></div>

      <p class="muted">
        This dashboard requires both your Firebase admin sign-in and the BSA boss code.
      </p>
    </div>
  </div>

  <div id="adminApp" class="app-shell hidden">
    <div class="topbar">
      <h1>Broussard Shooting Academy Admin Dashboard</h1>
      <div class="topbar-actions">
        <button id="refreshBtn" class="btn btn-dark">Refresh</button>
        <button id="logoutBtn" class="btn btn-danger">Logout</button>
      </div>
    </div>

    <div class="wrap">
      <div class="grid">
        <div class="panel">
          <h2>Create Student</h2>

          <div class="field">
            <label for="studentName">Student Name</label>
            <input type="text" id="studentName" placeholder="John Smith" />
          </div>

          <div class="field">
            <label for="studentEmail">Student Email</label>
            <input type="email" id="studentEmail" placeholder="john@email.com" />
          </div>

          <div class="field">
            <label for="studentTier">Tier</label>
            <select id="studentTier">
              <option value="FULL">FULL</option>
              <option value="FREE">FREE</option>
              <option value="BASIC">BASIC</option>
            </select>
          </div>

          <div class="field">
            <label for="studentStatus">Portal Status</label>
            <select id="studentStatus">
              <option value="active">active</option>
              <option value="locked">locked</option>
              <option value="expired">expired</option>
            </select>
          </div>

          <div class="field">
            <label for="studentPaid">Paid</label>
            <select id="studentPaid">
              <option value="true">true</option>
              <option value="false">false</option>
            </select>
          </div>

          <div class="field">
            <label for="studentProgressLabel">Progress Label</label>
            <input type="text" id="studentProgressLabel" placeholder="Not Started" />
          </div>

          <div class="field">
            <label for="studentNotes">Admin Notes</label>
            <textarea id="studentNotes" placeholder="Notes, comments, payment details, etc."></textarea>
          </div>

          <div class="actions">
            <button id="createStudentBtn" class="btn btn-success">Create Student</button>
            <button id="clearFormBtn" class="btn btn-dark">Clear</button>
          </div>

          <div id="createMessage" class="message"></div>
        </div>

        <div class="panel">
          <div class="toolbar">
            <div>
              <h2 style="margin:0;">Students</h2>
              <div class="muted">Private records stay in <strong>portalStudents</strong>. Login-only fields sync to <strong>portalAccess</strong>.</div>
            </div>

            <input type="text" id="searchInput" placeholder="Search name, email, code, status, tier..." />
          </div>

          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name / Email</th>
                  <th>Access Code</th>
                  <th>Status</th>
                  <th>Tier</th>
                  <th>Paid</th>
                  <th>Progress</th>
                  <th>Completed Lessons</th>
                  <th>Student ID</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody id="studentsTableBody">
                <tr>
                  <td colspan="9">Loading students...</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div id="tableMessage" class="message"></div>
        </div>
      </div>
    </div>
  </div>

  <script type="module" src="admin.js"></script>
</body>
</html>
