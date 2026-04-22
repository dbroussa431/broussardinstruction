// =====================================================================
// BSA DAVID TEACHER - AI.JS 5.2
// =====================================================================
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>BSA Lesson</title>

<link rel="stylesheet" href="css/styles.css">

<style>
/* ===== AI PANEL ===== */
#aiPanel {
  position: fixed;
  bottom: 90px;
  right: 20px;
  width: 320px;
  height: 420px;
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
  display: none;
  flex-direction: column;
  overflow: hidden;
  z-index: 9999;
}

#aiHeader {
  background: #1e3a5f;
  color: white;
  padding: 10px 14px;
  font-weight: 600;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

#aiMessages {
  flex: 1;
  padding: 10px;
  overflow-y: auto;
  font-size: 14px;
}

.msg {
  margin-bottom: 10px;
  padding: 8px 10px;
  border-radius: 10px;
  max-width: 85%;
}

.msg.ai {
  background: #f1f3f5;
}

.msg.user {
  background: #1e3a5f;
  color: white;
  margin-left: auto;
}

#aiInputRow {
  display: flex;
  border-top: 1px solid #ddd;
}

#aiInput {
  flex: 1;
  border: none;
  padding: 10px;
}

#aiSend {
  background: #1e3a5f;
  color: white;
  border: none;
  padding: 10px 14px;
  cursor: pointer;
}

/* ===== BUTTON ===== */
#askInstructor {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: #1e3a5f;
  color: white;
  border-radius: 25px;
  padding: 12px 18px;
  cursor: pointer;
  box-shadow: 0 5px 15px rgba(0,0,0,0.2);
}
</style>
</head>

<body>

<!-- ===== HEADER ===== -->
<header style="background:#1e3a5f;color:white;padding:15px;">
  <h2>Broussard Shooting Academy</h2>
  <button onclick="window.location.href='dashboard.html'">Dashboard</button>
</header>

<!-- ===== CONTENT ===== -->
<div style="padding:20px;">
  <h1>Developing a Personal Protection Plan</h1>

  <p>This lesson teaches awareness, avoidance, and decision-making.</p>

  <h3>The Real Goal of Personal Protection</h3>
  <ul>
    <li>Self-defense is not about fighting.</li>
    <li>The goal is to avoid the fight entirely.</li>
    <li>Early awareness gives more options.</li>
  </ul>
</div>

<!-- ===== AI BUTTON ===== -->
<div id="askInstructor">Ask Instructor</div>

<!-- ===== AI PANEL ===== -->
<div id="aiPanel">
  <div id="aiHeader">
    BSA Instructor
    <span style="cursor:pointer;" onclick="document.getElementById('aiPanel').style.display='none'">✕</span>
  </div>

  <div id="aiMessages"></div>

  <div id="aiInputRow">
    <input id="aiInput" placeholder="Ask a question...">
    <button id="aiSend">Send</button>
  </div>
</div>

<!-- ===== LOAD AI (THIS WAS YOUR PROBLEM) ===== -->
<script src="ai.js"></script>

</body>
</html>
