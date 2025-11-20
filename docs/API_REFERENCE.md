# API Reference - Convex Backend Functions

**Plataforma Astral Educational Management System**  
**Convex Serverless Backend API**  
**Last Updated**: November 20, 2025  
**Status**: Production Ready ✅

---

## 📋 Table of Contents

- [Authentication & Users](#🔐-authentication--users)
- [Meetings](#📅-meetings)
- [Students & Courses](#👥-students--courses)
- [Voting System](#🗳️-voting-system)
- [Grades & Attendance](#📊-grades--attendance)
- [Planning & Content](#📝-planning--content)
- [Media & Files](#📎-media--files)
- [Notifications](#🔔-notifications)
- [Institution Management](#🏫-institution-management)

---

## 🔐 Authentication & Users

### Users API

#### `users.getCurrentUser`

**Type**: Query  
**Roles**: All authenticated users  
**Description**: Get current authenticated user information

```typescript
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

const user = useQuery(api.users.getCurrentUser);
```

**Response**:

```typescript
{
  _id: Id<"users">,
  name: string,
  email: string,
  role: "MASTER" | "ADMIN" | "PROFESOR" | "PARENT",
  institutionId: Id<"institutions">,
  // ... other user fields
}
```

#### `users.getUsersByInstitution`

**Type**: Query  
**Roles**: ADMIN, MASTER  
**Description**: Get all users for current institution

```typescript
const users = useQuery(api.users.getUsersByInstitution);
```

#### `users.updateUserRole`

**Type**: Mutation  
**Roles**: ADMIN, MASTER  
**Description**: Update user role

```typescript
const updateRole = useMutation(api.users.updateUserRole);

await updateRole({
  userId: "user_id",
  role: "PROFESOR",
});
```

---

## 📅 Meetings

### Meeting Management

#### `meetings.getMeetings`

**Type**: Query  
**Roles**: All authenticated users  
**Description**: Get meetings for current user/institution

```typescript
const meetings = useQuery(api.meetings.getMeetings, {
  status: "pending", // optional: "pending" | "scheduled" | "completed"
  limit: 10, // optional
});
```

**Response**:

```typescript
[
  {
    _id: Id<"meetings">,
    title: string,
    description: string,
    scheduledAt: number,
    status: "pending" | "scheduled" | "completed",
    assignedTo: Id<"users">, // teacher
    requestedBy: Id<"users">, // parent
    studentId: Id<"students">,
    teacher: {
      id: Id<"users">,
      name: string,
      email: string,
    },
  },
];
```

#### `meetings.createMeeting`

**Type**: Mutation  
**Roles**: PARENT, ADMIN, MASTER  
**Description**: Request a new parent-teacher meeting

```typescript
const createMeeting = useMutation(api.meetings.createMeeting);

await createMeeting({
  title: "Monthly Progress Review",
  description: "Discuss student's academic progress",
  scheduledAt: Date.now() + 86400000, // tomorrow
  assignedTo: "teacher_user_id",
  studentId: "student_id",
});
```

#### `meetings.updateMeetingStatus`

**Type**: Mutation  
**Roles**: PROFESOR, ADMIN, MASTER  
**Description**: Update meeting status (schedule/complete/cancel)

```typescript
const updateStatus = useMutation(api.meetings.updateMeetingStatus);

await updateStatus({
  meetingId: "meeting_id",
  status: "scheduled",
  notes: "Meeting scheduled for tomorrow at 3 PM",
});
```

---

## 👥 Students & Courses

### Course Management

#### `courses.getCourses`

**Type**: Query  
**Roles**: PROFESOR, ADMIN, MASTER  
**Description**: Get courses for current teacher or all courses

```typescript
// For current teacher
const myCourses = useQuery(api.courses.getCourses);

// For admin - all courses
const allCourses = useQuery(api.courses.getCourses, {
  teacherId: undefined, // admin override
});
```

**Response**:

```typescript
[
  {
    _id: Id<"courses">,
    name: string,
    subject: string,
    grade: string,
    academicYear: string,
    teacherId: Id<"users">,
    studentCount: number,
    schedule: string,
  },
];
```

#### `courses.createCourse`

**Type**: Mutation  
**Roles**: ADMIN, MASTER  
**Description**: Create a new course

```typescript
const createCourse = useMutation(api.courses.createCourse);

await createCourse({
  name: "Mathematics 8th Grade",
  subject: "Mathematics",
  grade: "8th",
  academicYear: "2025",
  teacherId: "teacher_user_id",
  schedule: "Mon, Wed, Fri 10:00-11:00",
});
```

#### `courses.enrollStudent`

**Type**: Mutation  
**Roles**: ADMIN, MASTER  
**Description**: Enroll student in course

```typescript
const enrollStudent = useMutation(api.courses.enrollStudent);

await enrollStudent({
  courseId: "course_id",
  studentId: "student_id",
});
```

### Student Management

#### `students.getStudents`

**Type**: Query  
**Roles**: PROFESOR, ADMIN, MASTER  
**Description**: Get students (filtered by course for teachers)

```typescript
// All students (admin)
const allStudents = useQuery(api.students.getStudents);

// Students in specific course (teacher)
const courseStudents = useQuery(api.students.getStudents, {
  courseId: "course_id",
});
```

#### `students.createStudent`

**Type**: Mutation  
**Roles**: ADMIN, MASTER  
**Description**: Create new student record

```typescript
const createStudent = useMutation(api.students.createStudent);

await createStudent({
  name: "Juan Pérez",
  rut: "12.345.678-9",
  birthDate: "2010-05-15",
  grade: "8th",
  parentId: "parent_user_id",
});
```

---

## 🗳️ Voting System

### Vote Management

#### `votes.getVotes`

**Type**: Query  
**Roles**: All authenticated users  
**Description**: Get votes with optional filters

```typescript
// All active votes
const activeVotes = useQuery(api.votes.getVotes, {
  isActive: true,
});

// Votes by category
const academicVotes = useQuery(api.votes.getVotes, {
  category: "ACADEMIC",
});
```

**Response**:

```typescript
[{
  _id: Id<"votes">,
  title: string,
  description: string,
  category: "GENERAL" | "ACADEMIC" | "ADMINISTRATIVE" | ...,
  options: string[], // vote options
  allowMultipleVotes: boolean,
  maxVotesPerUser: number,
  isActive: boolean,
  createdBy: Id<"users">,
  createdAt: number,
  endDate?: number
}]
```

#### `votes.createVote`

**Type**: Mutation  
**Roles**: ADMIN, MASTER  
**Description**: Create a new vote

```typescript
const createVote = useMutation(api.votes.createVote);

await createVote({
  title: "New School Library Hours",
  description: "Should we extend library hours?",
  category: "ADMINISTRATIVE",
  options: ["Keep current hours", "Extend to 6 PM", "Open on weekends"],
  allowMultipleVotes: false,
  maxVotesPerUser: 1,
  endDate: Date.now() + 604800000, // 1 week
});
```

#### `votes.castVote`

**Type**: Mutation  
**Roles**: PARENT, PROFESOR, ADMIN, MASTER  
**Description**: Cast vote(s) for a voting session

```typescript
const castVote = useMutation(api.votes.castVote);

await castVote({
  voteId: "vote_id",
  selectedOptions: [0, 2], // indices of selected options
});
```

#### `votes.getVoteResults`

**Type**: Query  
**Roles**: All authenticated users  
**Description**: Get voting results and statistics

```typescript
const results = useQuery(api.votes.getVoteResults, {
  voteId: "vote_id",
});
```

**Response**:

```typescript
{
  vote: { /* vote object */ },
  totalVotes: number,
  results: [
    {
      option: string,
      count: number,
      percentage: number
    }
  ],
  userHasVoted: boolean,
  userVotes?: number[] // option indices user selected
}
```

---

## 📊 Grades & Attendance

### Grade Management

#### `grades.getStudentGrades`

**Type**: Query  
**Roles**: PROFESOR, ADMIN, MASTER, PARENT  
**Description**: Get grades for a student

```typescript
const grades = useQuery(api.grades.getStudentGrades, {
  studentId: "student_id",
  courseId: "course_id", // optional
});
```

#### `grades.createGrade`

**Type**: Mutation  
**Roles**: PROFESOR, ADMIN, MASTER  
**Description**: Record a new grade

```typescript
const createGrade = useMutation(api.grades.createGrade);

await createGrade({
  studentId: "student_id",
  courseId: "course_id",
  grade: 6.5, // 1.0 - 7.0 scale
  type: "QUIZ",
  description: "Chapter 5 Quiz",
  date: Date.now(),
  percentage: 25, // weight in final grade
});
```

### Attendance Management

#### `attendance.getAttendanceByDate`

**Type**: Query  
**Roles**: PROFESOR, ADMIN, MASTER  
**Description**: Get attendance for a specific date and course

```typescript
const attendance = useQuery(api.attendance.getAttendanceByDate, {
  courseId: "course_id",
  date: "2025-11-20",
});
```

#### `attendance.recordAttendance`

**Type**: Mutation  
**Roles**: PROFESOR, ADMIN, MASTER  
**Description**: Record attendance for multiple students

```typescript
const recordAttendance = useMutation(api.attendance.recordAttendance);

await recordAttendance({
  courseId: "course_id",
  date: "2025-11-20",
  records: [
    { studentId: "student_1", status: "PRESENTE" },
    { studentId: "student_2", status: "AUSENTE" },
    { studentId: "student_3", status: "ATRASADO" },
  ],
});
```

**Status Options**: `PRESENTE`, `AUSENTE`, `ATRASADO`, `JUSTIFICADO`, `RETIRADO`

---

## 📝 Planning & Content

### Lesson Planning

#### `planning.getPlanningDocuments`

**Type**: Query  
**Roles**: PROFESOR, ADMIN, MASTER  
**Description**: Get planning documents

```typescript
const planning = useQuery(api.planning.getPlanningDocuments, {
  teacherId: "teacher_id", // optional
  academicYear: "2025", // optional
});
```

#### `planning.createPlanningDocument`

**Type**: Mutation  
**Roles**: PROFESOR, ADMIN, MASTER  
**Description**: Create lesson planning document

```typescript
const createPlanning = useMutation(api.planning.createPlanningDocument);

await createPlanning({
  title: "Mathematics Unit Plan",
  subject: "Mathematics",
  grade: "8th",
  academicYear: "2025",
  objectives: ["Master fractions", "Apply geometry concepts"],
  content: "Detailed lesson plans and activities...",
  teacherId: "teacher_id",
});
```

### Class Content

#### `classContent.getClassContentByDate`

**Type**: Query  
**Roles**: PROFESOR, ADMIN, MASTER  
**Description**: Get class content for a specific date

```typescript
const content = useQuery(api.classContent.getClassContentByDate, {
  courseId: "course_id",
  date: "2025-11-20",
});
```

#### `classContent.createClassContent`

**Type**: Mutation  
**Roles**: PROFESOR, ADMIN, MASTER  
**Description**: Record class content and activities

```typescript
const createContent = useMutation(api.classContent.createClassContent);

await createContent({
  courseId: "course_id",
  date: "2025-11-20",
  topic: "Introduction to Fractions",
  objectives: ["Understand fraction concepts"],
  activities: ["Group work", "Problem solving"],
  materials: ["Textbook", "Worksheets"],
  notes: "Students struggled with mixed fractions",
});
```

---

## 📎 Media & Files

### Media Management

#### `media.getMedia`

**Type**: Query  
**Roles**: All authenticated users  
**Description**: Get media files with optional filters

```typescript
const media = useQuery(api.media.getMedia, {
  type: "image", // optional: "image" | "video" | "document"
  uploadedBy: "user_id", // optional
});
```

#### `media.generateUploadUrl`

**Type**: Mutation  
**Roles**: All authenticated users  
**Description**: Generate upload URL for Cloudinary

```typescript
const generateUrl = useMutation(api.media.generateUploadUrl);

const uploadUrl = await generateUrl({
  fileName: "class_photo.jpg",
  fileType: "image/jpeg",
});
```

---

## 🔔 Notifications

### Notification Management

#### `notifications.getNotifications`

**Type**: Query  
**Roles**: All authenticated users  
**Description**: Get user notifications

```typescript
const notifications = useQuery(api.notifications.getNotifications, {
  unreadOnly: true, // optional
});
```

#### `notifications.markAsRead`

**Type**: Mutation  
**Roles**: All authenticated users  
**Description**: Mark notification as read

```typescript
const markRead = useMutation(api.notifications.markAsRead);

await markRead({ notificationId: "notification_id" });
```

---

## 🏫 Institution Management

### Institution Info

#### `institutionInfo.getInstitutionInfo`

**Type**: Query  
**Roles**: All authenticated users  
**Description**: Get current institution information

```typescript
const institution = useQuery(api.institutionInfo.getInstitutionInfo);
```

#### `institutionInfo.updateInstitutionInfo`

**Type**: Mutation  
**Roles**: ADMIN, MASTER  
**Description**: Update institution information

```typescript
const updateInfo = useMutation(api.institutionInfo.updateInstitutionInfo);

await updateInfo({
  name: "Colegio San Francisco",
  address: "Calle Principal 123",
  phone: "+56 2 1234 5678",
  email: "contacto@colegio.cl",
});
```

---

## 🔧 Common Patterns

### Error Handling

All mutations return results that should be handled:

```typescript
try {
  const result = await createMeeting(meetingData);
  console.log("Success:", result);
} catch (error) {
  console.error("Error:", error);
  // Handle error (show toast, etc.)
}
```

### Loading States

Use Convex's built-in loading states:

```typescript
const meetings = useQuery(api.meetings.getMeetings);

if (meetings === undefined) {
  return <div>Loading...</div>;
}

return <div>{/* render meetings */}</div>;
```

### Real-time Updates

Convex automatically provides real-time updates for queries:

```typescript
// This will automatically update when data changes
const meetings = useQuery(api.meetings.getMeetings);
```

### Optimistic Updates

For immediate UI feedback:

```typescript
const createMeeting = useMutation(api.meetings.createMeeting);

// UI updates immediately, then syncs with server
await createMeeting(meetingData);
```

---

## 📚 Additional Resources

- **[AI Knowledge Base](../docs/AI_KNOWLEDGE_BASE.md)** - Complete system documentation
- **[Testing Guide](../docs/TESTING_GUIDE.md)** - API testing procedures
- **[Voting System Guide](../docs/VOTING_SYSTEM.md)** - Detailed voting system documentation
- **[Libro de Clases Guide](../docs/LIBRO_DE_CLASES_GUIDE.md)** - Complete class book system

---

**For questions or issues with the API, refer to the troubleshooting sections in the AI Knowledge Base or contact the development team.**
