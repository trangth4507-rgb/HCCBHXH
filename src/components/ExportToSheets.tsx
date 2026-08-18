import React, { useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { FileSpreadsheet, Loader2, Check, AlertCircle } from 'lucide-react';
import { ProfileRecord } from '../types';

interface ExportToSheetsProps {
  records: ProfileRecord[];
}

export function ExportToSheets({ records }: ExportToSheetsProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const createSpreadsheetAndExport = async (accessToken: string) => {
    try {
      // 1. Create a new Spreadsheet
      const createResponse = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          properties: {
            title: `Danh sách hồ sơ BHXH - ${new Date().toLocaleDateString('vi-VN')}`
          }
        })
      });

      if (!createResponse.ok) {
        throw new Error('Lỗi khi tạo Google Sheet');
      }

      const sheetData = await createResponse.json();
      const spreadsheetId = sheetData.spreadsheetId;

      // 2. Prepare data
      const headerRow = [
        'Mã hồ sơ', 'Tên đơn vị', 'Địa chỉ', 'SĐT', 
        'SL Tờ rời', 'Ghi chú TR', 'SL BHYT', 'Ghi chú BHYT',
        'QĐ Hoàn trả', 'QĐ Thu hồi', 'QĐ Hưu trí', 'SL Bìa sổ', 'Ghi chú Bìa sổ'
      ];

      const values = records.map(record => [
        record.ma_ho_so,
        record.ten_don_vi,
        record.dia_chi,
        record.sdt,
        record.sl_to_roi,
        record.ghi_chu_to_roi,
        record.sl_bhyt,
        record.ghi_chu_bhyt,
        record.qd_hoan_tra,
        record.qd_thu_hoi,
        record.qd_huu_tri,
        record.sl_bia_so,
        record.ghi_chu_bia_so
      ]);

      // 3. Update data to the sheet
      const updateResponse = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/A1:M${values.length + 1}?valueInputOption=USER_ENTERED`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            values: [headerRow, ...values]
          })
        }
      );

      if (!updateResponse.ok) {
        throw new Error('Lỗi khi ghi dữ liệu vào Google Sheet');
      }

      setStatus('success');
      
      // Open the new sheet in a new tab
      window.open(`https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`, '_blank');

      setTimeout(() => {
        setStatus('idle');
      }, 5000);

    } catch (error: any) {
      setStatus('error');
      setErrorMessage(error.message || 'Có lỗi xảy ra');
      console.error(error);
      setTimeout(() => setStatus('idle'), 5000);
    } finally {
      setIsExporting(false);
    }
  };

  const login = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      createSpreadsheetAndExport(tokenResponse.access_token);
    },
    onError: () => {
      setIsExporting(false);
      setStatus('error');
      setErrorMessage('Đăng nhập Google thất bại');
      setTimeout(() => setStatus('idle'), 5000);
    },
    scope: 'https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.file'
  });

  const handleExportClick = () => {
    setIsExporting(true);
    setStatus('idle');
    login();
  };

  return (
    <div className="flex items-center gap-2">
      {status === 'error' && (
        <span className="text-red-400 text-xs flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5" />
          {errorMessage}
        </span>
      )}
      {status === 'success' && (
        <span className="text-emerald-400 text-xs flex items-center gap-1">
          <Check className="w-3.5 h-3.5" />
          Đã xuất xong
        </span>
      )}
      <button
        onClick={handleExportClick}
        disabled={isExporting || records.length === 0}
        className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer bg-green-700 text-white shadow-md border border-green-500/50 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isExporting ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <FileSpreadsheet className="w-3.5 h-3.5" />
        )}
        <span>Xuất Google Sheets</span>
      </button>
    </div>
  );
}
