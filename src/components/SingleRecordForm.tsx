import React from 'react';
import { Save, RefreshCw, Hash, User, MapPin, Phone, FileText, PlusCircle, CheckCircle } from 'lucide-react';
import { ProfileRecord } from '../types';

interface SingleRecordFormProps {
  record: ProfileRecord;
  onChange: (field: keyof ProfileRecord, value: string) => void;
  onSaveAndClear: () => void;
  onClearForm: () => void;
  isSaving: boolean;
  editingIndex: number | null;
  onCancelEdit: () => void;
}

export const SingleRecordForm: React.FC<SingleRecordFormProps> = ({
  record,
  onChange,
  onSaveAndClear,
  onClearForm,
  isSaving,
  editingIndex,
  onCancelEdit,
}) => {
  return (
    <div className="bg-white rounded-2xl border-2 border-orange-500/60 shadow-lg p-6 space-y-5 no-print">
      
      {/* Form Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-orange-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
            1
          </div>
          <div>
            <h2 className="font-bold text-slate-900 text-lg flex items-center gap-2">
              Bảng Nhập Dữ Liệu Hồ Sơ
              {editingIndex !== null && (
                <span className="text-xs bg-blue-100 text-blue-900 px-2.5 py-0.5 rounded-full border border-blue-300 font-semibold">
                  Đang sửa Hồ sơ #{editingIndex + 1}
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-500">
              Nhập thông tin hồ sơ bên dưới, bấm Lưu để gửi Google Sheet & tự động trống form nhập tiếp
            </p>
          </div>
        </div>

        {editingIndex !== null && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="text-xs text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg font-medium transition cursor-pointer self-start sm:self-auto"
          >
            ✕ Hủy sửa (Nhập mới)
          </button>
        )}
      </div>

      {/* Main Recipient Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Mã hồ sơ */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
            <Hash className="w-3.5 h-3.5 text-orange-600" />
            Mã số hồ sơ:
          </label>
          <input
            type="text"
            value={record.ma_ho_so}
            onChange={(e) => onChange('ma_ho_so', e.target.value)}
            placeholder="Ví dụ: 0123456789"
            className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition font-medium"
          />
        </div>

        {/* Tên đơn vị / người nhận */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
            <User className="w-3.5 h-3.5 text-orange-600" />
            Tên đơn vị / Người nhận: <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={record.ten_don_vi}
            onChange={(e) => onChange('ten_don_vi', e.target.value)}
            placeholder="Ví dụ: CÔNG TY TNHH CAO DƯỢC LIỆU ĐỊNH SƠN"
            className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition font-semibold text-slate-900"
          />
        </div>

        {/* Địa chỉ */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-orange-600" />
            Địa chỉ người nhận:
          </label>
          <input
            type="text"
            value={record.dia_chi}
            onChange={(e) => onChange('dia_chi', e.target.value)}
            placeholder="Ví dụ: ĐỊNH SƠN, XÃ CAM LỘ, QUẢNG TRỊ"
            className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition font-medium"
          />
        </div>

        {/* Số điện thoại */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
            <Phone className="w-3.5 h-3.5 text-orange-600" />
            Số điện thoại:
          </label>
          <input
            type="text"
            value={record.sdt}
            onChange={(e) => onChange('sdt', e.target.value)}
            placeholder="Ví dụ: 0904161777"
            className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition font-medium"
          />
        </div>
      </div>

      {/* Detailed Document Checklist */}
      <div className="pt-2 border-t border-slate-100">
        <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <FileText className="w-4 h-4 text-orange-600" />
          Chi tiết giấy tờ kèm theo:
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {/* Tờ rời BHXH */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 grid grid-cols-3 gap-2">
            <div className="col-span-1">
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Tờ rời BHXH (SL)</label>
              <input
                type="text"
                value={record.sl_to_roi}
                onChange={(e) => onChange('sl_to_roi', e.target.value)}
                placeholder="SL"
                className="w-full px-2.5 py-1.5 text-sm bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-orange-500 outline-none font-semibold text-center"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Ghi chú tờ rời</label>
              <input
                type="text"
                value={record.ghi_chu_to_roi}
                onChange={(e) => onChange('ghi_chu_to_roi', e.target.value)}
                placeholder="Nội dung ghi chú"
                className="w-full px-2.5 py-1.5 text-sm bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-orange-500 outline-none"
              />
            </div>
          </div>

          {/* Thẻ BHYT */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 grid grid-cols-3 gap-2">
            <div className="col-span-1">
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Thẻ BHYT (SL)</label>
              <input
                type="text"
                value={record.sl_bhyt}
                onChange={(e) => onChange('sl_bhyt', e.target.value)}
                placeholder="SL"
                className="w-full px-2.5 py-1.5 text-sm bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-orange-500 outline-none font-semibold text-center"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Ghi chú BHYT</label>
              <input
                type="text"
                value={record.ghi_chu_bhyt}
                onChange={(e) => onChange('ghi_chu_bhyt', e.target.value)}
                placeholder="Nội dung ghi chú"
                className="w-full px-2.5 py-1.5 text-sm bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-orange-500 outline-none"
              />
            </div>
          </div>

          {/* QĐ hoàn trả */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">QĐ hoàn trả tiền đóng</label>
            <input
              type="text"
              value={record.qd_hoan_tra}
              onChange={(e) => onChange('qd_hoan_tra', e.target.value)}
              placeholder="Số QĐ / Nội dung"
              className="w-full px-2.5 py-1.5 text-sm bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-orange-500 outline-none"
            />
          </div>

          {/* QĐ thu hồi */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">QĐ thu hồi thẻ BHYT / Sổ BHXH</label>
            <input
              type="text"
              value={record.qd_thu_hoi}
              onChange={(e) => onChange('qd_thu_hoi', e.target.value)}
              placeholder="Số QĐ / Nội dung"
              className="w-full px-2.5 py-1.5 text-sm bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-orange-500 outline-none"
            />
          </div>

          {/* QĐ hưu trí */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">QĐ hưởng hưu trí / tuất / BHXH 1 lần</label>
            <input
              type="text"
              value={record.qd_huu_tri}
              onChange={(e) => onChange('qd_huu_tri', e.target.value)}
              placeholder="Số QĐ / Nội dung"
              className="w-full px-2.5 py-1.5 text-sm bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-orange-500 outline-none"
            />
          </div>

          {/* Bìa sổ BHXH */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 grid grid-cols-3 gap-2">
            <div className="col-span-1">
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Bìa sổ BHXH (SL)</label>
              <input
                type="text"
                value={record.sl_bia_so}
                onChange={(e) => onChange('sl_bia_so', e.target.value)}
                placeholder="SL"
                className="w-full px-2.5 py-1.5 text-sm bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-orange-500 outline-none font-semibold text-center"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Ghi chú bìa sổ</label>
              <input
                type="text"
                value={record.ghi_chu_bia_so}
                onChange={(e) => onChange('ghi_chu_bia_so', e.target.value)}
                placeholder="Nội dung ghi chú"
                className="w-full px-2.5 py-1.5 text-sm bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-orange-500 outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Form Action Buttons */}
      <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <button
          type="button"
          onClick={onClearForm}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer"
        >
          <RefreshCw className="w-4 h-4 text-slate-500" />
          <span>Xóa Trống Form</span>
        </button>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          {editingIndex !== null && (
            <button
              type="button"
              onClick={onCancelEdit}
              className="px-4 py-2 text-slate-500 hover:text-slate-800 font-medium transition cursor-pointer"
            >
              Hủy sửa
            </button>
          )}

          <button
            type="button"
            onClick={onSaveAndClear}
            disabled={isSaving}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white text-sm font-bold shadow-md shadow-orange-900/20 active:scale-98 transition cursor-pointer disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>Đang xử lý...</span>
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                <span>{editingIndex !== null ? 'CẬP NHẬT HỒ SƠ' : 'LƯU DỮ LIỆU & LÀM TRỐNG FORM'}</span>
              </>
            )}
          </button>
        </div>
      </div>

    </div>
  );
};
