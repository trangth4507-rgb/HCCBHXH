export interface ProfileRecord {
  id: string;
  ma_ho_so: string;
  ten_don_vi: string;
  dia_chi: string;
  sdt: string;
  
  // Chi tiết giấy tờ
  sl_to_roi: string;
  ghi_chu_to_roi: string;
  
  sl_bhyt: string;
  ghi_chu_bhyt: string;
  
  qd_hoan_tra: string;
  qd_thu_hoi: string;
  qd_huu_tri: string;
  
  sl_bia_so: string;
  ghi_chu_bia_so: string;
  createdAt?: number;
}

export interface UserProfile {
  uid: string;
  email: string;
  role: 'admin' | 'user';
  createdAt: number;
}

export interface SenderConfig {
  nguoi_giao: string;
  ten_don_vi_giao: string;
  dia_chi_giao: string;
  sdt_giao: string;
  noi_dung: string;
  
  nguoi_nhan_chuyen: string;
  ten_don_vi_chuyen: string;
  dia_chi_chuyen: string;
  sdt_chuyen: string;

  nguoi_ky_buu_dien: string;
}

export interface PaperItem {
  stt: number;
  name: string;
  qty: string;
  note: string;
}
