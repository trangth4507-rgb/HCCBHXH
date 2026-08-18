import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { SingleRecordForm } from './components/SingleRecordForm';
import { SavedRecordsList } from './components/SavedRecordsList';
import { PrintDocument } from './components/PrintDocument';
import { DashboardView } from './components/DashboardView';
import { UserManagementView } from './components/UserManagementView';
import { SenderConfigModal } from './components/SenderConfigModal';
import { ProfileRecord, SenderConfig } from './types';
import { appendRecordToGoogleSheetApi, getGoogleAccessToken } from './services/googleSheetsApi';
import { Printer, Eye, Edit3, CheckCircle2, AlertCircle, FileSpreadsheet, BarChart3, Lock, LogIn, LogOut, User, Shield } from 'lucide-react';
import { collection, onSnapshot, setDoc, doc, getDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, db } from './firebase';
import { createNewUser } from './auth-utils';
import { Users } from 'lucide-react';
import { UserProfile } from './types';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

const INITIAL_SENDER: SenderConfig = {
  nguoi_giao: 'Trần Hà Trang',
  ten_don_vi_giao: 'Bảo hiểm xã hội cơ sở Đông Hà',
  dia_chi_giao: '86 Hoàng Diệu - Phường Đông Hà - Quảng Trị',
  sdt_giao: '2333666167',
  noi_dung: 'Trả kết quả hồ sơ đã giải quyết',
  
  nguoi_nhan_chuyen: 'Bưu cục vận hành Đông Hà',
  ten_don_vi_chuyen: 'Bưu cục vận hành Đông Hà',
  dia_chi_chuyen: '291 Lê Duẩn - Phường Nam Đông Hà - Quảng Trị',
  sdt_chuyen: '325.562.047',

  nguoi_ky_buu_dien: 'Ngô Ngọc Lai',
};

const BLANK_RECORD: ProfileRecord = {
  id: '',
  ma_ho_so: '',
  ten_don_vi: '',
  dia_chi: '',
  sdt: '',
  sl_to_roi: '',
  ghi_chu_to_roi: '',
  sl_bhyt: '',
  ghi_chu_bhyt: '',
  qd_hoan_tra: '',
  qd_thu_hoi: '',
  qd_huu_tri: '',
  sl_bia_so: '',
  ghi_chu_bia_so: '',
};

export default function App() {
  // Accumulated saved records for batch printing
  const [records, setRecords] = useState<ProfileRecord[]>([]);

  useEffect(() => {
    const pathForOnSnapshot = 'records';
    const q = query(collection(db, pathForOnSnapshot), orderBy('createdAt', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const recordsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ProfileRecord));
      setRecords(recordsData);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, pathForOnSnapshot);
    });

    return () => unsubscribe();
  }, []);

  // Single active input form state
  const [formRecord, setFormRecord] = useState<ProfileRecord>(BLANK_RECORD);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const [sender, setSender] = useState<SenderConfig>(() => {
    const saved = localStorage.getItem('bhxh_sender');
    return saved ? JSON.parse(saved) : INITIAL_SENDER;
  });

  const [webAppUrl, setWebAppUrl] = useState<string>(() => {
    return localStorage.getItem('bhxh_webapp_url') || 'DÁN_URL_WEB_APP_CỦA_BẠN_VÀO_ĐÂY';
  });

  const [googleSpreadsheetId, setGoogleSpreadsheetId] = useState<string>(() => {
    return localStorage.getItem('bhxh_spreadsheet_id') || '';
  });

  const [activeTab, setActiveTab] = useState<'edit' | 'preview' | 'dashboard' | 'users'>('edit');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setIsAuthenticated(true);
        try {
          const docRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data() as UserProfile;
            if (user.email === 'adminl@bhxh.local' && data.role !== 'admin') {
              data.role = 'admin';
              await setDoc(docRef, data);
            }
            setUserProfile(data);
          } else {
            // First time logic if needed
            const newProfile: UserProfile = {
              uid: user.uid,
              email: user.email || '',
              role: user.email === 'adminl@bhxh.local' ? 'admin' : 'user', // Default or admin if adminl
              createdAt: Date.now()
            };
            await setDoc(docRef, newProfile);
            setUserProfile(newProfile);
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
        }
      } else {
        setIsAuthenticated(false);
        setUserProfile(null);
        if (activeTab === 'users') {
          setActiveTab('edit');
        }
      }
      setIsAuthChecking(false);
    });
    return () => unsubscribe();
  }, [activeTab]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    const email = `${loginUsername}@bhxh.local`;
    
    try {
      await signInWithEmailAndPassword(auth, email, loginPassword);
      setLoginUsername('');
      setLoginPassword('');
    } catch (err: any) {
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        // Bootstrap super admin auto-creation
        if (loginUsername === 'adminl' && loginPassword === '78947894') {
          try {
            await createNewUser(loginUsername, loginPassword, 'admin');
            await signInWithEmailAndPassword(auth, email, loginPassword);
            setLoginUsername('');
            setLoginPassword('');
            return;
          } catch (createErr: any) {
            setLoginError('Lỗi khởi tạo Admin: ' + createErr.message);
            return;
          }
        }
      }
      setLoginError('Tài khoản hoặc mật khẩu không chính xác hoặc bạn cần cấu hình Firebase Authentication.');
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  useEffect(() => {
    localStorage.setItem('bhxh_sender', JSON.stringify(sender));
  }, [sender]);

  useEffect(() => {
    localStorage.setItem('bhxh_webapp_url', webAppUrl);
  }, [webAppUrl]);

  useEffect(() => {
    localStorage.setItem('bhxh_spreadsheet_id', googleSpreadsheetId);
  }, [googleSpreadsheetId]);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4500);
  };

  const handleFormFieldChange = (field: keyof ProfileRecord, value: string) => {
    setFormRecord((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Clear form fields
  const handleClearForm = () => {
    setFormRecord(BLANK_RECORD);
    setEditingIndex(null);
  };

  // Helper function to send single record payload to Google Sheet (API or Web App)
  const sendRecordToGoogleSheet = async (record: ProfileRecord) => {
    // 1. Try Google Sheets REST API if token & spreadsheetId are configured
    const accessToken = getGoogleAccessToken();
    if (googleSpreadsheetId && accessToken) {
      try {
        const success = await appendRecordToGoogleSheetApi(accessToken, googleSpreadsheetId, record);
        if (success) return { success: true, method: 'api' };
      } catch (err) {
        console.error('Google Sheets API error, falling back to Web App:', err);
      }
    }

    // 2. Fallback to Google Apps Script Web App URL
    if (!webAppUrl || webAppUrl.includes('DÁN_URL')) {
      return { success: false, reason: 'no_url' };
    }

    const payload = {
      ma_ho_so: record.ma_ho_so,
      ten_don_vi: record.ten_don_vi,
      dia_chi: record.dia_chi,
      sdt: record.sdt,
      sl_to_roi: record.sl_to_roi,
      ghi_chu_to_roi: record.ghi_chu_to_roi,
      sl_bhyt: record.sl_bhyt,
      ghi_chu_bhyt: record.ghi_chu_bhyt,
      qd_hoan_tra: record.qd_hoan_tra,
      qd_thu_hoi: record.qd_thu_hoi,
      qd_huu_tri: record.qd_huu_tri,
      sl_bia_so: record.sl_bia_so,
      ghi_chu_bia_so: record.ghi_chu_bia_so,
    };

    try {
      await fetch(webAppUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      return { success: true, method: 'webapp' };
    } catch (err) {
      console.error('Error sending row to Google Sheet:', err);
      return { success: false, reason: 'fetch_error' };
    }
  };

  // Save to Google Sheet AND reset form fields for next entry
  const handleSaveAndClear = async () => {
    if (!formRecord.ten_don_vi.trim() && !formRecord.ma_ho_so.trim()) {
      showToast('error', 'Vui lòng nhập Tên đơn vị hoặc Mã hồ sơ trước khi lưu!');
      return;
    }

    const recordId = formRecord.id || Date.now().toString();
    const recordToSave = {
      ...formRecord,
      id: recordId,
      createdAt: formRecord.createdAt || Date.now()
    };

    try {
      // 1. LUÔN LUÔN LƯU DỮ LIỆU LÊN DATABASE NGAY LẬP TỨC
      await setDoc(doc(db, 'records', recordId), recordToSave);
      
      // 2. LÀM TRỐNG FORM ĐỂ TIẾP TỤC NHẬP
      setFormRecord(BLANK_RECORD);
      setEditingIndex(null);
      
      // 3. ĐỒNG BỘ GOOGLE SHEET CÙNG LÚC ĐÓ
      setIsSaving(true);
      sendRecordToGoogleSheet(recordToSave).then((sheetResult) => {
        setIsSaving(false);
        if (sheetResult.success) {
          showToast('success', 'Đã lưu danh sách & đồng bộ Google Sheet thành công! Form đã xóa trống.');
        } else if (sheetResult.reason === 'no_url') {
          showToast('success', 'Đã lưu danh sách thành công! (Chưa đồng bộ do thiếu cấu hình Google Sheet ⚙️)');
        } else {
          showToast('error', 'Đã lưu danh sách thành công! Tuy nhiên gặp lỗi khi đồng bộ Google Sheet.');
        }
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'records');
    }
  };

  // Edit a saved record
  const handleEditRecord = (index: number) => {
    setFormRecord(records[index]);
    setEditingIndex(index);
    setActiveTab('edit');
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  // Remove a saved record
  const handleRemoveRecord = async (index: number) => {
    const recordToRemove = records[index];
    if (recordToRemove && recordToRemove.id) {
      await handleDeleteRecordById(recordToRemove.id, index);
    }
  };

  const handleDeleteRecordById = async (id: string, index?: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa hồ sơ này?')) {
      try {
        await deleteDoc(doc(db, 'records', id));
        showToast('success', 'Đã xóa hồ sơ thành công!');
        // If deleting the record we are currently editing
        if ((index !== undefined && editingIndex === index) || formRecord.id === id) {
          setFormRecord(BLANK_RECORD);
          setEditingIndex(null);
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, 'records');
      }
    }
  };

  // Clear all saved records
  const handleClearAllRecords = async () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa toàn bộ danh sách hồ sơ đã lưu không?')) {
      try {
        for (const record of records) {
          await deleteDoc(doc(db, 'records', record.id));
        }
        showToast('success', 'Đã xóa toàn bộ danh sách hồ sơ!');
        setFormRecord(BLANK_RECORD);
        setEditingIndex(null);
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, 'records');
      }
    }
  };

  // Bulk save all records to sheet
  const handleSaveAllToSheet = async () => {
    if (!webAppUrl || webAppUrl.includes('DÁN_URL')) {
      showToast('error', 'Vui lòng nhấn nút Bánh răng ⚙️ để nhập Google Web App URL trước!');
      setIsSettingsOpen(true);
      return;
    }

    if (records.length === 0) {
      showToast('error', 'Không có hồ sơ nào trong danh sách để lưu!');
      return;
    }

    setIsSaving(true);
    let successCount = 0;

    for (const r of records) {
      const res = await sendRecordToGoogleSheet(r);
      if (res.success) successCount++;
    }

    setIsSaving(false);
    showToast('success', `Đã hoàn thành gửi ${successCount}/${records.length} hồ sơ lên Google Sheet!`);
  };

  const handlePrintAll = () => {
    if (records.length === 0) {
      showToast('error', 'Chưa có hồ sơ nào trong danh sách để in. Hãy nhập dữ liệu và bấm Lưu trước!');
      return;
    }
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 font-sans antialiased flex flex-col">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 no-print animate-bounce">
          <div
            className={`flex items-center gap-2 px-4 py-3 rounded-xl shadow-xl text-xs font-semibold border ${
              toastMessage.type === 'success'
                ? 'bg-slate-900 text-orange-200 border-orange-500'
                : 'bg-rose-950 text-rose-100 border-rose-700'
            }`}
          >
            {toastMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-orange-400" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400" />
            )}
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* Header Bar */}
      <Header
        onAddRecord={handleClearForm}
        onSaveToSheet={handleSaveAllToSheet}
        onPrintAll={handlePrintAll}
        onOpenSettings={() => setIsSettingsOpen(true)}
        isSaving={isSaving}
        recordCount={records.length}
      />

      {/* Mode Switcher Bar */}
      <div className="bg-slate-900 text-white border-b border-slate-800 no-print sticky top-[71px] z-20 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-4">
          
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('edit')}
              className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeTab === 'edit'
                  ? 'bg-orange-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Nhập dữ liệu</span>
            </button>

            <button
              onClick={() => setActiveTab('preview')}
              className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeTab === 'preview'
                  ? 'bg-blue-900 text-white shadow-md border border-blue-700/50'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Giấy giao nhận</span>
            </button>

            <button
              onClick={() => setActiveTab('dashboard')}
              className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-emerald-700 text-white shadow-md border border-emerald-500/50'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 text-emerald-300" />
              <span>Tổng hợp</span>
            </button>

            {userProfile?.role === 'admin' && (
              <button
                onClick={() => setActiveTab('users')}
                className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  activeTab === 'users'
                    ? 'bg-purple-700 text-white shadow-md border border-purple-500/50'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Users className="w-3.5 h-3.5 text-purple-300" />
                <span>Quản lý User</span>
              </button>
            )}
          </div>

        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* EDIT MODE */}
        {activeTab === 'edit' && (
          <div className="space-y-6 no-print">
            
            {isAuthChecking ? (
              <div className="flex justify-center p-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
              </div>
            ) : !isAuthenticated ? (
              <div className="max-w-md mx-auto mt-10 bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
                <div className="bg-slate-900 px-6 py-8 text-center border-b border-slate-800 relative">
                  <div className="absolute top-0 left-0 w-full h-1 bg-orange-500"></div>
                  <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-700 shadow-inner">
                    <Lock className="w-8 h-8 text-orange-400" />
                  </div>
                  <h2 className="text-xl font-bold text-white mb-1">Xác thực quyền truy cập</h2>
                  <p className="text-sm text-slate-400">Bạn cần đăng nhập để nhập dữ liệu hồ sơ.</p>
                </div>
                
                <form onSubmit={handleLogin} className="p-6 space-y-5">
                  {loginError && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm flex items-start gap-2 shadow-sm">
                      <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                      <span>{loginError}</span>
                    </div>
                  )}
                  
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      Tài khoản
                    </label>
                    <input
                      type="text"
                      required
                      value={loginUsername}
                      onChange={e => setLoginUsername(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition outline-none"
                      placeholder="Nhập tên tài khoản..."
                    />
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-slate-400" />
                      Mật khẩu
                    </label>
                    <input
                      type="password"
                      required
                      value={loginPassword}
                      onChange={e => setLoginPassword(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition outline-none"
                      placeholder="Nhập mật khẩu..."
                    />
                  </div>
                  
                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg text-sm shadow-md transition flex items-center justify-center gap-2"
                    >
                      <LogIn className="w-4 h-4" />
                      <span>Đăng Nhập Ngay</span>
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <>
                {/* Banner explaining the single-form workflow */}
                <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 border border-orange-500/40 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md text-white">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-orange-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                      <FileSpreadsheet className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-orange-400">
                        Quy trình 1 Bảng Nhập Liệu Tự Động:
                      </h3>
                      <p className="text-xs text-slate-300 mt-0.5">
                        Nhập thông tin 1 hồ sơ → Bấm <strong>"LƯU GOOGLE SHEET & LÀM TRỐNG FORM"</strong> → Dữ liệu gửi lên Sheet, đồng thời tự động tích lũy vào danh sách bên dưới để <strong>IN HÀNG LOẠT</strong>!
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={handleLogout}
                      className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition cursor-pointer border border-slate-700 shadow-sm flex items-center gap-1.5 mr-2"
                      title="Đăng xuất"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Đăng xuất</span>
                    </button>
                    
                    {records.length > 0 && (
                      <button
                        onClick={handlePrintAll}
                        className="px-3.5 py-1.5 rounded-lg bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold transition cursor-pointer border border-blue-700/60 shadow-sm flex items-center gap-1"
                      >
                        <Printer className="w-3.5 h-3.5 text-orange-400" />
                        <span>In Hàng Loạt ({records.length})</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* SINGLE FORM COMPONENT */}
                <SingleRecordForm
                  record={formRecord}
                  onChange={handleFormFieldChange}
                  onSaveAndClear={handleSaveAndClear}
                  onClearForm={handleClearForm}
                  isSaving={isSaving}
                  editingIndex={editingIndex}
                  onCancelEdit={handleClearForm}
                />

                {/* ACCUMULATED SAVED RECORDS LIST */}
                <SavedRecordsList
                  records={records}
                  onEditRecord={handleEditRecord}
                  onRemoveRecord={handleRemoveRecord}
                  onClearAllRecords={handleClearAllRecords}
                  onPrintAll={handlePrintAll}
                  onSwitchToPreview={() => setActiveTab('preview')}
                  isAdmin={userProfile?.role === 'admin'}
                />
              </>
            )}
          </div>
        )}

        {/* PREVIEW MODE */}
        {activeTab === 'preview' && (
          <div className="space-y-6 no-print">
            <div className="flex items-center justify-between bg-slate-900 text-white p-4 rounded-xl border border-slate-800 shadow-md">
              <div>
                <h2 className="text-sm font-bold text-orange-400">
                  Xem Trước {records.length} Mẫu Giấy Giao Nhận BHXH (Khổ A4)
                </h2>
              </div>

              <button
                onClick={handlePrintAll}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-900 hover:bg-blue-800 text-white text-xs font-semibold shadow-sm cursor-pointer border border-blue-700/50"
              >
                <Printer className="w-4 h-4 text-orange-400" />
                <span>In Ngay Tất Cả ({records.length})</span>
              </button>
            </div>

            {records.length === 0 ? (
              <div className="bg-white p-12 text-center rounded-2xl border border-dashed border-slate-300">
                <p className="text-slate-500 font-medium">Chưa có hồ sơ nào để xem. Hãy chuyển sang phần Nhập dữ liệu để bắt đầu!</p>
              </div>
            ) : (
              /* List of printable cards */
              <div className="space-y-8 bg-slate-300 p-6 rounded-2xl border border-slate-400">
                {records.map((record) => (
                  <PrintDocument key={record.id} record={record} sender={sender} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* DASHBOARD MODE */}
        {activeTab === 'dashboard' && (
          <div className="no-print">
            <DashboardView 
              records={records} 
              onDeleteRecord={handleDeleteRecordById}
              isAdmin={userProfile?.role === 'admin'}
            />
          </div>
        )}

        {/* USERS MANAGEMENT MODE */}
        {activeTab === 'users' && userProfile?.role === 'admin' && (
          <div className="no-print">
            <UserManagementView />
          </div>
        )}

      </main>

      {/* ALWAYS RENDER PRINT-ONLY AREA FOR BROWSER PRINT DIALOG */}
      <div className="hidden print:block print-only">
        {records.map((record, idx) => (
          <div key={record.id} className={idx < records.length - 1 ? 'page-break' : ''}>
            <PrintDocument record={record} sender={sender} />
          </div>
        ))}
      </div>

      {/* Modals */}
      <SenderConfigModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        sender={sender}
        webAppUrl={webAppUrl}
        spreadsheetId={googleSpreadsheetId}
        onSaveSender={setSender}
        onSaveWebAppUrl={setWebAppUrl}
        onSaveSpreadsheetId={setGoogleSpreadsheetId}
        onShowToast={showToast}
      />

    </div>
  );
}
