<?php
// No blank lines above this line! (required so header() redirects still work)

// ── Basic setup ────────────────────────────────────────────────
$to = "broussardshootingacademy@protonmail.com";

// Only accept POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    exit('Method not allowed.');
}

// ── Honeypot spam trap ─────────────────────────────────────────
// Add a hidden input named "website" to the form; real users never fill it.
if (!empty($_POST['website'])) {
    // Silently pretend success to the bot.
    header("Location: thank-you.html");
    exit();
}

// ── Helper: strip header-injection characters (CRLF) ────────────
function clean_header_value($value) {
    $value = (string) $value;
    $value = str_replace(["\r", "\n", "%0a", "%0d"], '', $value);
    return trim($value);
}

// ── Collect + sanitize input ────────────────────────────────────
$name    = htmlspecialchars(clean_header_value($_POST['name']    ?? ''));
$email   = clean_header_value($_POST['email']   ?? '');
$class   = htmlspecialchars(clean_header_value($_POST['class']   ?? ''));
$message = htmlspecialchars(trim($_POST['message'] ?? '')); // message can contain newlines, just not in headers

// Require the essentials
if ($name === '' || $email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    exit('Please provide a valid name and email address.');
}

// ── Build a safe From/Reply-To (never trust raw user input in headers) ──
$safeEmail = filter_var($email, FILTER_SANITIZE_EMAIL);

$subject = "New Inquiry from " . $name;
$headers  = "From: Broussard Shooting Academy Website <no-reply@broussardshootingacademy.com>\r\n";
$headers .= "Reply-To: " . $safeEmail . "\r\n";
$headers .= "Content-Type: text/plain; charset=utf-8\r\n";

$body  = "You received a new contact form submission:\n\n";
$body .= "Name: $name\n";
$body .= "Email: $safeEmail\n";
$body .= "Interested In: $class\n";
$body .= "Message:\n$message\n";

// ── Send + redirect ──────────────────────────────────────────────
if (mail($to, $subject, $body, $headers)) {
    header("Location: thank-you.html");
    exit();
} else {
    http_response_code(500);
    echo "<p>Sorry, your message could not be sent. Please try again later.</p>";
}
