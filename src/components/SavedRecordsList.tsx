import React from 'react';
import { Printer, Eye, Edit3, Trash2, FileSpreadsheet, PlusCircle } from 'lucide-react';
import { ProfileRecord } from '../types';

interface SavedRecordsListProps {
  records: ProfileRecord[];
  onEditRecord: (index: number) => void;
  onRemoveRecord: (index: number) => void;
  onClearAllRecords: () => void;
  onPrintAll: () => void;
  onSwitchToPreview: () => void;
  isAdmin?: boolean;
}

export const SavedRecordsList: React.FC<SavedRecordsListProps> = ({
  records,
  onEditRecord,
  onRemoveRecord,
  onClearAllRecords,
  onPrintAll,
  onSwitchToPreview,
  isAdmin = false,
}) => {
  if (records.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-8 text-center space-y-3 no-print">
        <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mx-auto">
          <FileSpreadsheet className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-800">
          Chưa có hồ sơ nào trong danh sách in
        </h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Nhập thông tin ở bảng phía trên và bấm <strong>"LƯU GOOGLE SHEET & LÀM TRỐNG FORM"</strong> để lưu và tích lũy các hồ sơ cho việc in hàng loạt.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 text-white rounded-2xl border border-slate-800 shadow-xl p-5 space-y-4 no-print">
      
      {/* List Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <h3 className="text-base font-bold text-orange-400 flex items-center gap-2">
            <span>Danh Sách Hồ Sơ Đã Lưu Đang Chờ In ({records.length} hồ sơ)</span>
          </h3>
          <p className="text-xs text-slate-400">
            Tất cả các hồ sơ bên dưới sẽ được in cùng lúc khi bấm nút In Hàng Loạt
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onSwitchToPreview}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition cursor-pointer"
          >
            <Eye className="w-4 h-4 text-orange-400" />
            <span>Xem Giấy giao nhận A4</span>
          </button>

          <button
            onClick={onPrintAll}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold transition shadow-md border border-blue-700/60 cursor-pointer active:scale-95"
          >
            <Printer className="w-4 h-4 text-orange-400" />
            <span>IN TẤT CẢ ({records.length} MẪU)</span>
          </button>

          {isAdmin && (
            <button
              onClick={onClearAllRecords}
              className="text-xs text-slate-400 hover:text-rose-400 px-2.5 py-2 rounded-lg transition cursor-pointer"
              title="Xóa danh sách này để bắt đầu đợt nhập mới"
            >
              Xóa danh sách
            </button>
          )}
        </div>
      </div>

      {/* Table of Records */}
      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-900 text-orange-400 font-bold uppercase tracking-wider border-b border-slate-800">
            <tr>
              <th className="py-3 px-3 text-center w-12">STT</th>
              <th className="py-3 px-3">Mã Hồ Sơ</th>
              <th className="py-3 px-3">Tên Đơn Vị / Người Nhận</th>
              <th className="py-3 px-3">Địa Chỉ & SĐT</th>
              <th className="py-3 px-3">Giấy Tờ Kèm Theo</th>
              <th className="py-3 px-3 text-center w-28">Thao Tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-200">
            {records.map((r, idx) => (
              <tr key={r.id || idx} className="hover:bg-slate-900/80 transition">
                <td className="py-3 px-3 text-center font-bold text-orange-400">
                  #{idx + 1}
                </td>
                <td className="py-3 px-3 font-mono text-slate-300">
                  {r.ma_ho_so || '—'}
                </td>
                <td className="py-3 px-3 font-bold text-white uppercase max-w-[220px] truncate" title={r.ten_don_vi}>
                  {r.ten_don_vi || '—'}
                </td>
                <td className="py-3 px-3 text-slate-300 max-w-[200px]">
                  <div className="truncate" title={r.dia_chi}>{r.dia_chi || '—'}</div>
                  {r.sdt && <div className="text-[11px] text-orange-300 font-semibold">{r.sdt}</div>}
                </td>
                <td className="py-3 px-3 text-slate-400 text-[11px]">
                  <div className="flex flex-wrap gap-1">
                    {r.sl_to_roi && <span className="bg-slate-800 text-orange-300 px-1.5 py-0.5 rounded">Tờ rời: {r.sl_to_roi}</span>}
                    {r.sl_bhyt && <span className="bg-slate-800 text-blue-300 px-1.5 py-0.5 rounded">BHYT: {r.sl_bhyt}</span>}
                    {r.sl_bia_so && <span className="bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded">Bìa sổ: {r.sl_bia_so}</span>}
                    {r.qd_hoan_tra && <span className="bg-slate-800 text-amber-300 px-1.5 py-0.5 rounded">QĐ HT</span>}
                    {r.qd_thu_hoi && <span className="bg-slate-800 text-rose-300 px-1.5 py-0.5 rounded">QĐ TH</span>}
                    {r.qd_huu_tri && <span className="bg-slate-800 text-emerald-300 px-1.5 py-0.5 rounded">QĐ HT/BHXH1L</span>}
                  </div>
                </td>
                <td className="py-3 px-3 text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    <button
                      onClick={() => onEditRecord(idx)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-orange-600 text-slate-200 hover:text-white transition cursor-pointer"
                      title="Sửa hồ sơ này"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    {isAdmin && (
                      <button
                        onClick={() => onRemoveRecord(idx)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white transition cursor-pointer"
                        title="Xóa hồ sơ này khỏi danh sách in"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
};
