import React from 'react';
import { ProfileRecord, SenderConfig, PaperItem } from '../types';

interface PrintDocumentProps {
  record: ProfileRecord;
  sender: SenderConfig;
}

export const PrintDocument: React.FC<PrintDocumentProps> = ({ record, sender }) => {
  // Build items array from record details
  const items: PaperItem[] = [];
  let stt = 1;

  if (record.sl_to_roi || record.ghi_chu_to_roi) {
    items.push({
      stt: stt++,
      name: 'Tờ rời',
      qty: record.sl_to_roi,
      note: record.ghi_chu_to_roi,
    });
  }

  if (record.sl_bhyt || record.ghi_chu_bhyt) {
    items.push({
      stt: stt++,
      name: 'Thẻ BHYT',
      qty: record.sl_bhyt,
      note: record.ghi_chu_bhyt,
    });
  }

  if (record.sl_bia_so || record.ghi_chu_bia_so) {
    items.push({
      stt: stt++,
      name: 'Bìa sổ BHXH',
      qty: record.sl_bia_so,
      note: record.ghi_chu_bia_so,
    });
  }

  if (record.qd_hoan_tra) {
    items.push({
      stt: stt++,
      name: 'QĐ Hoàn trả',
      qty: '',
      note: record.qd_hoan_tra,
    });
  }

  if (record.qd_thu_hoi) {
    items.push({
      stt: stt++,
      name: 'QĐ Thu hồi',
      qty: '',
      note: record.qd_thu_hoi,
    });
  }

  if (record.qd_huu_tri) {
    items.push({
      stt: stt++,
      name: 'QĐ Hưu trí',
      qty: '',
      note: record.qd_huu_tri,
    });
  }

  return (
    <div className="a4-page bg-white font-times text-black mx-auto shadow-md my-4 border border-gray-200 printable-card">
      {/* Header Quốc hiệu */}
      <div className="text-center font-bold mb-8 pt-4">
        <div className="text-[12pt] tracking-tight">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
        <div className="text-[12pt] underline underline-offset-4 decoration-1 mt-0.5">
          Độc lập - Tự do - Hạnh phúc
        </div>
      </div>

      {/* Document Title */}
      <div className="my-8 text-center py-0.5">
        <h1 className="text-[16pt] font-bold tracking-wide uppercase">
          GIẤY GIAO NHẬN HỒ SƠ BHXH
        </h1>
      </div>

      {/* Information Section arranged in a 2-column table/grid like Google Sheet */}
      <table className="w-full border-collapse mb-2 mt-10 text-[11pt] leading-snug">
        <tbody>
          {/* Người giao */}
          <tr>
            <td className="w-[38%] py-0.5 font-bold align-top">Người giao hồ sơ:</td>
            <td className="w-[62%] py-0.5 font-bold text-center align-top text-black">
              {sender.nguoi_giao || 'Trần Hà Trang'}
            </td>
          </tr>
          <tr>
            <td className="py-0.5 font-normal align-top pl-4">Tên đơn vị:</td>
            <td className="py-0.5 font-normal text-center align-top">
              {sender.ten_don_vi_giao || 'Bảo hiểm xã hội cơ sở Đông Hà'}
            </td>
          </tr>
          <tr>
            <td className="py-0.5 font-normal align-top pl-4">Địa chỉ:</td>
            <td className="py-0.5 font-normal text-center align-top">
              {sender.dia_chi_giao || '86 Hoàng Diệu - Phường Đông Hà - Quảng Trị'}
            </td>
          </tr>
          <tr>
            <td className="py-0.5 font-normal align-top pl-4">Số điện thoại liên hệ</td>
            <td className="py-0.5 font-normal text-center align-top">
              {sender.sdt_giao || '2333666167'}
            </td>
          </tr>
          <tr>
            <td className="py-0.5 font-normal align-top pl-4">Nội dung hồ sơ:</td>
            <td className="py-0.5 font-normal text-center align-top">
              {sender.noi_dung || 'Trả kết quả hồ sơ đã giải quyết'}
            </td>
          </tr>

          {/* Spacer */}
          <tr>
            <td colSpan={2} className="py-0.5"></td>
          </tr>

          {/* Người nhận và chuyển hồ sơ */}
          <tr>
            <td className="py-0.5 font-bold align-top">Người nhận và chuyển hồ sơ:</td>
            <td className="py-0.5 text-center font-normal align-top"></td>
          </tr>
          <tr>
            <td className="py-0.5 font-normal align-top pl-4">Tên đơn vị:</td>
            <td className="py-0.5 font-bold text-center align-top">
              {sender.ten_don_vi_chuyen || 'Bưu cục vận hành Đông Hà'}
            </td>
          </tr>
          <tr>
            <td className="py-0.5 font-normal align-top pl-4">Địa chỉ:</td>
            <td className="py-0.5 font-normal text-center align-top">
              {sender.dia_chi_chuyen || '291 Lê Duẩn - Phường Nam Đông Hà - Quảng Trị'}
            </td>
          </tr>
          <tr>
            <td className="py-0.5 font-normal align-top pl-4">Số điện thoại liên hệ:</td>
            <td className="py-0.5 font-normal text-center align-top">
              {sender.sdt_chuyen || '325.562.047'}
            </td>
          </tr>

          {/* Spacer */}
          <tr>
            <td colSpan={2} className="py-0.5"></td>
          </tr>

          {/* Người nhận hồ sơ */}
          <tr>
            <td className="py-0.5 font-bold align-top">Người nhận hồ sơ:</td>
            <td className="py-0.5 text-center font-normal align-top"></td>
          </tr>
          <tr>
            <td className="py-0.5 font-normal align-top pl-4">Tên đơn vị/ người nhận:</td>
            <td className="py-0.5 font-bold text-center align-top text-[12pt] uppercase">
              {record.ten_don_vi || '—'}
            </td>
          </tr>
          <tr>
            <td className="py-0.5 font-normal align-top pl-4">Mã hồ sơ:</td>
            <td className="py-0.5 font-normal text-center align-top">
              {record.ma_ho_so || '—'}
            </td>
          </tr>
          <tr>
            <td className="py-0.5 font-normal align-top pl-4">Địa chỉ:</td>
            <td className="py-0.5 font-normal text-center align-top uppercase">
              {record.dia_chi || '—'}
            </td>
          </tr>
          <tr>
            <td className="py-0.5 font-normal align-top pl-4">Số điện thoại:</td>
            <td className="py-0.5 font-normal text-center align-top">
              {record.sdt || '—'}
            </td>
          </tr>
        </tbody>
      </table>

      {/* Table of Papers / Details */}
      <table className="w-full border-collapse border border-black text-[10.5pt] my-2">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-black py-1 px-1.5 text-center w-[10%] font-bold">STT</th>
            <th className="border border-black py-1 px-1.5 text-center w-[40%] font-bold">Loại giấy tờ</th>
            <th className="border border-black py-1 px-1.5 text-center w-[15%] font-bold">Số lượng</th>
            <th className="border border-black py-1 px-1.5 text-center w-[35%] font-bold">Ghi chú</th>
          </tr>
        </thead>
        <tbody>
          {items.length > 0 ? (
            items.map((item) => (
              <tr key={item.stt}>
                <td className="border border-black py-1 px-1.5 text-center">{item.stt}</td>
                <td className="border border-black py-1 px-1.5 text-left pl-2.5">{item.name}</td>
                <td className="border border-black py-1 px-1.5 text-center">{item.qty}</td>
                <td className="border border-black py-1 px-1.5 text-left pl-2.5">{item.note}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={4} className="border border-black py-2 text-center italic text-gray-600">
                Không có giấy tờ chi tiết
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Footer / Signatures */}
      <div className="grid grid-cols-3 gap-2 text-center font-bold text-[11pt] mt-4 pt-1 break-inside-avoid">
        <div>
          <div>Người giao</div>
          <div className="h-14"></div>
          <div>{sender.nguoi_giao || 'Trần Hà Trang'}</div>
        </div>
        <div>
          <div>Bưu điện</div>
          <div className="h-14"></div>
          <div>{sender.nguoi_ky_buu_dien || 'Ngô Ngọc Lai'}</div>
        </div>
        <div>
          <div>Người nhận</div>
          <div className="h-14"></div>
          <div className="text-gray-500 font-normal italic text-[9.5pt]">(Ký & ghi rõ họ tên)</div>
        </div>
      </div>
    </div>
  );
};
