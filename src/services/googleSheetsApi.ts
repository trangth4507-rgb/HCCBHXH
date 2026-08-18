import { initializeApp, getApps } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);

const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/spreadsheets');
provider.addScope('https://www.googleapis.com/auth/drive.file');

let isSigningIn = false;
let cachedAccessToken: string | null = null;

export const initGoogleAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      try {
        const token = await user.getIdToken();
        // Try getting oauth credential token if available
        if (cachedAccessToken) {
          if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
        } else if (!isSigningIn) {
          if (onAuthFailure) onAuthFailure();
        }
      } catch (err) {
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const signInWithGoogleSheets = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Không lấy được OAuth access token từ Google Sign-In');
    }
    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error) {
    console.error('Google Sign-In error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getGoogleAccessToken = () => cachedAccessToken;

export const signOutGoogle = async () => {
  await auth.signOut();
  cachedAccessToken = null;
};

// Create a new Google Spreadsheet automatically
export const createNewGoogleSheet = async (accessToken: string, title: string = 'Hồ Sơ BHXH - Quản Lý'): Promise<string> => {
  const res = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: { title },
      sheets: [
        {
          properties: { title: 'Danh Sách Hồ Sơ' },
        },
      ],
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Không thể tạo Google Sheet mới: ${errText}`);
  }

  const data = await res.json();
  const spreadsheetId = data.spreadsheetId;

  // Add Header Row
  const headerValues = [
    [
      'Thời gian',
      'Mã số hồ sơ',
      'Tên đơn vị / Người nhận',
      'Địa chỉ',
      'Số điện thoại',
      'SL Tờ rời',
      'Ghi chú tờ rời',
      'SL BHYT',
      'Ghi chú BHYT',
      'QĐ hoàn trả',
      'QĐ thu hồi',
      'QĐ hưu trí',
      'SL bìa sổ',
      'Ghi chú bìa sổ',
    ],
  ];

  await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Danh Sách Hồ Sơ!A1:N1?valueInputOption=USER_ENTERED`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ values: headerValues }),
  });

  return spreadsheetId;
};

// Append record to Google Sheet via REST API
export const appendRecordToGoogleSheetApi = async (accessToken: string, spreadsheetId: string, record: any): Promise<boolean> => {
  const rowData = [
    new Date().toLocaleString('vi-VN'),
    record.ma_ho_so || '',
    record.ten_don_vi || '',
    record.dia_chi || '',
    record.sdt || '',
    record.sl_to_roi || '',
    record.ghi_chu_to_roi || '',
    record.sl_bhyt || '',
    record.ghi_chu_bhyt || '',
    record.qd_hoan_tra || '',
    record.qd_thu_hoi || '',
    record.qd_huu_tri || '',
    record.sl_bia_so || '',
    record.ghi_chu_bia_so || '',
  ];

  const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Danh Sách Hồ Sơ!A:N:append?valueInputOption=USER_ENTERED`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      values: [rowData],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error('Error appending to Google Sheet:', err);
    return false;
  }

  return true;
};
