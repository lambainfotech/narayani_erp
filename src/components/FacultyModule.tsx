import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { FacultyMember } from '../types/erp';
import { erpApi } from '../services/api';
import {
  Users,
  Mail,
  Phone,
  GraduationCap,
  BookOpen,
  Building2,
  Calendar,
} from 'lucide-react';

export const FacultyModule: React.FC = () => {
  const { t, language } = useLanguage();
  const [faculty, setFaculty] = useState<FacultyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDept, setSelectedDept] = useState('All');

  useEffect(() => {
    async function load() {
      try {
        const list = await erpApi.getFaculty();
        setFaculty(list);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const departments = ['All', 'Faculty of Arts', 'Faculty of Science', 'Faculty of Commerce', 'Administration & Accounts'];

  const filteredFaculty = faculty.filter((f) => {
    if (selectedDept === 'All') return true;
    return f.department === selectedDept;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            {t.facultyDirectory}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {language === 'hi'
              ? 'नारायणी देवी महिला महाविद्यालय - समस्त प्राध्यापक, व्याख्याता एवं प्रशासनिक संवर्ग'
              : 'Permanent professors, assistant lecturers, and administrative officers'}
          </p>
        </div>

        <div className="text-xs font-mono text-slate-500">
          Total Faculty: <strong className="text-slate-900">{faculty.length}</strong>
        </div>
      </div>

      {/* Department Filter Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-slate-100 rounded-xl max-w-fit">
        {departments.map((dept) => (
          <button
            key={dept}
            onClick={() => setSelectedDept(dept)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              selectedDept === dept
                ? 'bg-white text-slate-900 shadow-sm font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {dept === 'All' ? 'All Departments / सभी' : dept}
          </button>
        ))}
      </div>

      {/* Faculty Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredFaculty.map((member) => (
          <div
            key={member.id}
            className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm">
                  {member.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                </div>
                <span className="font-mono text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                  {member.employeeCode}
                </span>
              </div>

              <h2 className="text-base font-bold text-slate-900">
                {language === 'hi' ? member.nameHi : member.name}
              </h2>

              <p className="text-xs font-semibold text-indigo-600 mt-0.5">
                {language === 'hi' ? member.designationHi : member.designation}
              </p>

              <div className="mt-1 text-[11px] text-slate-500 font-medium flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                <span>{language === 'hi' ? member.departmentHi : member.department}</span>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                <div className="flex items-start gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span className="text-[11px] font-medium">{member.qualification}</span>
                </div>

                <div className="flex items-start gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span className="text-[11px] text-slate-600">{member.subjects.join(', ')}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-mono">
              <div className="flex items-center gap-1">
                <Phone className="w-3 h-3 text-slate-400" />
                <span>{member.phone}</span>
              </div>
              <div>
                <span>Since {member.joiningYear}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
