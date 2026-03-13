<?php
header('Content-Type: application/json');

$DATA_FILE = dirname(__DIR__) . '/data/students.json';

if (!file_exists($DATA_FILE)) {
    @mkdir(dirname($DATA_FILE), 0775, true);
    file_put_contents($DATA_FILE, json_encode([
        'students' => [],
        'meta' => [
            'updatedAt' => gmdate('c'),
            'version' => 1
        ]
    ], JSON_PRETTY_PRINT));
}

function respond($ok, $data = [], $status = 200) {
    http_response_code($status);
    echo json_encode(array_merge(['ok' => $ok], $data), JSON_PRETTY_PRINT);
    exit;
}

function get_json_input() {
    $raw = file_get_contents('php://input');
    if (!$raw) return [];
    $decoded = json_decode($raw, true);
    return is_array($decoded) ? $decoded : [];
}

function normalize_email($email) {
    return strtolower(trim((string)$email));
}

function normalize_name($name) {
    return trim(preg_replace('/\s+/', ' ', (string)$name));
}

function random_digits($length = 4) {
    $min = (int) pow(10, $length - 1);
    $max = (int) pow(10, $length) - 1;
    return (string) random_int($min, $max);
}

function generate_code($tier, $students) {
    $prefix = 'BSA-' . strtoupper($tier) . '-';
    do {
        $code = $prefix . random_digits(4);
        $exists = false;
        foreach ($students as $s) {
            if (($s['code'] ?? '') === $code) {
                $exists = true;
                break;
            }
        }
    } while ($exists);
    return $code;
}

function tier_amount($tier) {
    switch (strtoupper($tier)) {
        case 'FULL': return 150;
        case 'DISC': return 100;
        case 'FREE': return 0;
        default: return 150;
    }
}

function read_state($file) {
    $fh = fopen($file, 'c+');
    if (!$fh) respond(false, ['message' => 'Unable to open data file.'], 500);
    if (!flock($fh, LOCK_EX)) {
        fclose($fh);
        respond(false, ['message' => 'Unable to lock data file.'], 500);
    }
    $contents = stream_get_contents($fh);
    if (!$contents) {
        $state = ['students' => [], 'meta' => ['updatedAt' => gmdate('c'), 'version' => 1]];
    } else {
        $state = json_decode($contents, true);
        if (!is_array($state)) {
            $state = ['students' => [], 'meta' => ['updatedAt' => gmdate('c'), 'version' => 1]];
        }
        if (!isset($state['students']) || !is_array($state['students'])) $state['students'] = [];
        if (!isset($state['meta']) || !is_array($state['meta'])) $state['meta'] = [];
    }
    return [$fh, $state];
}

function write_state($fh, $file, $state) {
    $state['meta']['updatedAt'] = gmdate('c');
    $state['meta']['version'] = (int)($state['meta']['version'] ?? 0) + 1;
    rewind($fh);
    ftruncate($fh, 0);
    fwrite($fh, json_encode($state, JSON_PRETTY_PRINT));
    fflush($fh);
    flock($fh, LOCK_UN);
    fclose($fh);
}

function close_state($fh) {
    flock($fh, LOCK_UN);
    fclose($fh);
}

function &find_student_by_email_ref(&$students, $email) {
    foreach ($students as &$student) {
        if (normalize_email($student['email'] ?? '') === normalize_email($email)) {
            return $student;
        }
    }
    $null = null;
    return $null;
}

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$action = $_GET['action'] ?? ($_POST['action'] ?? null);
$input = $method === 'POST' ? get_json_input() : $_GET;
if (!$action && isset($input['action'])) $action = $input['action'];

if (!$action) {
    respond(false, ['message' => 'Missing action parameter.'], 400);
}

list($fh, $state) = read_state($DATA_FILE);
$students =& $state['students'];

switch ($action) {
    case 'list_students':
        close_state($fh);
        respond(true, ['students' => array_values($students), 'meta' => $state['meta']]);

    case 'create_student':
        $name = normalize_name($input['name'] ?? '');
        $email = normalize_email($input['email'] ?? '');
        $tier = strtoupper(trim((string)($input['tier'] ?? 'FULL')));
        $paid = filter_var($input['paid'] ?? false, FILTER_VALIDATE_BOOLEAN);

        if ($name === '' || $email === '') {
            close_state($fh);
            respond(false, ['message' => 'Student name and email are required.'], 422);
        }
        if (!in_array($tier, ['FULL', 'DISC', 'FREE'], true)) {
            close_state($fh);
            respond(false, ['message' => 'Invalid tier.'], 422);
        }
        foreach ($students as $s) {
            if (normalize_email($s['email'] ?? '') === $email) {
                close_state($fh);
                respond(false, ['message' => 'A student with that email already exists.'], 409);
            }
        }

        $student = [
            'id' => bin2hex(random_bytes(8)),
            'name' => $name,
            'email' => $email,
            'code' => generate_code($tier, $students),
            'tier' => $tier,
            'amountDue' => tier_amount($tier),
            'paid' => $paid,
            'status' => 'active',
            'progress' => new stdClass(),
            'completedLessons' => [],
            'lessonLocks' => new stdClass(),
            'failCounts' => new stdClass(),
            'instructorOverrideRequired' => new stdClass(),
            'createdAt' => gmdate('c'),
            'updatedAt' => gmdate('c')
        ];

        $students[] = $student;
        write_state($fh, $DATA_FILE, $state);
        respond(true, ['student' => $student, 'message' => 'Student code created.']);

    case 'mark_paid':
        $email = normalize_email($input['email'] ?? '');
        $paid = filter_var($input['paid'] ?? true, FILTER_VALIDATE_BOOLEAN);
        $student =& find_student_by_email_ref($students, $email);
        if ($student === null) {
            close_state($fh);
            respond(false, ['message' => 'Student not found.'], 404);
        }
        $student['paid'] = $paid;
        $student['updatedAt'] = gmdate('c');
        write_state($fh, $DATA_FILE, $state);
        respond(true, ['student' => $student, 'message' => 'Payment status updated.']);

    case 'unlock_lesson':
        $email = normalize_email($input['email'] ?? '');
        $lessonId = trim((string)($input['lessonId'] ?? ''));
        $student =& find_student_by_email_ref($students, $email);
        if ($student === null) {
            close_state($fh);
            respond(false, ['message' => 'Student not found.'], 404);
        }
        if ($lessonId === '') {
            close_state($fh);
            respond(false, ['message' => 'Lesson ID is required.'], 422);
        }
        if (!isset($student['lessonLocks']) || !is_array($student['lessonLocks'])) $student['lessonLocks'] = [];
        if (!isset($student['failCounts']) || !is_array($student['failCounts'])) $student['failCounts'] = [];
        if (!isset($student['instructorOverrideRequired']) || !is_array($student['instructorOverrideRequired'])) $student['instructorOverrideRequired'] = [];

        unset($student['lessonLocks'][$lessonId]);
        $student['failCounts'][$lessonId] = 0;
        $student['instructorOverrideRequired'][$lessonId] = false;
        $student['updatedAt'] = gmdate('c');
        write_state($fh, $DATA_FILE, $state);
        respond(true, ['student' => $student, 'message' => 'Lesson unlocked.']);

    case 'require_override':
        $email = normalize_email($input['email'] ?? '');
        $lessonId = trim((string)($input['lessonId'] ?? ''));
        $required = filter_var($input['required'] ?? true, FILTER_VALIDATE_BOOLEAN);
        $student =& find_student_by_email_ref($students, $email);
        if ($student === null) {
            close_state($fh);
            respond(false, ['message' => 'Student not found.'], 404);
        }
        if ($lessonId === '') {
            close_state($fh);
            respond(false, ['message' => 'Lesson ID is required.'], 422);
        }
        if (!isset($student['instructorOverrideRequired']) || !is_array($student['instructorOverrideRequired'])) $student['instructorOverrideRequired'] = [];
        $student['instructorOverrideRequired'][$lessonId] = $required;
        $student['updatedAt'] = gmdate('c');
        write_state($fh, $DATA_FILE, $state);
        respond(true, ['student' => $student, 'message' => 'Override rule updated.']);

    case 'issue_new_code':
        $email = normalize_email($input['email'] ?? '');
        $student =& find_student_by_email_ref($students, $email);
        if ($student === null) {
            close_state($fh);
            respond(false, ['message' => 'Student not found.'], 404);
        }
        $student['code'] = generate_code($student['tier'] ?? 'FULL', $students);
        $student['updatedAt'] = gmdate('c');
        write_state($fh, $DATA_FILE, $state);
        respond(true, ['student' => $student, 'message' => 'New code issued.']);

    case 'validate_login':
        $email = normalize_email($input['email'] ?? '');
        $code = strtoupper(trim((string)($input['code'] ?? '')));
        $student =& find_student_by_email_ref($students, $email);
        close_state($fh);
        if ($student === null) {
            respond(false, ['message' => 'Student not found.'], 404);
        }
        if (strtoupper(trim((string)($student['code'] ?? ''))) !== $code) {
            respond(false, ['message' => 'Invalid access code.'], 401);
        }
        respond(true, [
            'message' => 'Login validated.',
            'student' => [
                'id' => $student['id'],
                'name' => $student['name'],
                'email' => $student['email'],
                'tier' => $student['tier'],
                'amountDue' => $student['amountDue'],
                'paid' => $student['paid'],
                'status' => $student['status'],
                'completedLessons' => $student['completedLessons'] ?? [],
                'lessonLocks' => $student['lessonLocks'] ?? new stdClass(),
                'failCounts' => $student['failCounts'] ?? new stdClass(),
                'instructorOverrideRequired' => $student['instructorOverrideRequired'] ?? new stdClass(),
            ]
        ]);

    default:
        close_state($fh);
        respond(false, ['message' => 'Unknown action.'], 400);
}
