import { useState, useEffect } from 'react';
import { message } from 'antd';
import dayjs from 'dayjs';

export interface CLB {
  id: string;
  avatar: string;
  ten: string;
  ngayThanhLap: string;
  moTa: string;
  chuNhiem: string;
  hoatDong: boolean;
}

export interface DonDangKy {
  id: string;
  hoTen: string;
  email: string;
  sdt: string;
  gioiTinh: string;
  diaChi: string;
  soTruong: string;
  clbId: string;
  lyDo: string;
  trangThai: 'pending' | 'approved' | 'rejected';
  ghiChuTuChoi?: string;
  createdAt: number;
  updatedAt: number;
}

export interface ThanhVien {
  id: string;
  hoTen: string;
  email: string;
  sdt: string;
  ngayDangKy: string;
  gioiTinh: string;
  diaChi: string;
  soTruong: string;
  clbId: string;
  trangThai: 'approved';
}

export interface LichSuDuyet {
  id: string;
  donDangKyId: string;
  hanhDong: 'approved' | 'rejected';
  nguoiThucHien: string;
  thoiGian: number;
  lyDo?: string;
}

const STORAGE_KEY = 'clb_app_data';

const defaultCLB: CLB[] = [
  { id: '1', avatar: 'https://picsum.photos/200/150?random=1', ten: 'CLB Lập trình', ngayThanhLap: '2020-01-15', moTa: '<p>CLB lập trình</p>', chuNhiem: 'Nguyễn Văn A', hoatDong: true },
  { id: '2', avatar: 'https://picsum.photos/200/150?random=2', ten: 'CLB Tiếng Anh', ngayThanhLap: '2019-05-20', moTa: '<p>CLB Tiếng Anh</p>', chuNhiem: 'Phạm Thị D', hoatDong: true },
];

const defaultDonDangKy: DonDangKy[] = [
  { id: 'd1', hoTen: 'Trần Thị B', email: 'b@example.com', sdt: '0912345678', gioiTinh: 'Nữ', diaChi: 'Hà Nội', soTruong: 'Lập trình Web', clbId: '1', lyDo: 'Muốn học lập trình', trangThai: 'pending', createdAt: Date.now(), updatedAt: Date.now() },
];

const defaultThanhVien: ThanhVien[] = [
  { id: 'tv1', hoTen: 'Lê Văn C', email: 'c@example.com', sdt: '0987654321', ngayDangKy: '2024-01-10', gioiTinh: 'Nam', diaChi: 'HCM', soTruong: 'Java', clbId: '1', trangThai: 'approved' },
];

const defaultLichSu: LichSuDuyet[] = [];

export default () => {
  const [clbList, setClbList] = useState<CLB[]>([]);
  const [donDangKy, setDonDangKy] = useState<DonDangKy[]>([]);
  const [thanhVien, setThanhVien] = useState<ThanhVien[]>([]);
  const [lichSuDuyet, setLichSuDuyet] = useState<LichSuDuyet[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      setClbList(parsed.clbList || []);
      setDonDangKy(parsed.donDangKy || []);
      setThanhVien(parsed.thanhVien || []);
      setLichSuDuyet(parsed.lichSuDuyet || []);
    } else {
      setClbList(defaultCLB);
      setDonDangKy(defaultDonDangKy);
      setThanhVien(defaultThanhVien);
      setLichSuDuyet(defaultLichSu);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ clbList, donDangKy, thanhVien, lichSuDuyet }));
  }, [clbList, donDangKy, thanhVien, lichSuDuyet]);

  const addCLB = (data: Omit<CLB, 'id'>) => {
    const newCLB = { id: Date.now().toString(), ...data };
    setClbList(prev => [...prev, newCLB]);
    message.success('Thêm CLB thành công');
  };
  const updateCLB = (id: string, data: Partial<Omit<CLB, 'id'>>) => {
    setClbList(prev => prev.map(c => c.id === id ? { ...c, ...data } : c));
    message.success('Cập nhật CLB thành công');
  };
  const deleteCLB = (id: string) => {
    setClbList(prev => prev.filter(c => c.id !== id));
    message.success('Xóa CLB thành công');
  };

  const addDonDangKy = (data: Omit<DonDangKy, 'id' | 'trangThai' | 'createdAt' | 'updatedAt'>) => {
    const newDon: DonDangKy = {
      id: Date.now().toString(),
      ...data,
      trangThai: 'pending',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setDonDangKy(prev => [...prev, newDon]);
    message.success('Đã gửi đơn đăng ký');
  };
  const updateDonDangKy = (id: string, data: Partial<Omit<DonDangKy, 'id'>>) => {
    setDonDangKy(prev => prev.map(d => d.id === id ? { ...d, ...data, updatedAt: Date.now() } : d));
    message.success('Cập nhật đơn thành công');
  };
  const deleteDonDangKy = (id: string) => {
    setDonDangKy(prev => prev.filter(d => d.id !== id));
    message.success('Xóa đơn thành công');
  };

  const duyetDon = (donIds: string[], action: 'approved' | 'rejected', lyDoTuChoi?: string) => {
    if (action === 'rejected' && !lyDoTuChoi) {
      message.error('Vui lòng nhập lý do từ chối');
      return false;
    }
    const now = Date.now();
    setDonDangKy(prev => prev.map(d => {
      if (donIds.includes(d.id)) {
        return { ...d, trangThai: action, ghiChuTuChoi: action === 'rejected' ? lyDoTuChoi : undefined, updatedAt: now };
      }
      return d;
    }));
    if (action === 'approved') {
      const newThanhVienList: ThanhVien[] = [];
      donIds.forEach(donId => {
        const don = donDangKy.find(d => d.id === donId);
        if (don && don.trangThai === 'pending') {
          newThanhVienList.push({
            id: Date.now().toString() + Math.random(),
            hoTen: don.hoTen,
            email: don.email,
            sdt: don.sdt,
            ngayDangKy: dayjs().format('YYYY-MM-DD'),
            gioiTinh: don.gioiTinh,
            diaChi: don.diaChi,
            soTruong: don.soTruong,
            clbId: don.clbId,
            trangThai: 'approved',
          });
        }
      });
      setThanhVien(prev => [...prev, ...newThanhVienList]);
    }
    const newLichSu: LichSuDuyet[] = donIds.map(donId => ({
      id: Date.now().toString() + Math.random(),
      donDangKyId: donId,
      hanhDong: action,
      nguoiThucHien: 'Admin',
      thoiGian: now,
      lyDo: action === 'rejected' ? lyDoTuChoi : undefined,
    }));
    setLichSuDuyet(prev => [...prev, ...newLichSu]);
    message.success(`Đã ${action === 'approved' ? 'duyệt' : 'từ chối'} ${donIds.length} đơn`);
    return true;
  };

  const getLichSuByDonId = (donId: string) => {
    return lichSuDuyet.filter(ls => ls.donDangKyId === donId).sort((a,b) => b.thoiGian - a.thoiGian);
  };

  const changeClbForThanhVien = (tvIds: string[], newClbId: string) => {
    setThanhVien(prev => prev.map(tv => tvIds.includes(tv.id) ? { ...tv, clbId: newClbId } : tv));
    message.success(`Đã chuyển ${tvIds.length} thành viên sang CLB mới`);
  };
  const removeThanhVien = (tvId: string) => {
    setThanhVien(prev => prev.filter(tv => tv.id !== tvId));
    message.success('Đã xóa thành viên');
  };

  return {
    clbList,
    donDangKy,
    thanhVien,
    lichSuDuyet,
    addCLB,
    updateCLB,
    deleteCLB,
    addDonDangKy,
    updateDonDangKy,
    deleteDonDangKy,
    duyetDon,
    getLichSuByDonId,
    changeClbForThanhVien,
    removeThanhVien,
  };
};