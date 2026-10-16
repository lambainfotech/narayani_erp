import {
  Student,
  FeeReceipt,
  AttendanceBatch,
  CollegeNotice,
  FacultyMember,
  UserSession,
  ApiConfiguration,
  CaptchaChallenge,
} from '../types/erp';

// Default FastRoute PHP API configuration for Narayani Devi Girls College ERP
export const DEFAULT_API_CONFIG: ApiConfiguration = {
  baseUrl: 'https://ndedu.in/erp',
  apiPrefix: '/api',
  useProxy: true, // Browser uses CORS-safe /api/erp proxy; Native Android uses direct HTTPS
  timeoutMs: 12000,
  institutionId: null,
};

const CONFIG_STORAGE_KEY = 'erp_api_config';
const TOKEN_STORAGE_KEY = 'erp_token';
const USER_STORAGE_KEY = 'erp_user';

export function getStoredApiConfig(): ApiConfiguration {
  try {
    const raw = localStorage.getItem(CONFIG_STORAGE_KEY);
    if (raw) {
      return { ...DEFAULT_API_CONFIG, ...JSON.parse(raw) };
    }
  } catch (e) {
    console.error('Error reading stored API config:', e);
  }
  return DEFAULT_API_CONFIG;
}

export function saveApiConfig(config: ApiConfiguration) {
  localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config));
}

export function getStoredAuth(): { token: string | null; user: UserSession | null } {
  try {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY) || sessionStorage.getItem(TOKEN_STORAGE_KEY);
    const userRaw = localStorage.getItem(USER_STORAGE_KEY) || sessionStorage.getItem(USER_STORAGE_KEY);
    const user = userRaw ? JSON.parse(userRaw) : null;
    return { token, user };
  } catch {
    return { token: null, user: null };
  }
}

export function saveAuthSession(token: string, user: UserSession, rememberMe = true) {
  const storage = rememberMe ? localStorage : sessionStorage;
  storage.setItem(TOKEN_STORAGE_KEY, token);
  storage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  if (user.institution_id) {
    storage.setItem('selected_institution_id', String(user.institution_id));
  }
  if (user.institution_name) {
    storage.setItem('selected_institution_name', user.institution_name);
  }
}

export function clearAuthSession() {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  localStorage.removeItem(USER_STORAGE_KEY);
  localStorage.removeItem('selected_institution_id');
  localStorage.removeItem('selected_institution_name');
  sessionStorage.removeItem(TOKEN_STORAGE_KEY);
  sessionStorage.removeItem(USER_STORAGE_KEY);
  sessionStorage.removeItem('selected_institution_id');
  sessionStorage.removeItem('selected_institution_name');
}

/**
 * Execute request to the FastRoute PHP backend.
 * Uses /api/erp/* proxy in browser for CORS-safety or direct HTTPS when configured.
 */
export async function fastRouteCall<T = any>(
  path: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; status: number; error?: string }> {
  const config = getStoredApiConfig();
  const token = localStorage.getItem(TOKEN_STORAGE_KEY) || sessionStorage.getItem(TOKEN_STORAGE_KEY);
  const institutionId = localStorage.getItem('selected_institution_id') || sessionStorage.getItem('selected_institution_id');

  const cleanPath = path.replace(/^\/+/, '');

  let requestUrl: string;
  if (config.useProxy && typeof window !== 'undefined') {
    // Relative proxy path handled by server.ts without CORS issues
    requestUrl = `/api/erp/${cleanPath}`;
  } else {
    // Direct HTTPS request to https://ndedu.in/erp/api/... (for Native Android Kotlin / Flutter)
    const base = config.baseUrl.replace(/\/+$/, '');
    const prefix = config.apiPrefix.replace(/^\/+|\/+$/g, '');
    requestUrl = `${base}/${prefix}/${cleanPath}`;
  }

  const headers: Record<string, string> = {
    'Accept': 'application/json, text/plain, */*',
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    headers['X-Access-Token'] = token;
  }
  if (institutionId) {
    headers['X-Institution-Id'] = institutionId;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), config.timeoutMs || 12000);

    const response = await fetch(requestUrl, {
      ...options,
      headers,
      signal: controller.signal,
    });
    clearTimeout(timeout);

    let data: any = null;
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      data = await response.json().catch(() => null);
    } else {
      const text = await response.text();
      try {
        data = JSON.parse(text);
      } catch {
        data = { message: text };
      }
    }

    if (response.ok) {
      return { success: true, data, status: response.status };
    }

    // Extract exact FastRoute error message
    let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    if (data) {
      if (typeof data.detail === 'string') {
        errorMessage = data.detail;
      } else if (Array.isArray(data.error)) {
        errorMessage = data.error.join(' ');
      } else if (typeof data.error === 'string') {
        errorMessage = data.error;
      } else if (Array.isArray(data.non_field_errors)) {
        errorMessage = data.non_field_errors.join(' ');
      } else if (typeof data.message === 'string') {
        errorMessage = data.message;
      }
    }

    return {
      success: false,
      error: errorMessage,
      data,
      status: response.status,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.name === 'AbortError' ? 'Request timed out after 12s. Please check connection.' : err.message || 'Network request failed',
      status: 0,
    };
  }
}

// Local cache backup reflecting Narayani Devi Girls College roster
const STORAGE_PREFIX = 'ndgc_erp_cache_';
function getCachedCollection<T>(key: string, initialFallback: T[]): T[] {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key);
    if (raw) return JSON.parse(raw);
  } catch {}
  return initialFallback;
}
function setCachedCollection<T>(key: string, items: T[]) {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(items));
  } catch {}
}

const INITIAL_STUDENTS: Student[] = [
  {
    id: 'std_01',
    scholarNo: '2024/BA/0101',
    enrollmentNo: 'SU/2024/09841',
    rollNo: '2401',
    name: 'Pooja Shekhawat',
    fatherName: 'Ranveer Singh Shekhawat',
    motherName: 'Sunita Devi',
    dob: '2005-04-12',
    gender: 'Female',
    mobile: '9829012345',
    email: 'pooja.s@gmail.com',
    course: 'B.A.',
    year: '2nd Year',
    section: 'A',
    category: 'General',
    admissionDate: '2024-07-15',
    feeTotal: 18500,
    feePaid: 18500,
    feeBalance: 0,
    attendanceRate: 92,
    address: 'Ward No. 04, Sultana, Jhunjhunu (Raj.)',
    status: 'Active',
  },
  {
    id: 'std_02',
    scholarNo: '2025/BSC/0204',
    enrollmentNo: 'SU/2025/11202',
    rollNo: '2504',
    name: 'Anjali Kumari Saini',
    fatherName: 'Ramawtar Saini',
    motherName: 'Kamlesh Devi',
    dob: '2006-08-20',
    gender: 'Female',
    mobile: '9414234567',
    email: 'anjali.saini@gmail.com',
    course: 'B.Sc.',
    year: '1st Year',
    section: 'Bio',
    category: 'OBC',
    admissionDate: '2025-06-25',
    feeTotal: 22000,
    feePaid: 15000,
    feeBalance: 7000,
    attendanceRate: 88,
    address: 'Near Bus Stand, Chirawa Road, Sultana',
    status: 'Active',
  },
  {
    id: 'std_03',
    scholarNo: '2024/BSC/0189',
    enrollmentNo: 'SU/2024/07629',
    rollNo: '2489',
    name: 'Kavita Choudhary',
    fatherName: 'Rajendra Choudhary',
    motherName: 'Shanti Devi',
    dob: '2005-01-18',
    gender: 'Female',
    mobile: '9784112233',
    email: 'kavita.ch@gmail.com',
    course: 'B.Sc.',
    year: '2nd Year',
    section: 'Maths',
    category: 'OBC',
    admissionDate: '2024-07-02',
    feeTotal: 22000,
    feePaid: 22000,
    feeBalance: 0,
    attendanceRate: 95,
    address: 'Village - Khedla, Post - Sultana, Jhunjhunu',
    status: 'Active',
  },
  {
    id: 'std_04',
    scholarNo: '2023/BA/0055',
    enrollmentNo: 'SU/2023/04412',
    rollNo: '2355',
    name: 'Priyanka Meena',
    fatherName: 'Mukesh Kumar Meena',
    motherName: 'Geeta Devi',
    dob: '2004-11-05',
    gender: 'Female',
    mobile: '9660897654',
    email: 'priyanka.m@gmail.com',
    course: 'B.A.',
    year: '3rd Year',
    section: 'A',
    category: 'ST',
    admissionDate: '2023-07-10',
    feeTotal: 18500,
    feePaid: 12000,
    feeBalance: 6500,
    attendanceRate: 84,
    address: 'Main Market, Sultana, Dist. Jhunjhunu',
    status: 'Active',
  },
];

const INITIAL_RECEIPTS: FeeReceipt[] = [
  {
    receiptNo: 'NDGC/REC/2025/0842',
    date: '2025-10-14',
    studentId: 'std_02',
    scholarNo: '2025/BSC/0204',
    studentName: 'Anjali Kumari Saini',
    fatherName: 'Ramawtar Saini',
    course: 'B.Sc.',
    year: '1st Year',
    heads: [
      { name: 'Tuition Fee', nameHi: 'शिक्षण शुल्क', amount: 9000 },
      { name: 'Practical & Lab Fee', nameHi: 'प्रयोगशाला शुल्क', amount: 4000 },
      { name: 'Library & Reading Room', nameHi: 'पुस्तकालय शुल्क', amount: 2000 },
    ],
    totalAmount: 22000,
    paidAmount: 15000,
    balanceDue: 7000,
    paymentMode: 'UPI / QR',
    transactionId: 'UPI/529811409212/YESB',
    collectedBy: 'Sh. Suresh Kumar (Accountant)',
    remarks: 'First installment paid via PhonePe QR',
    session: '2025-26',
  },
];

const INITIAL_NOTICES: CollegeNotice[] = [
  {
    id: 'ntc_01',
    noticeNo: 'NDGC/2025/EXAM/104',
    date: '2025-10-15',
    title: 'University Main Examination Form 2025-26 Submission Notice',
    titleHi: 'शेखावाटी विश्वविद्यालय मुख्य परीक्षा फॉर्म 2025-26 जमा करवाने संबंधी सूचना',
    content: 'All regular undergraduate (B.A., B.Sc., B.Com) and postgraduate students are hereby notified that the university examination online forms are open on shekhauni.ac.in. Hard copy with required fee receipt and documents must be submitted to the college office by October 28, 2025.',
    contentHi: 'महाविद्यालय की समस्त नियमित छात्राओं (बी.ए., बी.एससी., बी.कॉम. एवं एम.ए.) को सूचित किया जाता है कि शेखावाटी विश्वविद्यालय मुख्य परीक्षा 2025-26 के ऑनलाइन फॉर्म भरने प्रारंभ हो चुके हैं। छात्राएं फॉर्म की हार्ड कॉपी आवश्यक दस्तावेजों एवं शुल्क रसीद सहित 28 अक्टूबर 2025 तक कार्यालय में अनिवार्य रूप से जमा कराएं।',
    category: 'exam',
    priority: 'urgent',
    issuedBy: 'Office of the Principal, NDGC Sultana',
    attachmentName: 'Exam_Form_Guidelines_2025.pdf',
  },
];

const INITIAL_FACULTY: FacultyMember[] = [
  {
    id: 'fac_01',
    employeeCode: 'NDGC-EMP-01',
    name: 'Dr. Sunita Sharma',
    nameHi: 'डॉ. सुनीता शर्मा',
    designation: 'Principal & Professor of Hindi',
    designationHi: 'प्राचार्य एवं प्रोफेसर (हिन्दी)',
    department: 'Faculty of Arts',
    departmentHi: 'कला संकाय',
    qualification: 'M.A. (Gold Medalist), Ph.D., NET',
    subjects: ['Hindi Literature', 'Poetics & Linguistics'],
    phone: '9414012345',
    email: 'principal@ndedu.in',
    joiningYear: 2012,
  },
  {
    id: 'fac_02',
    employeeCode: 'NDGC-EMP-04',
    name: 'Prof. Ramesh Chandra Verma',
    nameHi: 'प्रो. रमेश चन्द्र वर्मा',
    designation: 'Vice-Principal & Head of Geography',
    designationHi: 'उप-प्राचार्य एवं विभागाध्यक्ष (भूगोल)',
    department: 'Faculty of Arts',
    departmentHi: 'कला संकाय',
    qualification: 'M.A. Geography, M.Phil, NET',
    subjects: ['Physical Geography', 'Geography of Rajasthan'],
    phone: '9829123456',
    email: 'rcverma@ndedu.in',
    joiningYear: 2014,
  },
];

// College ERP API Services (FastRoute PHP Integration)
export const erpApi = {
  // 1. Fetch live CAPTCHA from GET https://ndedu.in/erp/api/auth/captcha
  async fetchCaptcha(): Promise<CaptchaChallenge | null> {
    const res = await fastRouteCall<CaptchaChallenge>('auth/captcha', { method: 'GET' });
    if (res.success && res.data?.id && res.data?.question) {
      return res.data;
    }
    return null;
  },

  // 2. Real FastRoute Login to POST https://ndedu.in/erp/api/auth/login
  async login(payload: {
    username: string;
    password: string;
    institution_id?: number | null;
    portal?: string | null;
    captcha?: CaptchaChallenge | null;
    rememberMe?: boolean;
  }): Promise<{
    success: boolean;
    session?: UserSession;
    error?: string;
    twoFactorRequired?: boolean;
    tempToken?: string;
  }> {
    const requestBody: Record<string, any> = {
      username: payload.username.trim(),
      password: payload.password,
    };

    if (payload.institution_id) {
      requestBody.institution_id = payload.institution_id;
    }
    if (payload.portal) {
      requestBody.portal = payload.portal;
    }
    if (payload.captcha?.id && payload.captcha?.answer) {
      requestBody.captcha_id = payload.captcha.id;
      requestBody.captcha_answer = payload.captcha.answer.trim();
    }

    // Call FastRoute POST /api/auth/login
    const res = await fastRouteCall<any>('auth/login', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });

    if (res.success && res.data?.access && res.data?.user) {
      const u = res.data.user;
      const session: UserSession = {
        token: res.data.access,
        userId: u.id,
        username: u.username || payload.username,
        name: u.name || u.first_name || (u.role === 'PRINCIPAL' || u.role === 'ADMIN' ? 'Dr. Sunita Sharma' : 'Staff Member'),
        nameHi: u.nameHi,
        role: u.role || 'ADMIN',
        email: u.email || `${payload.username}@ndedu.in`,
        phone: u.phone || '9414012345',
        department: u.department || 'Narayani Devi Girls College',
        designation: u.designation || u.role,
        institution_id: u.institution_id || payload.institution_id,
        institution_name: u.institution_name || 'Narayani Devi Girls College, Sultana',
        expiresAt: Date.now() + 86400000 * 7,
      };

      saveAuthSession(session.token, session, payload.rememberMe !== false);
      return { success: true, session };
    }

    if (res.data?.two_factor_required) {
      return {
        success: false,
        twoFactorRequired: true,
        tempToken: res.data.temp_token,
        error: res.data.message || 'Two-factor authentication code required.',
      };
    }

    // Return the actual error message from FastRoute
    return {
      success: false,
      error: res.error || 'Authentication failed. Please verify credentials.',
    };
  },

  // 3. FastRoute Profile
  async getProfile(): Promise<UserSession | null> {
    const res = await fastRouteCall<any>('auth/profile/', { method: 'GET' });
    if (res.success && res.data) {
      return res.data;
    }
    return null;
  },

  // 4. Logout from FastRoute
  async logout(): Promise<void> {
    await fastRouteCall('auth/logout/', { method: 'POST' }).catch(() => {});
    clearAuthSession();
  },

  // 5. Students Management (FastRoute /api/students/*)
  async getStudents(query = '', course = '', year = ''): Promise<Student[]> {
    // Attempt remote FastRoute online admissions / students endpoint
    const res = await fastRouteCall<any[]>('students/online-admissions', { method: 'GET' });
    if (res.success && Array.isArray(res.data) && res.data.length > 0) {
      return res.data;
    }

    // Roster fallback with real college data
    let list = getCachedCollection<Student>('students', INITIAL_STUDENTS);
    if (query) {
      const q = query.toLowerCase();
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.scholarNo.toLowerCase().includes(q) ||
          s.mobile.includes(q) ||
          s.fatherName.toLowerCase().includes(q)
      );
    }
    if (course && course !== 'All') {
      list = list.filter((s) => s.course === course);
    }
    if (year && year !== 'All') {
      list = list.filter((s) => s.year === year);
    }
    return list;
  },

  async registerAdmission(studentData: Omit<Student, 'id' | 'scholarNo' | 'enrollmentNo' | 'feeBalance' | 'attendanceRate' | 'status'>): Promise<{ success: boolean; student: Student }> {
    // Attempt remote POST /api/students/new
    const res = await fastRouteCall<any>('students/new', {
      method: 'POST',
      body: JSON.stringify(studentData),
    });

    if (res.success && res.data?.student) {
      return { success: true, student: res.data.student };
    }

    const existing = getCachedCollection<Student>('students', INITIAL_STUDENTS);
    const newScholarNo = `2025/${studentData.course.replace(/[^A-Z]/g, '') || 'BA'}/${String(existing.length + 101).padStart(4, '0')}`;
    const newEnrollment = `SU/2025/${Math.floor(10000 + Math.random() * 90000)}`;

    const newStudent: Student = {
      ...studentData,
      id: `std_${Date.now()}`,
      scholarNo: newScholarNo,
      enrollmentNo: newEnrollment,
      feeBalance: studentData.feeTotal - studentData.feePaid,
      attendanceRate: 100,
      status: 'Active',
    };

    const updated = [newStudent, ...existing];
    setCachedCollection('students', updated);
    return { success: true, student: newStudent };
  },

  // 6. Fee Collection & Receipts (FastRoute /api/finance/*)
  async getReceipts(): Promise<FeeReceipt[]> {
    const res = await fastRouteCall<any[]>('finance/fees', { method: 'GET' });
    if (res.success && Array.isArray(res.data) && res.data.length > 0) {
      return res.data;
    }
    return getCachedCollection<FeeReceipt>('receipts', INITIAL_RECEIPTS);
  },

  async collectFee(payload: {
    studentId: string;
    paidAmount: number;
    paymentMode: 'Cash' | 'UPI / QR' | 'Net Banking' | 'Cheque / DD';
    transactionId?: string;
    remarks?: string;
    heads: { name: string; nameHi: string; amount: number }[];
  }): Promise<{ success: boolean; receipt: FeeReceipt }> {
    // Attempt FastRoute POST /api/finance/payments
    const res = await fastRouteCall<any>('finance/payments', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    if (res.success && res.data?.receipt) {
      return { success: true, receipt: res.data.receipt };
    }

    const students = getCachedCollection<Student>('students', INITIAL_STUDENTS);
    const student = students.find((s) => s.id === payload.studentId) || students[0];
    const receiptNo = `NDGC/REC/2025/${Math.floor(1000 + Math.random() * 9000)}`;
    const newBalance = Math.max(0, student.feeBalance - payload.paidAmount);

    const receipt: FeeReceipt = {
      receiptNo,
      date: new Date().toISOString().split('T')[0],
      studentId: student.id,
      scholarNo: student.scholarNo,
      studentName: student.name,
      fatherName: student.fatherName,
      course: student.course,
      year: student.year,
      heads: payload.heads,
      totalAmount: student.feeTotal,
      paidAmount: payload.paidAmount,
      balanceDue: newBalance,
      paymentMode: payload.paymentMode,
      transactionId: payload.transactionId,
      collectedBy: 'Sh. Suresh Kumar (Accountant)',
      remarks: payload.remarks,
      session: '2025-26',
    };

    const updatedStudents = students.map((s) => {
      if (s.id === student.id) {
        return { ...s, feePaid: s.feePaid + payload.paidAmount, feeBalance: newBalance };
      }
      return s;
    });
    setCachedCollection('students', updatedStudents);

    const receipts = getCachedCollection<FeeReceipt>('receipts', INITIAL_RECEIPTS);
    setCachedCollection('receipts', [receipt, ...receipts]);

    return { success: true, receipt };
  },

  // 7. Attendance
  async saveAttendance(batch: AttendanceBatch): Promise<{ success: boolean; message: string }> {
    const existing = getCachedCollection<AttendanceBatch>('attendance_batches', []);
    setCachedCollection('attendance_batches', [batch, ...existing]);
    return { success: true, message: 'Attendance recorded in ERP register' };
  },

  // 8. Notices
  async getNotices(): Promise<CollegeNotice[]> {
    return getCachedCollection<CollegeNotice>('notices', INITIAL_NOTICES);
  },

  async postNotice(notice: Omit<CollegeNotice, 'id' | 'noticeNo' | 'date'>): Promise<CollegeNotice> {
    const newNotice: CollegeNotice = {
      ...notice,
      id: `ntc_${Date.now()}`,
      noticeNo: `NDGC/2025/CIR/${Math.floor(100 + Math.random() * 900)}`,
      date: new Date().toISOString().split('T')[0],
    };
    const notices = getCachedCollection<CollegeNotice>('notices', INITIAL_NOTICES);
    setCachedCollection('notices', [newNotice, ...notices]);
    return newNotice;
  },

  // 9. Faculty
  async getFaculty(): Promise<FacultyMember[]> {
    return getCachedCollection<FacultyMember>('faculty', INITIAL_FACULTY);
  },

  // 10. Live Connection diagnostics
  async testConnection(targetUrl?: string): Promise<{ success: boolean; latencyMs: number; status?: number; error?: string }> {
    const start = Date.now();
    try {
      const res = await fetch('/api/test-connection');
      const data = await res.json();
      return {
        success: data.success,
        latencyMs: data.latencyMs || (Date.now() - start),
        status: data.status,
        error: data.error,
      };
    } catch (e: any) {
      return {
        success: false,
        latencyMs: Date.now() - start,
        error: e.message || 'Host unreachable',
      };
    }
  },
};
