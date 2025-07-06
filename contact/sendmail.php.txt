<?php
// No blank lines above this line!

$to = "broussardshootingacademy@protonmail.com";

$name    = htmlspecialchars($_POST['name']);
$email   = htmlspecialchars($_POST['email']);
$class   = htmlspecialchars($_POST['class']);
$message = htmlspecialchars($_POST['message']);

$subject = "New Inquiry from $name";
$headers = "From: $email\r\n";
$headers .= "Reply-To: $email\r\n";
$headers .= "Content-Type: text/plain; charset=utf-8\r\n";

$body  = "You received a new contact form submission:\n\n";
$body .= "Name: $name\n";
$body .= "Email: $email\n";
$body .= "Interested In: $class\n";
$body .= "Message:\n$message\n";

// Email and redirect
if (mail($to, $subject, $body, $headers)) {
    header("Location: thank-you.html");
    exit();
} else {
    echo "<p>Sorry, your message could not be sent. Please try again later.</p>";
}
?>
