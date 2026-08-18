import React, { useState, useEffect } from 'react';
import { X, Save, Link, Building, MapPin, Phone, User, FileSpreadsheet, CheckCircle, LogOut } from 'lucide-react';
import { SenderConfig } from '../types';
import { signInWithGoogleSheets, signOutGoogle, createNewGoogleSheet, initGoogleAuth, getGoogleAccessToken } from '../services/googleSheetsApi';

interface SenderConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  sender: SenderConfig;
  webAppUrl: string;
  spreadsheetId: string;
  onSaveSender: (sender: SenderConfig) => void;
  onSaveWebAppUrl: (url: string) => void;
  onSaveSpreadsheetId: (id: string) => void;
  onShowToast: (type: 'success' | 'error', text: string) => void;
}

export const SenderConfigModal: React.FC<SenderConfigModalProps> = ({
  isOpen,
  onClose,
  sender,
  webAppUrl,
  spreadsheetId,
  onSaveSender,
  onSaveWebAppUrl,
  onSaveSpreadsheetId,
  onShowToast,
}) => {
  const [formData, setFormData] = useState<SenderConfig>(sender);
  const [url, setUrl] = useState<string>(webAppUrl);
  const [sheetId, setSheetId] = useState<string>(spreadsheetId);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isCreatingSheet, setIsCreatingSheet] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    setFormData(sender);
    setUrl(webAppUrl);
    setSheetId(spreadsheetId);
  }, [sender, webAppUrl, spreadsheetId, isOpen]);

  useEffect(() => {
    const unsubscribe = initGoogleAuth(
      (user) => setUserEmail(user.email || 'Đã đăng nhập Google'),
      () => setUserEmail(null)
    );
    return () => unsubscribe();
  }, []);

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    setIsSigningIn(true);
    try {
      const res = await signInWithGoogleSheets();
      if (res?.user) {
        setUserEmail(res.user.email || 'Đã đăng nhập Google');
        onShowToast('success', `Đăng nhập Google thành công (${res.user.email})!`);
      }
    } catch (err: any) {
      onShowToast('error', `Đăng nhập Google thất bại: ${err.message || err}`);
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleCreateNewSheet = async () => {
    const token = getGoogleAccessToken();
    if (!token) {
      try {
        const res = await signInWithGoogleSheets();
        if (!res?.accessToken) {
          onShowToast('error', 'Vui lòng đăng nhập Google trước khi tạo Sheet tự động.');
          return;
        }
      } catch (err) {
        onShowToast('error', 'Vui lòng đăng nhập Google để tiếp tục.');
        return;
      }
    }

    const currentToken = getGoogleAccessToken();
    if (!currentToken) {
      onShowToast('error', 'Không tìm thấy Google Access Token.');
      return;
    }

    setIsCreatingSheet(true);
    try {
      const newId = await createNewGoogleSheet(currentToken, 'Hồ Sơ BHXH - Quản Lý & In Hàng Loạt');
      setSheetId(newId);
      onSaveSpreadsheetId(newId);
      onShowToast('success', 'Đã tự động tạo Google Sheet mới thành công!');
    } catch (err: any) {
      onShowToast('error', `Lỗi tạo Google Sheet: ${err.message}`);
    } finally {
      setIsCreatingSheet(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSender(formData);
    onSaveWebAppUrl(url);
    onSaveSpreadsheetId(sheetId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto no-print">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-800">
              Cấu hình Thông Tin & Kết Nối Google Sheets
            </h2>
            <p className="text-xs text-slate-500">
              Đăng nhập Google API hoặc cấu hình Web App URL để lưu dữ liệu lên Google Sheets
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 pt-4">
          
          {/* Google Sheets OAuth API Integration */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-blue-900 flex items-center gap-1.5">
                <FileSpreadsheet className="w-4 h-4 text-blue-600" />
                Kết Nối Trực Tiếp Google Sheets (OAuth API):
              </label>
              {userEmail ? (
                <div className="flex items-center gap-2">
                  <span className="text-[11px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-emerald-600" />
                    {userEmail}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      signOutGoogle();
                      setUserEmail(null);
                      onShowToast('success', 'Đã đăng xuất Google.');
                    }}
                    className="text-[11px] text-rose-600 hover:text-rose-800 font-medium px-2 py-0.5"
                  >
                    Đăng xuất
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={isSigningIn}
                  className="gsi-material-button inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 transition cursor-pointer"
                >
                  <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-4 h-4">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                  </svg>
                  <span>{isSigningIn ? 'Đang kết nối...' : 'Đăng nhập Google'}</span>
                </button>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-semibold text-blue-800">
                  Google Spreadsheet ID (hoặc tự động tạo mới):
                </label>
                <button
                  type="button"
                  onClick={handleCreateNewSheet}
                  disabled={isCreatingSheet}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[11px] font-bold shadow-sm transition cursor-pointer disabled:opacity-50"
                >
                  {isCreatingSheet ? 'Đang tạo Sheet...' : '✨ Tự Động Tạo Google Sheet Mới'}
                </button>
              </div>
              <input
                type="text"
                value={sheetId}
                onChange={(e) => setSheetId(e.target.value)}
                placeholder="Ví dụ: 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
                className="w-full px-3 py-2 text-xs font-mono bg-white border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-800"
              />
              <p className="text-[11px] text-blue-700">
                Khi đăng nhập Google và có Spreadsheet ID, ứng dụng sẽ ghi dữ liệu trực tiếp vào Google Sheet của bạn khi bấm Lưu ở mọi nơi!
              </p>
            </div>
          </div>

          {/* Web App URL (Alternative / Backup) */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-amber-900 flex items-center gap-1.5">
                <Link className="w-4 h-4 text-amber-600" />
                Hoặc dùng Google Apps Script Web App URL:
              </label>
              <button
                type="button"
                onClick={() => {
                  const code = `function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);
    sheet.appendRow([
      new Date(),
      data.ma_ho_so || '',
      data.ten_don_vi || '',
      data.dia_chi || '',
      data.sdt || '',
      data.sl_to_roi || '',
      data.ghi_chu_to_roi || '',
      data.sl_bhyt || '',
      data.ghi_chu_bhyt || '',
      data.qd_hoan_tra || '',
      data.qd_thu_hoi || '',
      data.qd_huu_tri || '',
      data.sl_bia_so || '',
      data.ghi_chu_bia_so || ''
    ]);
    return ContentService.createTextOutput(JSON.stringify({ status: "success" })).setMimeType(ContentService.MimeType.JSON);
  } catch(error) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: error.toString() })).setMimeType(ContentService.MimeType.JSON);
  }
}`;
                  navigator.clipboard.writeText(code);
                  onShowToast('success', 'Đã sao chép mã Google Apps Script vào bộ nhớ tạm!');
                }}
                className="text-[11px] font-bold text-amber-900 hover:text-amber-950 bg-amber-200 hover:bg-amber-300 px-2.5 py-1 rounded-lg transition cursor-pointer"
              >
                📋 Sao chép mã Apps Script
              </button>
            </div>
            
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://script.google.com/macros/s/.../exec"
              className="w-full px-3 py-2 text-xs font-mono bg-white border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-slate-800"
            />
          </div>

          {/* Người giao hồ sơ */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 border-b border-slate-100 pb-1 flex items-center gap-1.5">
              <User className="w-4 h-4 text-orange-600" />
              Thông tin Người giao hồ sơ:
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Họ tên người giao:
                </label>
                <input
                  type="text"
                  value={formData.nguoi_giao}
                  onChange={(e) => setFormData({ ...formData, nguoi_giao: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Số điện thoại giao:
                </label>
                <input
                  type="text"
                  value={formData.sdt_giao}
                  onChange={(e) => setFormData({ ...formData, sdt_giao: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">
                  Tên đơn vị giao:
                </label>
                <input
                  type="text"
                  value={formData.ten_don_vi_giao}
                  onChange={(e) => setFormData({ ...formData, ten_don_vi_giao: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none font-medium"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">
                  Địa chỉ đơn vị giao:
                </label>
                <input
                  type="text"
                  value={formData.dia_chi_giao}
                  onChange={(e) => setFormData({ ...formData, dia_chi_giao: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">
                  Nội dung hồ sơ mặc định:
                </label>
                <input
                  type="text"
                  value={formData.noi_dung}
                  onChange={(e) => setFormData({ ...formData, noi_dung: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Người nhận và chuyển hồ sơ */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 border-b border-slate-100 pb-1 flex items-center gap-1.5">
              <Building className="w-4 h-4 text-blue-900" />
              Đơn vị vận chuyển / Bưu cục:
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Tên Bưu cục / Đơn vị chuyển:
                </label>
                <input
                  type="text"
                  value={formData.ten_don_vi_chuyen}
                  onChange={(e) => setFormData({ ...formData, ten_don_vi_chuyen: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  SĐT đơn vị chuyển:
                </label>
                <input
                  type="text"
                  value={formData.sdt_chuyen}
                  onChange={(e) => setFormData({ ...formData, sdt_chuyen: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">
                  Địa chỉ đơn vị chuyển:
                </label>
                <input
                  type="text"
                  value={formData.dia_chi_chuyen}
                  onChange={(e) => setFormData({ ...formData, dia_chi_chuyen: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">
                  Người ký xác nhận bưu điện:
                </label>
                <input
                  type="text"
                  value={formData.nguoi_ky_buu_dien}
                  onChange={(e) => setFormData({ ...formData, nguoi_ky_buu_dien: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none font-medium"
                />
              </div>
            </div>
          </div>

          {/* Footer buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold shadow-md transition cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Lưu Cấu Hình</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
