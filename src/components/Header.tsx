import React from 'react';
import { PlusCircle, Save, Printer, Settings, Code, FileSpreadsheet } from 'lucide-react';

interface HeaderProps {
  onAddRecord: () => void;
  onSaveToSheet: () => void;
  onPrintAll: () => void;
  onOpenSettings: () => void;
  isSaving: boolean;
  recordCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  onAddRecord,
  onSaveToSheet,
  onPrintAll,
  onOpenSettings,
  isSaving,
  recordCount,
}) => {
  return (
    <header className="bg-slate-950 text-white shadow-xl sticky top-0 z-30 no-print border-b-2 border-orange-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          {/* App Branding */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-600 via-orange-500 to-amber-500 flex items-center justify-center shadow-md shadow-orange-900/30">
              <FileSpreadsheet className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                Hành chính công
                <span className="text-xs bg-orange-500/20 text-orange-300 font-semibold px-2.5 py-0.5 rounded-full border border-orange-500/40">
                  {recordCount} Hồ sơ
                </span>
              </h1>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onAddRecord}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-sm font-semibold transition shadow-sm cursor-pointer active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Thêm hồ sơ</span>
            </button>

            <button
              onClick={onSaveToSheet}
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-orange-800 hover:bg-orange-700 disabled:opacity-50 text-white text-sm font-semibold transition shadow-sm cursor-pointer active:scale-95 border border-orange-600/40"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Đang lưu...' : 'Lưu Google Sheet'}</span>
            </button>

            <button
              onClick={onPrintAll}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-900 hover:bg-blue-800 text-white text-sm font-semibold transition shadow-sm cursor-pointer active:scale-95 border border-blue-700/50"
            >
              <Printer className="w-4 h-4" />
              <span>In Hàng Loạt</span>
            </button>

            <button
              onClick={onOpenSettings}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-sm font-medium transition cursor-pointer"
              title="Cấu hình người giao & URL Web App"
            >
              <Settings className="w-4 h-4 text-orange-400" />
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};

