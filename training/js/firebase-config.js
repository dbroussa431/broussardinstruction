rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /portalStudents/{studentId} {
      allow read, write: if true;
    }

    match /students/{studentId} {
      allow read, write: if true;
    }
  }
}
