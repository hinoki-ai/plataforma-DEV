import { faker } from '@faker-js/faker';

// Generate realistic test data for educational platform

export const createTestTeacher = (overrides = {}) => ({
  email: faker.internet.email({
    firstName: 'teacher',
    lastName: 'test',
    provider: 'manitospintadas.cl',
  }),
  name: faker.person.fullName(),
  role: 'PROFESOR',
  grade: faker.helpers.arrayElement([
    '1st',
    '2nd',
    '3rd',
    '4th',
    '5th',
    '6th',
    '7th',
    '8th',
  ]),
  subject: faker.helpers.arrayElement([
    'Math',
    'Science',
    'Language',
    'History',
    'Art',
    'Physical Education',
  ]),
  isActive: true,
  phone: faker.phone.number('+569########'),
  ...overrides,
});

export const createTestAdmin = (overrides = {}) => ({
  email: faker.internet.email({
    firstName: 'admin',
    lastName: 'test',
    provider: 'manitospintadas.cl',
  }),
  name: faker.person.fullName(),
  role: 'ADMIN',
  isActive: true,
  phone: faker.phone.number('+569########'),
  ...overrides,
});

export const createTestParent = (overrides = {}) => ({
  email: faker.internet.email({ provider: 'parent.test' }),
  name: faker.person.fullName(),
  role: 'PARENT',
  phone: faker.phone.number('+569########'),
  address: faker.location.streetAddress(),
  ...overrides,
});

export const createTestStudent = (parentId, overrides = {}) => ({
  firstName: faker.person.firstName(),
  lastName: faker.person.lastName(),
  grade: faker.helpers.arrayElement([
    '1st',
    '2nd',
    '3rd',
    '4th',
    '5th',
    '6th',
    '7th',
    '8th',
  ]),
  parentId,
  birthDate: faker.date.birthdate({ min: 6, max: 14, mode: 'age' }),
  emergencyContact: faker.phone.number('+569########'),
  medicalInfo: faker.lorem.sentence(),
  ...overrides,
});

export const createTestCentroConsejoMember = (overrides = {}) => ({
  email: faker.internet.email({ provider: 'consejo.test' }),
  name: faker.person.fullName(),
  role: 'CENTRO_CONSEJO',
  position: faker.helpers.arrayElement([
    'Presidente',
    'Vicepresidente',
    'Secretario',
    'Tesorero',
    'Vocal',
  ]),
  verified: true,
  ...overrides,
});

export const createTestPlanning = (teacherId, overrides = {}) => ({
  title: faker.lorem.sentence(3),
  grade: faker.helpers.arrayElement([
    '1st',
    '2nd',
    '3rd',
    '4th',
    '5th',
    '6th',
    '7th',
    '8th',
  ]),
  subject: faker.helpers.arrayElement([
    'Math',
    'Science',
    'Language',
    'History',
    'Art',
    'Music',
  ]),
  content: faker.lorem.paragraphs(3),
  objectives: [
    faker.lorem.sentence(),
    faker.lorem.sentence(),
    faker.lorem.sentence(),
  ],
  duration: faker.helpers.arrayElement([
    '1 week',
    '2 weeks',
    '3 weeks',
    '1 month',
  ]),
  teacherId,
  attachments: [
    {
      name: 'lesson-plan.pdf',
      url: faker.internet.url(),
      type: 'application/pdf',
    },
  ],
  ...overrides,
});

export const createTestMeeting = (teacherId, parentId, overrides = {}) => ({
  title: faker.lorem.sentence(2),
  description: faker.lorem.paragraph(),
  scheduledDate: faker.date.soon(),
  duration: 30,
  teacherId,
  parentId,
  studentName: faker.person.fullName(),
  status: faker.helpers.arrayElement(['scheduled', 'completed', 'cancelled']),
  ...overrides,
});

export const createTestAnnouncement = (authorId, overrides = {}) => ({
  title: faker.lorem.sentence(2),
  content: faker.lorem.paragraphs(2),
  authorId,
  priority: faker.helpers.arrayElement(['low', 'medium', 'high', 'urgent']),
  recipients: faker.helpers.arrayElement([
    'all-parents',
    'specific-grade',
    'individual',
  ]),
  ...overrides,
});

export const createTestDocument = (authorId, overrides = {}) => ({
  title: faker.lorem.sentence(2),
  type: faker.helpers.arrayElement([
    'reglamento',
    'acta',
    'circular',
    'comunicado',
    'guia',
  ]),
  content: faker.lorem.paragraphs(3),
  authorId,
  category: faker.helpers.arrayElement([
    'academico',
    'administrativo',
    'comunicacion',
    'legal',
  ]),
  visibility: faker.helpers.arrayElement([
    'public',
    'parents',
    'teachers',
    'admin',
  ]),
  ...overrides,
});

export const createTestVote = (memberId, proposalId, overrides = {}) => ({
  memberId,
  proposalId,
  vote: faker.helpers.arrayElement(['yes', 'no', 'abstain']),
  comment: faker.lorem.sentence(),
  ...overrides,
});

export const createTestProposal = (authorId, overrides = {}) => ({
  title: faker.lorem.sentence(3),
  description: faker.lorem.paragraphs(2),
  authorId,
  status: faker.helpers.arrayElement([
    'draft',
    'active',
    'closed',
    'approved',
    'rejected',
  ]),
  votingDeadline: faker.date.soon(),
  ...overrides,
});

export const createTestAttendance = (studentId, overrides = {}) => ({
  studentId,
  date: faker.date.recent(),
  status: faker.helpers.arrayElement(['present', 'absent', 'late', 'excused']),
  notes: faker.lorem.sentence(),
  ...overrides,
});

export const createTestGrade = (studentId, subject, overrides = {}) => ({
  studentId,
  subject,
  grade: faker.number.float({ min: 1.0, max: 7.0, precision: 0.1 }),
  assessment: faker.lorem.sentence(),
  date: faker.date.recent(),
  ...overrides,
});

// Bulk data generation helpers
export const createMultipleTeachers = (count = 5) =>
  Array.from({ length: count }, () => createTestTeacher());

export const createMultipleStudents = (parentId, count = 3) =>
  Array.from({ length: count }, () => createTestStudent(parentId));

export const createMultiplePlannings = (teacherId, count = 10) =>
  Array.from({ length: count }, () => createTestPlanning(teacherId));

export const createMultipleMeetings = (teacherId, parentId, count = 5) =>
  Array.from({ length: count }, () => createTestMeeting(teacherId, parentId));

// Educational content specific data
export const createTestLearningObjective = () => ({
  objective: faker.lorem.sentence(),
  skill: faker.helpers.arrayElement([
    'knowledge',
    'comprehension',
    'application',
    'analysis',
    'synthesis',
    'evaluation',
  ]),
  grade: faker.helpers.arrayElement([
    '1st',
    '2nd',
    '3rd',
    '4th',
    '5th',
    '6th',
    '7th',
    '8th',
  ]),
  subject: faker.helpers.arrayElement([
    'Math',
    'Science',
    'Language',
    'History',
  ]),
});

export const createTestActivity = () => ({
  name: faker.lorem.sentence(2),
  description: faker.lorem.paragraph(),
  duration: faker.number.int({ min: 15, max: 120 }),
  materials: faker.lorem.words(5).split(' '),
  objective: faker.lorem.sentence(),
});

export const createTestAssessment = () => ({
  title: faker.lorem.sentence(2),
  description: faker.lorem.paragraph(),
  type: faker.helpers.arrayElement([
    'quiz',
    'test',
    'project',
    'presentation',
    'homework',
  ]),
  maxScore: faker.number.int({ min: 10, max: 100 }),
  dueDate: faker.date.soon(),
});

// Test file fixtures
export const createTestFile = (type = 'pdf') => {
  const types = {
    pdf: {
      name: faker.system.commonFileName('pdf'),
      mimeType: 'application/pdf',
      buffer: Buffer.from('PDF test content'),
    },
    doc: {
      name: faker.system.commonFileName('docx'),
      mimeType:
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      buffer: Buffer.from('Word document test content'),
    },
    image: {
      name: faker.system.commonFileName('jpg'),
      mimeType: 'image/jpeg',
      buffer: Buffer.from('Image test content'),
    },
    video: {
      name: faker.system.commonFileName('mp4'),
      mimeType: 'video/mp4',
      buffer: Buffer.from('Video test content'),
    },
  };

  return types[type] || types.pdf;
};

// Realistic school data
export const createSchoolData = () => ({
  name: 'Colegio Manitos Pintadas',
  address: faker.location.streetAddress(),
  phone: faker.phone.number('+562#######'),
  email: faker.internet.email({ provider: 'manitospintadas.cl' }),
  website: 'https://manitospintadas.cl',
  grades: [
    'Prekinder',
    'Kinder',
    '1st',
    '2nd',
    '3rd',
    '4th',
    '5th',
    '6th',
    '7th',
    '8th',
  ],
  subjects: [
    'Lenguaje y Comunicación',
    'Matemáticas',
    'Ciencias Naturales',
    'Historia y Ciencias Sociales',
    'Artes Visuales',
    'Música',
    'Educación Física',
    'Inglés',
    'Tecnología',
  ],
});

// Error scenarios for testing
export const createInvalidData = () => ({
  invalidEmail: 'not-an-email',
  invalidPhone: '123abc',
  invalidGrade: 'invalid-grade',
  invalidRole: 'invalid-role',
  emptyString: '',
  tooLongString: faker.string.alphanumeric(1000),
  specialChars: '<script>alert("xss")</script>',
  sqlInjection: "'; DROP TABLE users; --",
});

// Performance testing data
export const createLargeDataset = (type, count = 100) => {
  switch (type) {
    case 'plannings':
      return Array.from({ length: count }, (_, i) =>
        createTestPlanning(`teacher-${i % 10}`)
      );
    case 'students':
      return Array.from({ length: count }, (_, i) =>
        createTestStudent(`parent-${i % 20}`)
      );
    case 'messages':
      return Array.from({ length: count }, (_, i) =>
        createTestAnnouncement(`author-${i % 5}`)
      );
    default:
      return [];
  }
};

// Consistent test data for repeatable tests
export const createConsistentTestData = () => ({
  teacher: {
    email: 'test.teacher@manitospintadas.cl',
    name: 'Profesor Test',
    password: 'Test123!',
    role: 'PROFESOR',
  },
  parent: {
    email: 'test.parent@manitospintadas.cl',
    name: 'Padre Test',
    password: 'Test123!',
    role: 'PARENT',
  },
  admin: {
    email: 'test.admin@manitospintadas.cl',
    name: 'Admin Test',
    password: 'Test123!',
    role: 'ADMIN',
  },
  student: {
    firstName: 'Juanito',
    lastName: 'Pérez',
    grade: '3rd',
  },
  planning: {
    title: 'Matemáticas - Fracciones',
    grade: '3rd',
    subject: 'Math',
    content: 'Contenido de prueba para fracciones',
  },
});
