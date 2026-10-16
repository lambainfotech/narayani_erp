export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'PRINCIPAL' | 'TEACHER' | 'ACCOUNTANT' | 'STUDENT' | 'admin' | 'faculty' | 'student' | 'accountant';

export interface CaptchaChallenge {
  id: string;
  question: string;
  expires_in?: number;
  answer?: string;
}

export interface UserSession {
  token: string;
  userId: string | number;
  username: string;
  name: string;
  nameHi?: string;
  role: string;
  email: string;
  phone?: string;
  department?: string;
  designation?: string;
  institution_id?: number | string;
  institution_name?: string;
  scholarNo?: string;
  course?: string;
  expiresAt: number;
}

export interface FastRouteLoginSuccess {
  access: string;
  user: {
    id: number | string;
    username: string;
    email?: string;
    role: string;
    name?: string;
    institution_id?: number;
    institution_name?: string;
    [key: string]: any;
  };
}

export interface FastRoute2FARequired {
  two_factor_required: true;
  temp_token: string;
  masked_target?: string;
  message?: string;
  institution_id?: number | string;
}

export interface Student {
  id: string;
  scholarNo: string;
  enrollmentNo: string;
  rollNo?: string;
  name: string;
  fatherName: string;
  motherName: string;
  dob: string;
  gender: 'Female';
  mobile: string;
  email: string;
  course: 'B.A.' | 'B.Sc.' | 'B.Com.' | 'M.A. Hindi' | 'M.A. Geography' | 'B.Ed.';
  year: '1st Year' | '2nd Year' | '3rd Year' | 'Previous' | 'Final';
  section: string;
  category: 'General' | 'OBC' | 'SC' | 'ST' | 'EWS' | 'MBC';
  admissionDate: string;
  feeTotal: number;
  feePaid: number;
  feeBalance: number;
  attendanceRate: number;
  address: string;
  status: 'Active' | 'Alumni' | 'Detained';
}

export interface FeeHead {
  name: string;
  nameHi: string;
  amount: number;
}

export interface FeeReceipt {
  receiptNo: string;
  date: string;
  studentId: string;
  scholarNo: string;
  studentName: string;
  fatherName: string;
  course: string;
  year: string;
  heads: FeeHead[];
  totalAmount: number;
  paidAmount: number;
  balanceDue: number;
  paymentMode: 'Cash' | 'UPI / QR' | 'Net Banking' | 'Cheque / DD';
  transactionId?: string;
  collectedBy: string;
  remarks?: string;
  session: string;
}

export interface AttendanceStudentEntry {
  studentId: string;
  scholarNo: string;
  name: string;
  rollNo: string;
  status: 'present' | 'absent' | 'leave';
  remark?: string;
}

export interface AttendanceBatch {
  id: string;
  date: string;
  course: string;
  year: string;
  section: string;
  subject: string;
  markedBy: string;
  timestamp: string;
  records: AttendanceStudentEntry[];
}

export interface CollegeNotice {
  id: string;
  noticeNo: string;
  date: string;
  title: string;
  titleHi: string;
  content: string;
  contentHi: string;
  category: 'academic' | 'exam' | 'fee' | 'holiday' | 'event';
  priority: 'urgent' | 'normal';
  issuedBy: string;
  attachmentName?: string;
}

export interface FacultyMember {
  id: string;
  employeeCode: string;
  name: string;
  nameHi: string;
  designation: string;
  designationHi: string;
  department: string;
  departmentHi: string;
  qualification: string;
  subjects: string[];
  phone: string;
  email: string;
  joiningYear: number;
}

export interface ApiConfiguration {
  baseUrl: string; // https://ndedu.in/erp
  apiPrefix: string; // /api
  useProxy: boolean;
  timeoutMs: number;
  institutionId?: number | null;
}

export interface PendingAttendanceBatch extends AttendanceBatch {
  queuedAt: number;
  retryAttempts: number;
  lastError?: string;
  classLabel?: string;
}

export interface NetworkStatusInfo {
  isBrowserOnline: boolean;
  isApiReachable: boolean;
  latencyMs: number | null;
  lastChecked: number | null;
  error?: string | null;
  pendingAttendanceCount: number;
}

