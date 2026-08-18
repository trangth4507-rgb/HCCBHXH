import React from 'react';
import { Trash2, Copy, FileText, User, MapPin, Phone, Hash } from 'lucide-react';
import { ProfileRecord } from '../types';

interface RecordFormProps {
  record: ProfileRecord;
  index: number;
  onUpdate: (updated: ProfileRecord) => void;
  onRemove: () => void;
  onDuplicate: () => void;
}

export const RecordForm: React.FC<RecordFormProps> = ({
  record,
  index,
  onUpdate,
  onRemove,
  onDuplicate,
}) => {
  const handleChange = (field: keyof ProfileRecord, value: string) => {
    onUpdate({
      ...record,
      [field]: value,
    });
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition p-5 space-y-4 no-print relative">
      {/* Header of Item */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-orange-100 text-orange-900 border border-orange-200 text-xs font-bold flex items-center justify-center">
            #{index + 1}
          </span>
          <h3 className="font-bold text-slate-900 text-base">
            Phiếu hồ sơ BHXH {record.ma_ho_so ? `— ${record.ma_ho_so}` : ''}
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onDuplicate}
            className="p-1.5 text-slate-600 hover:text-blue-900 hover:bg-slate-100 rounded-lg text-xs font-medium flex items-center gap-1 transition cursor-pointer"
            title="Nhân bản hồ sơ này"
          >
            <Copy className="w-4 h-4" />
            <span className="hidden sm:inline">Nhân bản</span>
          </button>
          
          <button
            onClick={onRemove}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-medium flex items-center gap-1 transition cursor-pointer"
            title="Xóa hồ sơ này"
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline">Xóa</span>
          </button>
        </div>
      </div>

      {/* Primary Recipient Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Mã hồ sơ */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
            <Hash className="w-3.5 h-3.5 text-orange-600" />
            Mã số hồ sơ:
          </label>
          <input
            type="text"
            value={record.ma_ho_so}
            onChange={(e) => handleChange('ma_ho_so', e.target.value)}
            placeholder="Ví dụ: 0123456789"
            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition"
          />
        </div>

        {/* Tên đơn vị / người nhận */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
            <User className="w-3.5 h-3.5 text-orange-600" />
            Tên đơn vị / Người nhận:
          </label>
          <input
            type="text"
            value={record.ten_don_vi}
            onChange={(e) => handleChange('ten_don_vi', e.target.value)}
            placeholder="Ví dụ: CÔNG TY TNHH ABC"
            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition font-medium"
          />
        </div>

        {/* Địa chỉ */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-orange-600" />
            Địa chỉ người nhận:
          </label>
          <input
            type="text"
            value={record.dia_chi}
            onChange={(e) => handleChange('dia_chi', e.target.value)}
            placeholder="Ví dụ: 123 Lê Lợi, Phường 1, Quảng Trị"
            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition"
          />
        </div>

        {/* Số điện thoại */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
            <Phone className="w-3.5 h-3.5 text-orange-600" />
            Số điện thoại:
          </label>
          <input
            type="text"
            value={record.sdt}
            onChange={(e) => handleChange('sdt', e.target.value)}
            placeholder="Ví dụ: 0904161777"
            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition"
          />
        </div>
      </div>

      {/* Details of Documents */}
      <div className="pt-2">
        <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 flex items-center gap-1">
          <FileText className="w-3.5 h-3.5 text-orange-600" />
          Chi tiết giấy tờ kèm theo:
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
          
          {/* Tờ rời */}
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-1">
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                SL Tờ rời:
              </label>
              <input
                type="number"
                value={record.sl_to_roi}
                onChange={(e) => handleChange('sl_to_roi', e.target.value)}
                placeholder="SL"
                className="w-full px-2.5 py-1.5 text-sm bg-white border border-slate-300 rounded focus:ring-1 focus:ring-orange-500 outline-none"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Ghi chú tờ rời:
              </label>
              <input
                type="text"
                value={record.ghi_chu_to_roi}
                onChange={(e) => handleChange('ghi_chu_to_roi', e.target.value)}
                placeholder="Nội dung ghi chú"
                className="w-full px-2.5 py-1.5 text-sm bg-white border border-slate-300 rounded focus:ring-1 focus:ring-orange-500 outline-none"
              />
            </div>
          </div>

          {/* Thẻ BHYT */}
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-1">
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                SL Thẻ BHYT:
              </label>
              <input
                type="number"
                value={record.sl_bhyt}
                onChange={(e) => handleChange('sl_bhyt', e.target.value)}
                placeholder="SL"
                className="w-full px-2.5 py-1.5 text-sm bg-white border border-slate-300 rounded focus:ring-1 focus:ring-orange-500 outline-none"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Ghi chú thẻ BHYT:
              </label>
              <input
                type="text"
                value={record.ghi_chu_bhyt}
                onChange={(e) => handleChange('ghi_chu_bhyt', e.target.value)}
                placeholder="Nội dung ghi chú"
                className="w-full px-2.5 py-1.5 text-sm bg-white border border-slate-300 rounded focus:ring-1 focus:ring-orange-500 outline-none"
              />
            </div>
          </div>

          {/* QĐ Hoàn trả */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              QĐ Hoàn trả:
            </label>
            <input
              type="text"
              value={record.qd_hoan_tra}
              onChange={(e) => handleChange('qd_hoan_tra', e.target.value)}
              placeholder="Số QĐ / Nội dung"
              className="w-full px-2.5 py-1.5 text-sm bg-white border border-slate-300 rounded focus:ring-1 focus:ring-orange-500 outline-none"
            />
          </div>

          {/* QĐ Thu hồi */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              QĐ Thu hồi:
            </label>
            <input
              type="text"
              value={record.qd_thu_hoi}
              onChange={(e) => handleChange('qd_thu_hoi', e.target.value)}
              placeholder="Số QĐ / Nội dung"
              className="w-full px-2.5 py-1.5 text-sm bg-white border border-slate-300 rounded focus:ring-1 focus:ring-orange-500 outline-none"
            />
          </div>

          {/* QĐ Hưu trí */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              QĐ Hưu trí:
            </label>
            <input
              type="text"
              value={record.qd_huu_tri}
              onChange={(e) => handleChange('qd_huu_tri', e.target.value)}
              placeholder="Số QĐ / Nội dung"
              className="w-full px-2.5 py-1.5 text-sm bg-white border border-slate-300 rounded focus:ring-1 focus:ring-orange-500 outline-none"
            />
          </div>

          {/* Bìa sổ BHXH */}
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-1">
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                SL Bìa sổ:
              </label>
              <input
                type="number"
                value={record.sl_bia_so}
                onChange={(e) => handleChange('sl_bia_so', e.target.value)}
                placeholder="SL"
                className="w-full px-2.5 py-1.5 text-sm bg-white border border-slate-300 rounded focus:ring-1 focus:ring-orange-500 outline-none"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Ghi chú bìa sổ:
              </label>
              <input
                type="text"
                value={record.ghi_chu_bia_so}
                onChange={(e) => handleChange('ghi_chu_bia_so', e.target.value)}
                placeholder="Nội dung ghi chú"
                className="w-full px-2.5 py-1.5 text-sm bg-white border border-slate-300 rounded focus:ring-1 focus:ring-orange-500 outline-none"
              />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
