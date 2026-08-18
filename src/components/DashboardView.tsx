import React, { useState } from 'react';
import { ProfileRecord } from '../types';
import { Calendar, Building2, FileText, Layers, FileSpreadsheet, ArrowDown, Eye, X, Trash2 } from 'lucide-react';

interface DashboardViewProps {
  records: ProfileRecord[];
  onDeleteRecord?: (id: string) => void;
  isAdmin?: boolean;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ records, onDeleteRecord, isAdmin = false }) => {
  const [selectedRecord, setSelectedRecord] = useState<ProfileRecord | null>(null);
  // Helper to extract formatted date from record id (timestamp) or fallback
  const getRecordDate = (r: ProfileRecord): string => {
    if (r.id && !isNaN(Number(r.id))) {
      const d = new Date(Number(r.id));
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString('vi-VN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        });
      }
    }
    return new Date().toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  // Group records by submission date
  const groupedByDate: { [date: string]: ProfileRecord[] } = {};
  records.forEach((r) => {
    const dateStr = getRecordDate(r);
    if (!groupedByDate[dateStr]) {
      groupedByDate[dateStr] = [];
    }
    groupedByDate[dateStr].push(r);
  });

  // Sort dates (newest or oldest first - let's sort chronologically or reverse chronologically, e.g. latest date on top or bottom as requested: "lần lượt từ trên xuống dưới")
  const sortedDates = Object.keys(groupedByDate).sort((a, b) => {
    // parse DD/MM/YYYY for sorting if possible, or keep natural order
    const partsA = a.split('/');
    const partsB = b.split('/');
    if (partsA.length === 3 && partsB.length === 3) {
      const timeA = new Date(Number(partsA[2]), Number(partsA[1]) - 1, Number(partsA[0])).getTime();
      const timeB = new Date(Number(partsB[2]), Number(partsB[1]) - 1, Number(partsB[0])).getTime();
      return timeB - timeA; // Newest first, or oldest first? "lần lượt từ trên xuống dưới"
    }
    return 0;
  });

  const totalRecords = records.length;
  const totalToRoi = records.reduce((acc, r) => acc + (parseInt(r.sl_to_roi) || 0), 0);
  const totalBhyt = records.reduce((acc, r) => acc + (parseInt(r.sl_bhyt) || 0), 0);
  const totalBiaSo = records.reduce((acc, r) => acc + (parseInt(r.sl_bia_so) || 0), 0);

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-md border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-orange-400 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Bảng Danh Sách Hồ Sơ Phân Loại Theo Ngày Gửi
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Tổng hợp toàn bộ hồ sơ đã lưu, được phân loại theo ngày gửi lần lượt từ trên xuống dưới.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-slate-800 px-4 py-2 rounded-xl border border-slate-700 text-xs font-semibold text-orange-200">
            Tổng số hồ sơ: <span className="text-white font-bold text-sm ml-1">{totalRecords}</span>
          </div>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Tổng Hồ Sơ</p>
            <h4 className="text-xl font-bold text-slate-900 mt-0.5">{totalRecords}</h4>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Tổng Số Ngày Gửi</p>
            <h4 className="text-xl font-bold text-slate-900 mt-0.5">{sortedDates.length}</h4>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Tổng SL Tờ Rời</p>
            <h4 className="text-xl font-bold text-slate-900 mt-0.5">{totalToRoi}</h4>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Tổng SL BHYT</p>
            <h4 className="text-xl font-bold text-slate-900 mt-0.5">{totalBhyt}</h4>
          </div>
        </div>
      </div>

      {/* Main Categorized List Table */}
      {records.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-dashed border-slate-300">
          <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mx-auto mb-3">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">Chưa có hồ sơ nào được lưu</h3>
          <p className="text-xs text-slate-500 mt-1">
            Hãy nhập liệu và lưu hồ sơ để hiển thị danh sách phân loại theo ngày gửi tại đây.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {sortedDates.map((dateStr) => {
            const dateRecords = groupedByDate[dateStr];
            return (
              <div key={dateStr} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                {/* Date Category Header */}
                <div className="bg-slate-100 px-6 py-3.5 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-orange-600" />
                    <span className="text-xs font-bold uppercase tracking-wide text-slate-800">
                      Ngày gửi: {dateStr}
                    </span>
                  </div>
                  <span className="bg-orange-100 text-orange-800 text-[11px] font-bold px-2.5 py-1 rounded-full">
                    {dateRecords.length} hồ sơ
                  </span>
                </div>

                {/* Table for this date */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider border-b border-slate-200">
                      <tr>
                        <th className="py-3 px-4 text-center w-12">STT</th>
                        <th className="py-3 px-4">Mã Hồ Sơ</th>
                        <th className="py-3 px-4">Tên Đơn Vị / Người Nhận</th>
                        <th className="py-3 px-4">Địa Chỉ & SĐT</th>
                        <th className="py-3 px-4">Giấy Tờ Kèm Theo</th>
                        <th className="py-3 px-4 text-right">Chi Tiết</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {dateRecords.map((r, idx) => (
                        <tr 
                          key={r.id || idx} 
                          className="hover:bg-orange-50/50 transition cursor-pointer"
                          onClick={() => setSelectedRecord(r)}
                        >
                          <td className="py-3 px-4 text-center font-bold text-orange-600">
                            #{idx + 1}
                          </td>
                          <td className="py-3 px-4 font-mono text-slate-600">
                            {r.ma_ho_so || '—'}
                          </td>
                          <td className="py-3 px-4 font-bold text-slate-900 uppercase">
                            {r.ten_don_vi || '—'}
                          </td>
                          <td className="py-3 px-4 text-slate-600">
                            <div>{r.dia_chi || '—'}</div>
                            {r.sdt && <div className="text-[11px] font-semibold text-orange-600 mt-0.5">{r.sdt}</div>}
                          </td>
                          <td className="py-3 px-4 text-slate-500 text-[11px]">
                            <div className="flex flex-wrap gap-1">
                              {r.sl_to_roi && <span className="bg-slate-100 text-orange-700 px-1.5 py-0.5 rounded font-medium">Tờ rời: {r.sl_to_roi}</span>}
                              {r.sl_bhyt && <span className="bg-slate-100 text-blue-700 px-1.5 py-0.5 rounded font-medium">BHYT: {r.sl_bhyt}</span>}
                              {r.sl_bia_so && <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-medium">Bìa sổ: {r.sl_bia_so}</span>}
                              {r.qd_hoan_tra && <span className="bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded font-medium">QĐ HT</span>}
                              {r.qd_thu_hoi && <span className="bg-rose-50 text-rose-700 px-1.5 py-0.5 rounded font-medium">QĐ TH</span>}
                              {r.qd_huu_tri && <span className="bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-medium">QĐ Hưu trí</span>}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button 
                                className="p-1.5 text-slate-400 hover:text-orange-600 hover:bg-orange-100 rounded-lg transition"
                                onClick={(e) => { e.stopPropagation(); setSelectedRecord(r); }}
                                title="Xem chi tiết"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              {isAdmin && onDeleteRecord && (
                                <button 
                                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-100 rounded-lg transition"
                                  onClick={(e) => { 
                                    e.stopPropagation(); 
                                    if(r.id) onDeleteRecord(r.id); 
                                  }}
                                  title="Xóa hồ sơ này"
                                >
                                  <Trash2 className="w-4 h-4" />
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
          })}
        </div>
      )}

      {/* Record Detail Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <FileText className="w-5 h-5 text-orange-600" />
                Chi Tiết Hồ Sơ
              </h3>
              <button 
                onClick={() => setSelectedRecord(null)}
                className="text-slate-400 hover:text-slate-600 bg-slate-200/50 hover:bg-slate-200 p-1.5 rounded-full transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Mã hồ sơ</p>
                  <p className="font-mono text-sm text-slate-800 font-medium">{selectedRecord.ma_ho_so || '—'}</p>
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Tên đơn vị</p>
                  <p className="text-sm font-bold text-slate-900">{selectedRecord.ten_don_vi || '—'}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Địa chỉ</p>
                  <p className="text-sm text-slate-800">{selectedRecord.dia_chi || '—'}</p>
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Số điện thoại</p>
                  <p className="text-sm text-slate-800 font-medium">{selectedRecord.sdt || '—'}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3">Tài liệu kèm theo</h4>
                <div className="space-y-3">
                  {(selectedRecord.sl_to_roi || selectedRecord.ghi_chu_to_roi) && (
                    <div className="bg-orange-50/50 p-3 rounded-xl border border-orange-100/50">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-semibold text-orange-800 text-sm">Tờ rời</span>
                        <span className="bg-white px-2 py-0.5 rounded text-xs font-bold text-orange-600 shadow-sm border border-orange-100">SL: {selectedRecord.sl_to_roi || 0}</span>
                      </div>
                      {selectedRecord.ghi_chu_to_roi && <p className="text-xs text-slate-600 mt-1">{selectedRecord.ghi_chu_to_roi}</p>}
                    </div>
                  )}

                  {(selectedRecord.sl_bhyt || selectedRecord.ghi_chu_bhyt) && (
                    <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-100/50">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-semibold text-blue-800 text-sm">Thẻ BHYT</span>
                        <span className="bg-white px-2 py-0.5 rounded text-xs font-bold text-blue-600 shadow-sm border border-blue-100">SL: {selectedRecord.sl_bhyt || 0}</span>
                      </div>
                      {selectedRecord.ghi_chu_bhyt && <p className="text-xs text-slate-600 mt-1">{selectedRecord.ghi_chu_bhyt}</p>}
                    </div>
                  )}

                  {(selectedRecord.sl_bia_so || selectedRecord.ghi_chu_bia_so) && (
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-semibold text-slate-700 text-sm">Bìa sổ BHXH</span>
                        <span className="bg-white px-2 py-0.5 rounded text-xs font-bold text-slate-600 shadow-sm border border-slate-200">SL: {selectedRecord.sl_bia_so || 0}</span>
                      </div>
                      {selectedRecord.ghi_chu_bia_so && <p className="text-xs text-slate-600 mt-1">{selectedRecord.ghi_chu_bia_so}</p>}
                    </div>
                  )}

                  {selectedRecord.qd_hoan_tra && (
                    <div className="bg-amber-50/50 p-3 rounded-xl border border-amber-100/50">
                      <span className="font-semibold text-amber-800 text-sm block mb-1">QĐ hoàn trả</span>
                      <p className="text-xs text-slate-600">{selectedRecord.qd_hoan_tra}</p>
                    </div>
                  )}

                  {selectedRecord.qd_thu_hoi && (
                    <div className="bg-rose-50/50 p-3 rounded-xl border border-rose-100/50">
                      <span className="font-semibold text-rose-800 text-sm block mb-1">QĐ thu hồi</span>
                      <p className="text-xs text-slate-600">{selectedRecord.qd_thu_hoi}</p>
                    </div>
                  )}

                  {selectedRecord.qd_huu_tri && (
                    <div className="bg-emerald-50/50 p-3 rounded-xl border border-emerald-100/50">
                      <span className="font-semibold text-emerald-800 text-sm block mb-1">QĐ hưu trí</span>
                      <p className="text-xs text-slate-600">{selectedRecord.qd_huu_tri}</p>
                    </div>
                  )}
                  
                  {!selectedRecord.sl_to_roi && !selectedRecord.ghi_chu_to_roi && !selectedRecord.sl_bhyt && !selectedRecord.ghi_chu_bhyt && !selectedRecord.sl_bia_so && !selectedRecord.ghi_chu_bia_so && !selectedRecord.qd_hoan_tra && !selectedRecord.qd_thu_hoi && !selectedRecord.qd_huu_tri && (
                    <p className="text-sm text-slate-400 italic text-center py-4">Không có giấy tờ kèm theo.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
