import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import {
  Archive, ArrowRight, BarChart3, CalendarDays, Check, ChevronDown, ClipboardList,
  CloudDownload, Download, FileText, GraduationCap, LayoutDashboard, LockKeyhole,
  LogOut, Menu, Pencil, Plus, RefreshCw, Search, Settings2, ShieldCheck, Trash2,
  Users, X, CheckCircle2, Clock3
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { jsPDF } from 'jspdf';

type View = 'public' | 'admin' | 'super';
type Role = 'admin' | 'super';
type Status = 'Pending' | 'Reviewed' | 'Needs update';
type TeachingOption = { week: string; grade: string; subject: string; topic: string; task: string };
type Submission = { id: string; teacher_name: string; submission_date: string; option_one: TeachingOption; option_two?: TeachingOption | null; option_three?: TeachingOption | null; status: Status; created_at: string };

type Settings = { schoolName: string; tagline: string; heading: string; subheading: string; teachers: string[]; weeks: string[]; grades: string[]; subjects: string[]; tasks: string[] };

const defaultSettings: Settings = {
  schoolName: 'Faafu Atoll School', tagline: 'Learning together, growing with purpose', heading: 'Coordination Subject Outline', subheading: 'Complete the details below and submit your teaching plan.',
  teachers: ['Aishath Shifana', 'Hassan Ibrahim', 'Fathimath Mariyam', 'Ibrahim Nashid', 'Mariyam Zahir'],
  weeks: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7', 'Week 8', 'Week 9', 'Week 10'],
  grades: ['Foundation', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10'],
  subjects: ['English', 'Mathematics', 'Science', 'Dhivehi', 'Islam', 'Social Studies', 'Physical Education', 'Arts'],
  tasks: ['Guided lesson', 'Group activity', 'Independent practice', 'Project work', 'Assessment', 'Reflection'],
};

const emptyOption: TeachingOption = { week: '', grade: '', subject: '', topic: '', task: '' };
const demoSubmissions: Submission[] = [
  { id: 'demo-1', teacher_name: 'Aishath Shifana', submission_date: '2026-10-03', option_one: { week: 'Week 2', grade: 'Grade 5', subject: 'Science', topic: 'Living things and their habitats', task: 'Guided lesson' }, option_two: { week: 'Week 2', grade: 'Grade 6', subject: 'Science', topic: 'Food chains', task: 'Group activity' }, status: 'Reviewed', created_at: '2026-10-03T08:24:00Z' },
  { id: 'demo-2', teacher_name: 'Hassan Ibrahim', submission_date: '2026-10-03', option_one: { week: 'Week 2', grade: 'Grade 3', subject: 'Mathematics', topic: 'Multiplication patterns', task: 'Independent practice' }, status: 'Pending', created_at: '2026-10-03T10:12:00Z' },
  { id: 'demo-3', teacher_name: 'Fathimath Mariyam', submission_date: '2026-10-02', option_one: { week: 'Week 2', grade: 'Grade 8', subject: 'English', topic: 'Writing with vivid details', task: 'Project work' }, option_two: { week: 'Week 2', grade: 'Grade 9', subject: 'English', topic: 'Persuasive writing', task: 'Assessment' }, status: 'Needs update', created_at: '2026-10-02T12:48:00Z' },
];

function readStored<T>(key: string, fallback: T): T {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) as T : fallback;
  } catch {
    return fallback;
  }
}

function App() {
  const [view, setView] = useState<View>('public');
  const [role, setRole] = useState<Role | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [settings, setSettings] = useState<Settings>(() => ({ ...defaultSettings, ...readStored<Partial<Settings>>('coordination-settings', {}) }));
  const [submissions, setSubmissions] = useState<Submission[]>(() => readStored<Submission[]>('coordination-submissions', demoSubmissions));
  const [toast, setToast] = useState('');

  useEffect(() => {
    const load = async () => {
      if (!supabase) return;
      const { data, error } = await supabase.from('subject_submissions').select('*').order('created_at', { ascending: false });
      if (error) return;
      if (data?.length) {
        setSubmissions(data as Submission[]);
        localStorage.setItem('coordination-submissions', JSON.stringify(data));
        return;
      }

      const saved = readStored<Submission[]>('coordination-submissions', []).filter((item) => !item.id.startsWith('demo-'));
      if (!saved.length) {
        setSubmissions([]);
        localStorage.removeItem('coordination-submissions');
        return;
      }

      const { data: migrated, error: migrationError } = await supabase.from('subject_submissions').insert(saved.map(({ id: _id, created_at: _createdAt, ...submission }) => submission)).select('*');
      if (!migrationError && migrated?.length) {
        setSubmissions(migrated as Submission[]);
        localStorage.setItem('coordination-submissions', JSON.stringify(migrated));
      }
    };
    void load();
  }, []);

  useEffect(() => {
    if (toast) { const timer = window.setTimeout(() => setToast(''), 3200); return () => window.clearTimeout(timer); }
  }, [toast]);

  const navigate = (next: View) => {
    setView(next); setMobileOpen(false);
    if (next !== 'public' && !role) setView(next);
  };

  const signIn = (nextRole: Role) => { setRole(nextRole); setView(nextRole === 'admin' ? 'admin' : 'super'); setToast(`Welcome to the ${nextRole === 'admin' ? 'admin' : 'super admin'} dashboard`); };
  const signOut = () => { setRole(null); setView('public'); setToast('You have been signed out'); };
  const addSubmission = async (submission: Submission) => {
    setSubmissions((current) => { const next = [submission, ...current]; localStorage.setItem('coordination-submissions', JSON.stringify(next)); return next; });
    if (supabase) {
      const { error } = await supabase.from('subject_submissions').insert({ teacher_name: submission.teacher_name, submission_date: submission.submission_date, option_one: submission.option_one, option_two: submission.option_two, option_three: submission.option_three, status: submission.status });
      if (error) console.error('submission save failed', error);
    }
  };
  const updateSubmission = async (id: string, status: Status) => {
    setSubmissions((current) => { const next = current.map((item) => item.id === id ? { ...item, status } : item); localStorage.setItem('coordination-submissions', JSON.stringify(next)); return next; });
    if (supabase && !id.startsWith('demo-')) await supabase.from('subject_submissions').update({ status }).eq('id', id);
  };
  const deleteSubmission = async (id: string) => {
    setSubmissions((current) => { const next = current.filter((item) => item.id !== id); localStorage.setItem('coordination-submissions', JSON.stringify(next)); return next; });
    if (supabase && !id.startsWith('demo-')) await supabase.from('subject_submissions').delete().eq('id', id);
    setToast('Submission removed');
  };

  return <div className="app-shell">
    <Header view={view} role={role} onNavigate={navigate} onSignOut={signOut} onMenu={() => setMobileOpen(!mobileOpen)} />
    {mobileOpen && <div className="mobile-nav"><NavLinks view={view} onNavigate={navigate} /></div>}
    {view === 'public' && <PublicForm settings={settings} onSubmit={addSubmission} onOpenAdmin={() => navigate('admin')} />}
    {view === 'admin' && (role ? <AdminDashboard submissions={submissions} onStatus={updateSubmission} onDelete={deleteSubmission} settings={settings} onSettings={(next) => { setSettings(next); localStorage.setItem('coordination-settings', JSON.stringify(next)); setToast('Form options updated'); }} /> : <LoginPanel type="admin" onSignIn={signIn} />)}
    {view === 'super' && (role === 'super' ? <SuperDashboard settings={settings} submissions={submissions} onSignOut={signOut} /> : <LoginPanel type="super" onSignIn={signIn} />)}
    {toast && <div className="toast"><CheckCircle2 size={18} />{toast}</div>}
  </div>;
}

function Header({ view, role, onNavigate, onSignOut, onMenu }: { view: View; role: Role | null; onNavigate: (view: View) => void; onSignOut: () => void; onMenu: () => void }) {
  return <header className={view === 'public' ? 'topbar public-topbar' : 'topbar'}><div className="brand"><img src="./png.png" alt="Faafu Atoll School logo" /><div><span>FAAFU ATOLL SCHOOL</span><small>{view === 'public' ? 'Coordination Subject Outline' : 'Subject coordination workspace'}</small></div></div>{view !== 'public' && <><button className="menu-button" onClick={onMenu}><Menu size={22} /></button><nav className="desktop-nav"><NavLinks view={view} onNavigate={onNavigate} /></nav><div className="top-actions">{role && <button className="text-button" onClick={onSignOut}><LogOut size={16} /> Sign out</button>}</div></>}</header>;
}
function NavLinks({ view, onNavigate }: { view: View; onNavigate: (view: View) => void }) { return <><button className={view === 'public' ? 'nav-active' : ''} onClick={() => onNavigate('public')}><ClipboardList size={16} /> Submit outline</button><button className={view === 'admin' ? 'nav-active' : ''} onClick={() => onNavigate('admin')}><LayoutDashboard size={16} /> Admin dashboard</button><button className={view === 'super' ? 'nav-active' : ''} onClick={() => onNavigate('super')}><ShieldCheck size={16} /> Super admin</button></>; }

function PublicForm({ settings, onSubmit, onOpenAdmin }: { settings: Settings; onSubmit: (submission: Submission) => Promise<void>; onOpenAdmin: () => void }) {
  const [teacher, setTeacher] = useState(''); const [options, setOptions] = useState<TeachingOption[]>([{ ...emptyOption }, { ...emptyOption }, { ...emptyOption }]); const [submitted, setSubmitted] = useState(false); const [loading, setLoading] = useState(false);
  const updateOption = (index: number, key: keyof TeachingOption, value: string) => setOptions((current) => current.map((option, i) => i === index ? { ...option, [key]: value } : option));
  const hasContent = (option: TeachingOption) => Object.values(option).some(Boolean);
  const submit = async (event: FormEvent) => { event.preventDefault(); setLoading(true); await onSubmit({ id: `local-${Date.now()}`, teacher_name: teacher, submission_date: new Date().toISOString().slice(0, 10), option_one: options[0], option_two: hasContent(options[1]) ? options[1] : null, option_three: hasContent(options[2]) ? options[2] : null, status: 'Pending', created_at: new Date().toISOString() }); setLoading(false); setSubmitted(true); };
  if (submitted) return <main className="success-page"><div className="success-card"><div className="success-icon"><Check size={30} /></div><p className="eyebrow">Submission received</p><h1>Thank you, {teacher.split(' ')[0]}.</h1><p>Your subject outline has been sent to the coordination team. You can return to the form whenever you need to submit another teaching plan.</p><button className="primary-button" onClick={() => { setSubmitted(false); setTeacher(''); setOptions([{ ...emptyOption }, { ...emptyOption }, { ...emptyOption }]); }}>Submit another outline <ArrowRight size={17} /></button></div></main>;
  return <main className="public-page simple-public-page"><section className="simple-form-card"><div className="simple-form-heading"><div><p className="eyebrow">Weekly subject outline</p><h1>{settings.heading}</h1><p>{settings.subheading}</p></div><span className="required-label">* Required</span></div><form onSubmit={submit}><div className="teacher-row"><label className="field"><span>Teacher name <b>*</b></span><select required value={teacher} onChange={(event) => setTeacher(event.target.value)}><option value="">Choose your name</option>{settings.teachers.map((name) => <option key={name}>{name}</option>)}</select></label><label className="field"><span>Submission date</span><div className="readonly-field"><CalendarDays size={17} />{new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</div></label></div>{options.map((option, index) => <PlanCard key={index} number={index + 1} required={index === 0} option={option} settings={settings} onChange={(key, value) => updateOption(index, key, value)} />)}<div className="form-footer"><p><LockKeyhole size={15} /> Your outline is shared with the school coordination team.</p><button className="primary-button" disabled={loading}>{loading ? 'Sending…' : 'Submit subject outline'} <ArrowRight size={17} /></button></div></form></section><button className="staff-access" onClick={onOpenAdmin}>Staff access</button></main>;
}

function PlanCard({ number, required, option, settings, onChange }: { number: number; required: boolean; option: TeachingOption; settings: Settings; onChange: (key: keyof TeachingOption, value: string) => void }) { const fields: { key: keyof TeachingOption; label: string; options?: string[]; placeholder?: string }[] = [{ key: 'week', label: 'Week', options: settings.weeks }, { key: 'grade', label: 'Grade', options: settings.grades }, { key: 'subject', label: 'Subject', options: settings.subjects }, { key: 'topic', label: 'Topic / theme', placeholder: 'What will students explore?' }, { key: 'task', label: 'Learning task', options: settings.tasks }]; return <div className="plan-card"><div className="plan-card-head"><div className="plan-number">0{number}</div><div><p className="eyebrow">Teaching plan {number}</p><h3>Subject outline</h3></div></div><div className="fields-grid">{fields.map((field) => <label className={`field ${field.key === 'topic' ? 'topic-field' : ''}`} key={field.key}><span>{field.label} {required && <b>*</b>}</span>{field.options ? <select required={required} value={option[field.key]} onChange={(event) => onChange(field.key, event.target.value)}><option value="">Select {field.label.toLowerCase()}</option>{field.options.map((item) => <option key={item}>{item}</option>)}</select> : <input required={required} value={option[field.key]} placeholder={field.placeholder} onChange={(event) => onChange(field.key, event.target.value)} />}</label>)}</div></div>; }

function LoginPanel({ type, onSignIn }: { type: Role; onSignIn: (role: Role) => void }) { const [username, setUsername] = useState(''); const [password, setPassword] = useState(''); const [error, setError] = useState(''); const defaultCredentials = type === 'admin' ? { username: 'admin', password: 'admin123' } : { username: 'superadmin', password: 'super123' }; const submit = (event: FormEvent) => { event.preventDefault(); const saved = readStored(`coordination-${type}-credentials`, defaultCredentials); const valid = username === saved.username && password === saved.password; if (valid) onSignIn(type); else setError('That username or password does not match.'); }; return <main className="login-page"><div className="login-card"><div className="login-mark"><ShieldCheck size={25} /></div><p className="eyebrow">{type === 'admin' ? 'Coordination team' : 'System owner'}</p><h1>{type === 'admin' ? 'Admin dashboard' : 'Super admin'}</h1><p>Sign in to continue to your workspace.</p><form onSubmit={submit}><label className="field"><span>Username</span><input required value={username} onChange={(event) => setUsername(event.target.value)} placeholder={defaultCredentials.username} /></label><label className="field"><span>Password</span><input required type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter password" /></label>{error && <div className="login-error">{error}</div>}<button className="primary-button">Continue <ArrowRight size={17} /></button></form></div></main>; }

function getSubmissionPlans(submission: Submission): TeachingOption[] {
  return [submission.option_one, submission.option_two, submission.option_three].filter((plan): plan is TeachingOption => Boolean(plan));
}

function downloadSubmissionPdf(submission: Submission): void {
  const pdf = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageLeft = 15;
  const pageRight = 195;
  const cardWidth = pageRight - pageLeft;
  const cardHeight = 61;
  let y = 18;
  const ensureSpace = (height: number): void => {
    if (y + height > 278) { pdf.addPage(); y = 18; }
  };
  const drawField = (label: string, value: string, x: number, top: number, width: number): void => {
    pdf.setDrawColor(218, 229, 221);
    pdf.line(x, top, x + width, top);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(6.5);
    pdf.setTextColor(64, 111, 96);
    pdf.text(label, x, top + 5);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(55, 91, 82);
    const lines = pdf.splitTextToSize(value || 'Not provided', width - 2) as string[];
    pdf.text(lines.slice(0, 2), x, top + 11);
  };

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9);
  pdf.setTextColor(7, 127, 98);
  pdf.text('FAAFU ATOLL SCHOOL', pageLeft, y);
  y += 8;
  pdf.setFontSize(22);
  pdf.setTextColor(23, 69, 58);
  pdf.text('Subject outline', pageLeft, y);
  y += 7;
  pdf.setDrawColor(223, 232, 226);
  pdf.line(pageLeft, y, pageRight, y);
  y += 8;
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  pdf.setTextColor(89, 115, 107);
  pdf.text(`Teacher: ${submission.teacher_name}`, pageLeft, y);
  pdf.text(`Submission date: ${new Date(submission.submission_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}`, 112, y);
  y += 10;

  getSubmissionPlans(submission).forEach((plan, index) => {
    ensureSpace(cardHeight);
    const cardTop = y;
    const contentLeft = pageLeft + 14;
    const columnGap = 4;
    const columnWidth = (cardWidth - 30 - columnGap) / 2;
    pdf.setFillColor(247, 250, 247);
    pdf.roundedRect(pageLeft, cardTop, cardWidth, cardHeight, 2, 2, 'F');
    pdf.setFillColor(229, 243, 234);
    pdf.circle(pageLeft + 8, cardTop + 10, 5, 'F');
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8);
    pdf.setTextColor(33, 129, 98);
    pdf.text(`0${index + 1}`, pageLeft + 5.5, cardTop + 12.5);
    pdf.setFontSize(6.5);
    pdf.setTextColor(122, 141, 135);
    pdf.text(`TEACHING PLAN ${index + 1}`, contentLeft, cardTop + 8);
    pdf.setFontSize(13);
    pdf.setTextColor(37, 91, 78);
    pdf.text('Subject outline', contentLeft, cardTop + 15);

    const leftColumn = contentLeft;
    const rightColumn = contentLeft + columnWidth + columnGap;
    const detailsTop = cardTop + 21;
    drawField('WEEK', plan.week, leftColumn, detailsTop, columnWidth);
    drawField('GRADE', plan.grade, rightColumn, detailsTop, columnWidth);
    drawField('SUBJECT', plan.subject, leftColumn, detailsTop + 13, columnWidth);
    drawField('TOPIC / THEME', plan.topic, rightColumn, detailsTop + 13, columnWidth);
    drawField('LEARNING TASK', plan.task, leftColumn, detailsTop + 26, columnWidth);
    y = cardTop + cardHeight + 5;
  });

  pdf.save(`subject-outline-${submission.teacher_name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.pdf`);
}

function PrintSubmission({ submission, preview = false }: { submission: Submission; preview?: boolean }) {
  return <article className={`print-submission ${preview ? 'pdf-document-preview' : ''}`}><header><p className="eyebrow">Faafu Atoll School</p><h1>Subject outline</h1><div className="print-meta"><span><b>Teacher:</b> {submission.teacher_name}</span><span><b>Submission date:</b> {new Date(submission.submission_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</span></div></header><div className="print-plans">{getSubmissionPlans(submission).map((plan, index) => <section className="print-plan" key={`print-${index}`}><div className="print-plan-number">0{index + 1}</div><div className="print-plan-content"><p className="eyebrow">Teaching plan {index + 1}</p><h2>Subject outline</h2><div className="print-plan-details"><p><b>Week</b><span>{plan.week}</span></p><p><b>Grade</b><span>{plan.grade}</span></p><p><b>Subject</b><span>{plan.subject}</span></p><p><b>Topic / theme</b><span>{plan.topic}</span></p><p><b>Learning task</b><span>{plan.task}</span></p></div></div></section>)}</div></article>;
}
function PdfPreview({ submission, onClose }: { submission: Submission; onClose: () => void }) {
  return <div className="pdf-preview-overlay" role="dialog" aria-modal="true" aria-label="PDF preview"><div className="pdf-preview-window"><div className="pdf-preview-toolbar"><div><p className="eyebrow">PDF preview</p><strong>Faafu Atoll School</strong></div><div className="pdf-preview-actions"><button className="secondary-button" onClick={onClose}><X size={16} /> Close</button><button className="primary-button" onClick={() => downloadSubmissionPdf(submission)}><Download size={16} /> Download</button></div></div><div className="pdf-preview-page"><PrintSubmission submission={submission} preview /></div></div></div>;
}
function AdminDashboard({ submissions, onStatus, onDelete, settings, onSettings }: { submissions: Submission[]; onStatus: (id: string, status: Status) => void; onDelete: (id: string) => void; settings: Settings; onSettings: (settings: Settings) => void }) {
  const [activeBar, setActiveBar] = useState<'status' | 'reports' | 'form'>('status');
  const [search, setSearch] = useState('');
  const [period, setPeriod] = useState('Daily');
  const [teacherFilter, setTeacherFilter] = useState('All teachers');
  const [gradeFilter, setGradeFilter] = useState('All grades');
  const [weekFilter, setWeekFilter] = useState('All weeks');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [reportReady, setReportReady] = useState(false);
  const [printSubmission, setPrintSubmission] = useState<Submission | null>(null);
  const [pdfPreview, setPdfPreview] = useState<Submission | null>(null);
  const [expandedSubmissionId, setExpandedSubmissionId] = useState<string | null>(null);
  const filtered = submissions.filter((submission) => `${submission.teacher_name} ${submission.option_one.subject} ${submission.option_one.grade}`.toLowerCase().includes(search.toLowerCase()));
  const reportRows = submissions.filter((item) => (teacherFilter === 'All teachers' || item.teacher_name === teacherFilter) && (gradeFilter === 'All grades' || item.option_one.grade === gradeFilter) && (weekFilter === 'All weeks' || item.option_one.week === weekFilter) && (period !== 'Custom range' || ((!customFrom || item.submission_date >= customFrom) && (!customTo || item.submission_date <= customTo))));
  const downloadReport = () => window.print();
  return <main className="dashboard-page"><DashboardHeader eyebrow="Coordination team" title="Admin" sub="Choose a workspace area below." /><div className="admin-tabs"><button className={activeBar === 'status' ? 'active' : ''} onClick={() => setActiveBar('status')}><BarChart3 size={17} /> Status</button><button className={activeBar === 'reports' ? 'active' : ''} onClick={() => setActiveBar('reports')}><FileText size={17} /> Reports</button><button className={activeBar === 'form' ? 'active' : ''} onClick={() => setActiveBar('form')}><Settings2 size={17} /> Form management</button></div>{activeBar === 'status' && <section className="admin-workspace-section"><div className="stat-grid submission-stat-grid"><Stat icon={<ClipboardList />} label="Total submissions" value={filtered.length} detail="Visible subject outlines" color="blue" /><Stat icon={<Users />} label="Total teachers" value={new Set(filtered.map((item) => item.teacher_name)).size} detail="Visible contributors" color="teal" /></div><section className="panel submissions-panel"><div className="panel-head"><div><p className="eyebrow">Submission details</p><h2>Teaching plans</h2><p className="panel-description">Review each teacher’s complete submission and save it as a PDF.</p></div><div className="search-box"><Search size={16} /><input placeholder="Search by teacher, subject, or grade" value={search} onChange={(event) => setSearch(event.target.value)} /></div></div><div className="submission-cards">{filtered.map((submission) => { const isExpanded = expandedSubmissionId === submission.id; const planCount = getSubmissionPlans(submission).length; return <article className={`submission-card ${isExpanded ? 'expanded' : ''}`} key={submission.id}><button className="submission-summary" onClick={() => setExpandedSubmissionId(isExpanded ? null : submission.id)} aria-expanded={isExpanded}><span className="teacher-cell"><span>{submission.teacher_name.split(' ').map((name) => name[0]).join('')}</span><span className="teacher-summary-copy"><strong>{submission.teacher_name}</strong><small>Submitted {new Date(submission.submission_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} · {planCount} teaching plan{planCount === 1 ? '' : 's'}</small></span></span><span className="submission-summary-meta"><button type="button" className="row-action view-action" onClick={(event) => { event.stopPropagation(); setExpandedSubmissionId(isExpanded ? null : submission.id); }}>View</button><button type="button" className="row-action" onClick={(event) => { event.stopPropagation(); setPrintSubmission(submission); setPdfPreview(submission); }}><Download size={14} /> Download PDF</button><ChevronDown size={18} /></span></button>{isExpanded && <div className="submission-expanded"><div className="submission-expanded-tools"><button className="icon-button" onClick={() => onDelete(submission.id)} title="Remove submission"><Trash2 size={16} /></button></div><div className="submission-plan-list">{getSubmissionPlans(submission).map((plan, index) => <div className="submission-plan" key={`${submission.id}-plan-${index}`}><div className="submission-plan-number">0{index + 1}</div><div className="submission-plan-content"><p className="eyebrow">Teaching plan {index + 1}</p><strong>Subject outline</strong><dl className="submission-plan-details"><div><dt>Week</dt><dd>{plan.week}</dd></div><div><dt>Grade</dt><dd>{plan.grade}</dd></div><div><dt>Subject</dt><dd>{plan.subject}</dd></div><div><dt>Topic / theme</dt><dd>{plan.topic}</dd></div><div><dt>Learning task</dt><dd>{plan.task}</dd></div></dl></div></div>)}</div></div>}</article>; })}{filtered.length === 0 && <div className="empty-state">No outlines match your search.</div>}</div></section></section>}{activeBar === 'reports' && <section className="admin-workspace-section"><section className="panel report-panel report-workspace"><div className="panel-head"><div><p className="eyebrow">Report bar</p><h2>Generate a report</h2><p className="panel-description">Choose a report type, then filter by teacher, grade, and week.</p></div><BarChart3 size={20} /></div><div className="report-type-tabs">{['Daily', 'Weekly', 'Monthly', 'Yearly', 'Custom range'].map((type) => <button key={type} className={period === type ? 'active' : ''} onClick={() => { setPeriod(type); setReportReady(false); }}>{type}</button>)}</div><div className="report-filter-grid"><label className="field"><span>Teacher</span><select value={teacherFilter} onChange={(event) => { setTeacherFilter(event.target.value); setReportReady(false); }}><option>All teachers</option>{Array.from(new Set(submissions.map((item) => item.teacher_name))).map((teacher) => <option key={teacher}>{teacher}</option>)}</select></label><label className="field"><span>Grade</span><select value={gradeFilter} onChange={(event) => { setGradeFilter(event.target.value); setReportReady(false); }}><option>All grades</option>{settings.grades.map((grade) => <option key={grade}>{grade}</option>)}</select></label><label className="field"><span>Week</span><select value={weekFilter} onChange={(event) => { setWeekFilter(event.target.value); setReportReady(false); }}><option>All weeks</option>{settings.weeks.map((week) => <option key={week}>{week}</option>)}</select></label>{period === 'Custom range' && <><label className="field"><span>From date</span><input type="date" value={customFrom} onChange={(event) => setCustomFrom(event.target.value)} /></label><label className="field"><span>To date</span><input type="date" value={customTo} onChange={(event) => setCustomTo(event.target.value)} /></label></>}</div><button className="primary-button generate-report-button" onClick={() => setReportReady(true)}>Generate {period} report <ArrowRight size={17} /></button>{reportReady && <div className="report-preview"><div className="report-preview-head"><div><p className="eyebrow">Report preview</p><h2>{teacherFilter === 'All teachers' ? 'All teachers' : teacherFilter}{gradeFilter !== 'All grades' ? ` · ${gradeFilter}` : ''}{weekFilter !== 'All weeks' ? ` · ${weekFilter}` : ''}</h2><p>{period} report · Generated {new Date().toLocaleDateString('en-GB')}</p></div><button className="secondary-button" onClick={downloadReport}><Download size={16} /> Download PDF</button></div><div className="report-metrics"><ReportMetric label="Submitted" value={reportRows.length} /><ReportMetric label="Not submitted" value={teacherFilter !== 'All teachers' && gradeFilter !== 'All grades' && weekFilter !== 'All weeks' && reportRows.length === 0 ? 1 : 0} /><ReportMetric label="Late / needs update" value={reportRows.filter((item) => item.status === 'Needs update').length} /></div><div className="report-table"><table><thead><tr><th>Teacher</th><th>Week</th><th>Grade</th><th>Subject</th><th>Status</th></tr></thead><tbody>{reportRows.map((item) => <tr key={item.id}><td>{item.teacher_name}</td><td>{item.option_one.week}</td><td>{item.option_one.grade}</td><td>{item.option_one.subject}</td><td>{item.status === 'Pending' ? 'Submitted' : item.status}</td></tr>)}</tbody></table>{reportRows.length === 0 && <div className="empty-state">No submission matches these filters.</div>}</div></div>}</section></section>}{activeBar === 'form' && <section className="admin-workspace-section"><section className="panel settings-panel"><div className="panel-head"><div><p className="eyebrow">Form management bar</p><h2>Edit Coordination Subject Outline</h2><p className="panel-description">Edit the form heading, subheading, and every dropdown option.</p></div></div><SettingsEditor settings={settings} onSave={onSettings} /></section></section>}{printSubmission && <PrintSubmission submission={printSubmission} />}{pdfPreview && <PdfPreview submission={pdfPreview} onClose={() => setPdfPreview(null)} />}</main>;
}

function AdminDashboardLegacy({ submissions, onStatus, onDelete, settings, onSettings }: { submissions: Submission[]; onStatus: (id: string, status: Status) => void; onDelete: (id: string) => void; settings: Settings; onSettings: (settings: Settings) => void }) { const [period, setPeriod] = useState('This week'); const [search, setSearch] = useState(''); const [editingOptions, setEditingOptions] = useState(false); const filtered = submissions.filter((submission) => `${submission.teacher_name} ${submission.option_one.subject} ${submission.option_one.grade}`.toLowerCase().includes(search.toLowerCase())); const reviewed = submissions.filter((item) => item.status === 'Reviewed').length; const downloadReport = (periodName: string) => { const rows = submissions.map((item) => `${item.submission_date},${item.teacher_name},${item.option_one.week},${item.option_one.grade},${item.option_one.subject},${item.status}`).join('\n'); const csv = `Date,Teacher,Week,Grade,Subject,Status\n${rows}`; const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); const link = document.createElement('a'); link.href = url; link.download = `subject-outline-${periodName.toLowerCase().replace(/ /g, '-')}.csv`; link.click(); URL.revokeObjectURL(url); }; return <main className="dashboard-page"><DashboardHeader eyebrow="Coordination team" title="Admin" sub="Review subject outlines and manage the teacher form." /><div className="admin-section-label">Status</div><div className="stat-grid"><Stat icon={<ClipboardList />} label="Total outlines" value={submissions.length} detail="All submitted plans" color="blue" /><Stat icon={<Clock3 />} label="Awaiting review" value={submissions.filter((item) => item.status === 'Pending').length} detail="Needs your attention" color="amber" /><Stat icon={<CheckCircle2 />} label="Reviewed" value={reviewed} detail={`${submissions.length ? Math.round(reviewed / submissions.length * 100) : 0}% of submissions`} color="green" /><Stat icon={<Users />} label="Teachers" value={new Set(submissions.map((item) => item.teacher_name)).size} detail="Active contributors" color="teal" /></div><div className="admin-section-label">Submissions & reports</div><div className="dashboard-grid"><section className="panel submissions-panel"><div className="panel-head"><div><p className="eyebrow">Submission inbox</p><h2>Subject outlines</h2></div><div className="panel-actions"><div className="search-box"><Search size={16} /><input placeholder="Search outlines" value={search} onChange={(event) => setSearch(event.target.value)} /></div><select value={period} onChange={(event) => setPeriod(event.target.value)}><option>Week 1</option><option>Week 2</option><option>Week 3</option><option>Week 4</option><option>Week 5</option><option>Week 6</option><option>Week 7</option><option>Week 8</option><option>Week 9</option><option>Week 10</option><option>Monthly</option><option>Yearly</option></select></div></div><div className="table-wrap"><table><thead><tr><th>Teacher</th><th>Teaching plans</th><th>Date</th><th>Status</th><th /></tr></thead><tbody>{filtered.map((submission) => <tr key={submission.id}><td><div className="teacher-cell"><span>{submission.teacher_name.split(' ').map((name) => name[0]).join('')}</span><strong>{submission.teacher_name}</strong></div></td><td><strong>{submission.option_one.grade}</strong><small>{submission.option_one.subject} · {submission.option_two ? '+ 1 more plan' : '1 plan'}</small></td><td>{new Date(submission.submission_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</td><td><select className={`status-select ${submission.status.replace(' ', '-').toLowerCase()}`} value={submission.status} onChange={(event) => onStatus(submission.id, event.target.value as Status)}><option>Pending</option><option>Reviewed</option><option>Needs update</option></select></td><td><button className="icon-button" onClick={() => onDelete(submission.id)} title="Remove submission"><Trash2 size={16} /></button></td></tr>)}</tbody></table>{filtered.length === 0 && <div className="empty-state">No outlines match your search.</div>}</div></section><section className="panel report-panel"><div className="panel-head"><div><p className="eyebrow">Reporting</p><h2>Report centre</h2></div><BarChart3 size={20} /></div><ReportRow label="Daily report" text="Today's submitted subject plans" onClick={() => downloadReport('daily')} /><ReportRow label="Weekly report" text="Generate a report for each week" onClick={() => downloadReport(period)} /><ReportRow label="Monthly report" text="Compare planning across the month" onClick={() => downloadReport('monthly')} /><ReportRow label="Yearly report" text="See the full academic picture" onClick={() => downloadReport('yearly')} /><button className="secondary-button full-button" onClick={() => downloadReport(period)}><Download size={16} /> Download report</button></section></div><div className="admin-section-label">Form management</div><section className="panel settings-panel"><div className="panel-head"><div><p className="eyebrow">Form management</p><h2>Form fields & options</h2><p className="panel-description">Keep the teacher form aligned with the current school programme.</p></div><button className="secondary-button" onClick={() => setEditingOptions(!editingOptions)}>{editingOptions ? <X size={16} /> : <Pencil size={16} />} {editingOptions ? 'Close editor' : 'Edit fields'}</button></div>{editingOptions ? <SettingsEditor settings={settings} onSave={(next) => { onSettings(next); setEditingOptions(false); }} /> : <div className="settings-chips"><OptionSummary title="Weeks" values={settings.weeks} /><OptionSummary title="Grades" values={settings.grades} /><OptionSummary title="Subjects" values={settings.subjects} /><OptionSummary title="Learning tasks" values={settings.tasks} /></div>}</section></main>; }

function DashboardHeader({ eyebrow, title, sub }: { eyebrow: string; title: string; sub: string }) { return <div className="dashboard-header"><div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p>{sub}</p></div><div className="header-date"><CalendarDays size={17} /> {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}</div></div>; }
function Stat({ icon, label, value, detail, color }: { icon: JSX.Element; label: string; value: number; detail: string; color: string }) { return <div className={`stat-card stat-${color}`}><div className="stat-icon">{icon}</div><div><span>{label}</span><strong>{value}</strong><small>{detail}</small></div></div>; }
function ReportMetric({ label, value }: { label: string; value: number }) { return <div className="report-metric"><span>{label}</span><strong>{value}</strong></div>; }
function ReportRow({ label, text, onClick }: { label: string; text: string; onClick: () => void }) { return <button className="report-row" onClick={onClick}><span className="report-icon"><FileText size={17} /></span><span><strong>{label}</strong><small>{text}</small></span><ArrowRight size={17} /></button>; }
function OptionSummary({ title, values }: { title: string; values: string[] }) { return <div className="option-summary"><div><strong>{title}</strong><span>{values.length} options</span></div><p>{values.slice(0, 4).join(' · ')}{values.length > 4 ? ' · …' : ''}</p></div>; }
function SettingsEditor({ settings, onSave }: { settings: Settings; onSave: (settings: Settings) => void }) { const [draft, setDraft] = useState(settings); const fields: { key: 'teachers' | 'weeks' | 'grades' | 'subjects' | 'tasks'; label: string }[] = [{ key: 'teachers', label: 'Teacher names' }, { key: 'weeks', label: 'Weeks' }, { key: 'grades', label: 'Grades' }, { key: 'subjects', label: 'Subjects' }, { key: 'tasks', label: 'Learning tasks' }]; const updateList = (key: 'teachers' | 'weeks' | 'grades' | 'subjects' | 'tasks', index: number, value: string) => setDraft({ ...draft, [key]: draft[key].map((item, itemIndex) => itemIndex === index ? value : item) }); const addOption = (key: 'teachers' | 'weeks' | 'grades' | 'subjects' | 'tasks') => setDraft({ ...draft, [key]: [...draft[key], 'New option'] }); const removeOption = (key: 'teachers' | 'weeks' | 'grades' | 'subjects' | 'tasks', index: number) => setDraft({ ...draft, [key]: draft[key].filter((_, itemIndex) => itemIndex !== index) }); return <div className="settings-editor"><label className="field"><span>Form heading</span><input value={draft.heading} onChange={(event) => setDraft({ ...draft, heading: event.target.value })} /></label><label className="field"><span>Form subheading</span><input value={draft.subheading} onChange={(event) => setDraft({ ...draft, subheading: event.target.value })} /></label>{fields.map((field) => <div className="option-editor" key={field.key}><div className="option-editor-heading"><strong>{field.label}</strong><button type="button" className="add-option" onClick={() => addOption(field.key)}><Plus size={14} /> Add option</button></div>{draft[field.key].map((value, index) => <div className="option-input" key={`${field.key}-${index}`}><input value={value} onChange={(event) => updateList(field.key, index, event.target.value)} /><button type="button" className="icon-button" onClick={() => removeOption(field.key, index)} title={`Remove ${field.label} option`}><Trash2 size={15} /></button></div>)}</div>)}<button className="primary-button" onClick={() => onSave(draft)}>Save form changes <Check size={16} /></button></div>; }

function SuperDashboard({ settings, submissions, onSignOut }: { settings: Settings; submissions: Submission[]; onSignOut: () => void }) { const [frequency, setFrequency] = useState('Weekly'); const [backups, setBackups] = useState<{ id: string; name: string; date: string; size: string }[]>([{ id: '1', name: 'coordination-week-40.json', date: '04 Oct 2026, 08:00', size: '12 KB' }, { id: '2', name: 'coordination-month-09.json', date: '01 Oct 2026, 08:00', size: '46 KB' }]); const [restoreFile, setRestoreFile] = useState<File | null>(null); const [passwordOpen, setPasswordOpen] = useState(false); const [newPassword, setNewPassword] = useState(''); const makeBackup = async () => { const name = `coordination-${new Date().toISOString().slice(0, 10)}.json`; const payload = { settings, submissions, createdAt: new Date().toISOString() }; setBackups((current) => [{ id: Date.now().toString(), name, date: 'Just now', size: `${Math.max(4, JSON.stringify(payload).length / 1000).toFixed(0)} KB` }, ...current]); if (supabase) await supabase.from('coordination_backups').insert({ backup_name: name, backup_frequency: frequency, backup_payload: payload }); }; const downloadBackup = (backup: { name: string }) => { const blob = new Blob([JSON.stringify({ settings, submissions, exportedAt: new Date().toISOString() }, null, 2)], { type: 'application/json' }); const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = backup.name; link.click(); URL.revokeObjectURL(url); }; const restore = async () => { if (!restoreFile) return; const payload = JSON.parse(await restoreFile.text()) as { settings?: Settings; submissions?: Submission[] }; if (payload.settings) localStorage.setItem('coordination-settings', JSON.stringify(payload.settings)); if (payload.submissions) localStorage.setItem('coordination-submissions', JSON.stringify(payload.submissions)); window.location.reload(); }; const changePassword = () => { if (newPassword.length < 6) return; localStorage.setItem('coordination-admin-credentials', JSON.stringify({ username: 'admin', password: newPassword })); setNewPassword(''); setPasswordOpen(false); }; return <main className="dashboard-page"><DashboardHeader eyebrow="System owner" title="Super admin control room" sub="Manage continuity, access, and the health of your school workspace." /><div className="security-banner"><div className="security-banner-icon"><ShieldCheck size={22} /></div><div><strong>Your workspace is protected</strong><p>Backup settings and system controls are only available to the super admin.</p></div><button className="text-button" onClick={onSignOut}><LogOut size={16} /> Sign out</button></div><div className="super-grid"><section className="panel backup-panel"><div className="panel-head"><div><p className="eyebrow">Data continuity</p><h2>Backup system</h2></div><Archive size={21} /></div><p className="panel-description">Keep a downloadable copy of your form settings and submitted subject outlines.</p><div className="frequency-row"><span>Automatic backup</span><select value={frequency} onChange={(event) => setFrequency(event.target.value)}><option>Daily</option><option>Weekly</option><option>Monthly</option></select></div><button className="primary-button full-button" onClick={makeBackup}><CloudDownload size={17} /> Create backup now</button><div className="backup-list">{backups.map((backup) => <div className="backup-row" key={backup.id}><div className="backup-file"><FileText size={17} /><span><strong>{backup.name}</strong><small>{backup.date} · {backup.size}</small></span></div><button className="icon-button" onClick={() => downloadBackup(backup)} title="Download backup"><Download size={16} /></button></div>)}</div></section><section className="panel restore-panel"><div className="panel-head"><div><p className="eyebrow">Recovery</p><h2>Restore workspace</h2></div><RefreshCw size={21} /></div><p className="panel-description">Restore a previously downloaded backup file from your device. Current records will remain available until you confirm the restore.</p><label className="upload-zone"><input type="file" accept=".json" onChange={(event) => setRestoreFile(event.target.files?.[0] || null)} /><CloudDownload size={24} /><strong>{restoreFile ? restoreFile.name : 'Choose a backup file'}</strong><span>JSON backup files only</span></label><div className="warning-note"><span>!</span><p>Restoring changes the workspace settings and records. Review the file before confirming.</p></div><button className="secondary-button full-button" disabled={!restoreFile} onClick={restore}><RefreshCw size={16} /> Restore selected backup</button></section></div><section className="panel access-panel"><div className="panel-head"><div><p className="eyebrow">Access management</p><h2>Security & access</h2></div><Settings2 size={20} /></div><div className="access-grid"><div className="access-item"><LockKeyhole size={18} /><div><strong>Admin password</strong><span>Last changed today</span></div><button className="text-button" onClick={() => setPasswordOpen(!passwordOpen)}>Change <ArrowRight size={15} /></button></div><div className="access-item"><ShieldCheck size={18} /><div><strong>Backup protection</strong><span>Download access restricted</span></div><span className="status-pill reviewed">Active</span></div><div className="access-item"><RefreshCw size={18} /><div><strong>Automatic schedule</strong><span>{frequency} backup enabled</span></div><span className="status-pill pending">{frequency}</span></div></div></section>{passwordOpen && <section className="panel password-panel"><div className="panel-head"><div><p className="eyebrow">Access management</p><h2>Change admin password</h2></div><button className="icon-button" onClick={() => setPasswordOpen(false)}><X size={16} /></button></div><div className="password-form"><label className="field"><span>New password</span><input type="password" minLength={6} value={newPassword} onChange={(event) => setNewPassword(event.target.value)} placeholder="At least 6 characters" /></label><button className="primary-button" onClick={changePassword} disabled={newPassword.length < 6}>Save password <Check size={16} /></button></div></section>}</main>; }

export default App;
