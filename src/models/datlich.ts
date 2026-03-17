import { useState, useEffect } from 'react';
import { message } from 'antd';
import dayjs from 'dayjs';

export interface Staff {
  id: string;
  name: string;
  maxCustomersPerDay: number;
  workSchedule: WorkDay[];
}

export interface WorkDay {
  dayOfWeek: number; // 0: CN, 1-6: Thứ 2 - Thứ 7
  startTime: string; // "HH:mm"
  endTime: string;
}

export interface Service {
  id: string;
  name: string;
  price: number;
  duration: number; // phút
}

export interface Appointment {
  id: string;
  customerName: string;
  customerPhone: string;
  serviceId: string;
  staffId: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
}

export interface Review {
  id: string;
  appointmentId: string;
  staffId: string;
  serviceId: string;
  customerName: string;
  rating: number; // 1-5
  comment: string;
  reply?: string;
  createdAt: number;
  repliedAt?: number;
}

const STORAGE_KEY = 'datlich_app';

// Dữ liệu mẫu
const defaultStaff: Staff[] = [
  {
    id: '1',
    name: 'Nguyễn Văn A',
    maxCustomersPerDay: 5,
    workSchedule: [
      { dayOfWeek: 1, startTime: '09:00', endTime: '17:00' },
      { dayOfWeek: 2, startTime: '09:00', endTime: '17:00' },
      { dayOfWeek: 3, startTime: '09:00', endTime: '17:00' },
      { dayOfWeek: 4, startTime: '09:00', endTime: '17:00' },
      { dayOfWeek: 5, startTime: '09:00', endTime: '17:00' },
      { dayOfWeek: 6, startTime: '09:00', endTime: '12:00' },
    ],
  },
  {
    id: '2',
    name: 'Trần Thị B',
    maxCustomersPerDay: 3,
    workSchedule: [
      { dayOfWeek: 2, startTime: '13:00', endTime: '20:00' },
      { dayOfWeek: 4, startTime: '13:00', endTime: '20:00' },
      { dayOfWeek: 6, startTime: '09:00', endTime: '17:00' },
    ],
  },
];

const defaultServices: Service[] = [
  { id: '1', name: 'Cắt tóc nam', price: 80000, duration: 30 },
  { id: '2', name: 'Gội đầu', price: 50000, duration: 20 },
  { id: '3', name: 'Nhuộm tóc', price: 200000, duration: 90 },
];

const defaultAppointments: Appointment[] = [];

export default () => {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);

  // Load từ localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      setStaff(parsed.staff || []);
      setServices(parsed.services || []);
      setAppointments(parsed.appointments || []);
      setReviews(parsed.reviews || []);
    } else {
      setStaff(defaultStaff);
      setServices(defaultServices);
      setAppointments(defaultAppointments);
      setReviews([]);
    }
  }, []);

  // Lưu khi thay đổi
  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ staff, services, appointments, reviews })
    );
  }, [staff, services, appointments, reviews]);

  // ===== Staff =====
  const addStaff = (staffData: Omit<Staff, 'id'>) => {
    const newStaff: Staff = { id: Date.now().toString(), ...staffData };
    setStaff(prev => [...prev, newStaff]);
    message.success('Thêm nhân viên thành công');
  };

  const updateStaff = (id: string, data: Partial<Omit<Staff, 'id'>>) => {
    setStaff(prev => prev.map(s => (s.id === id ? { ...s, ...data } : s)));
    message.success('Cập nhật nhân viên thành công');
  };

  const deleteStaff = (id: string) => {
    const hasAppointments = appointments.some(a => a.staffId === id);
    if (hasAppointments) {
      message.error('Không thể xóa nhân viên đã có lịch hẹn');
      return false;
    }
    setStaff(prev => prev.filter(s => s.id !== id));
    message.success('Xóa nhân viên thành công');
    return true;
  };

  // ===== Service =====
  const addService = (serviceData: Omit<Service, 'id'>) => {
    const newService: Service = { id: Date.now().toString(), ...serviceData };
    setServices(prev => [...prev, newService]);
    message.success('Thêm dịch vụ thành công');
  };

  const updateService = (id: string, data: Partial<Omit<Service, 'id'>>) => {
    setServices(prev => prev.map(s => (s.id === id ? { ...s, ...data } : s)));
    message.success('Cập nhật dịch vụ thành công');
  };

  const deleteService = (id: string) => {
    const hasAppointments = appointments.some(a => a.serviceId === id);
    if (hasAppointments) {
      message.error('Không thể xóa dịch vụ đã có lịch hẹn');
      return false;
    }
    setServices(prev => prev.filter(s => s.id !== id));
    message.success('Xóa dịch vụ thành công');
    return true;
  };

  // ===== Appointment Helpers =====
  const checkAppointmentValid = (
    staffId: string,
    date: string,
    time: string,
    serviceId: string,
    excludeAppointmentId?: string
  ): boolean => {
    const staffItem = staff.find(s => s.id === staffId);
    if (!staffItem) return false;

    const service = services.find(s => s.id === serviceId);
    if (!service) return false;

    const start = dayjs(`${date} ${time}`, 'YYYY-MM-DD HH:mm');
    const end = start.add(service.duration, 'minute');

    const dayOfWeek = dayjs(date).day();
    const workDay = staffItem.workSchedule.find(w => w.dayOfWeek === dayOfWeek);
    if (!workDay) return false;

    const workStart = dayjs(`${date} ${workDay.startTime}`, 'YYYY-MM-DD HH:mm');
    const workEnd = dayjs(`${date} ${workDay.endTime}`, 'YYYY-MM-DD HH:mm');
    if (start.isBefore(workStart) || end.isAfter(workEnd)) return false;

    let appointmentsOnDay = appointments.filter(a => a.staffId === staffId && a.date === date);
    if (excludeAppointmentId) {
      appointmentsOnDay = appointmentsOnDay.filter(a => a.id !== excludeAppointmentId);
    }
    if (appointmentsOnDay.length >= staffItem.maxCustomersPerDay) return false;

    const conflicting = appointmentsOnDay.some(a => {
      const aService = services.find(s => s.id === a.serviceId);
      if (!aService) return false;
      const aStart = dayjs(`${a.date} ${a.time}`, 'YYYY-MM-DD HH:mm');
      const aEnd = aStart.add(aService.duration, 'minute');
      return start.isBefore(aEnd) && end.isAfter(aStart);
    });

    return !conflicting;
  };

  // ===== Appointment =====
  const addAppointment = (appt: Omit<Appointment, 'id'>) => {
    if (!checkAppointmentValid(appt.staffId, appt.date, appt.time, appt.serviceId)) {
      message.error('Không thể đặt lịch: trùng giờ hoặc ngoài giờ làm việc');
      return false;
    }
    const newAppt: Appointment = { id: Date.now().toString(), ...appt };
    setAppointments(prev => [...prev, newAppt]);
    message.success('Đặt lịch thành công');
    return newAppt;
  };

  const updateAppointment = (id: string, data: Partial<Omit<Appointment, 'id'>>) => {
    const oldAppt = appointments.find(a => a.id === id);
    if (!oldAppt) return false;

    const newData = { ...oldAppt, ...data };

    if (data.staffId || data.date || data.time || data.serviceId) {
      if (!checkAppointmentValid(newData.staffId, newData.date, newData.time, newData.serviceId, id)) {
        message.error('Cập nhật thất bại: trùng lịch hoặc ngoài giờ làm việc');
        return false;
      }
    }

    setAppointments(prev => prev.map(a => (a.id === id ? newData : a)));
    message.success('Cập nhật lịch hẹn thành công');
    return true;
  };

  const deleteAppointment = (id: string) => {
    setAppointments(prev => prev.filter(a => a.id !== id));
    message.success('Hủy lịch hẹn thành công');
  };

  // ===== Review =====
  const addReview = (reviewData: Omit<Review, 'id' | 'createdAt'>) => {
    const newReview: Review = {
      id: Date.now().toString(),
      createdAt: Date.now(),
      ...reviewData,
    };
    setReviews(prev => [...prev, newReview]);
    message.success('Cảm ơn bạn đã đánh giá!');
    return newReview;
  };

  const replyToReview = (reviewId: string, reply: string) => {
    setReviews(prev => prev.map(r => 
      r.id === reviewId ? { ...r, reply, repliedAt: Date.now() } : r
    ));
    message.success('Đã phản hồi đánh giá');
  };

  const getStaffAverageRating = (staffId: string): number => {
    const staffReviews = reviews.filter(r => r.staffId === staffId);
    if (staffReviews.length === 0) return 0;
    const sum = staffReviews.reduce((acc, r) => acc + r.rating, 0);
    return sum / staffReviews.length;
  };

  const getStaffReviews = (staffId: string) => {
    return reviews.filter(r => r.staffId === staffId);
  };

  return {
    staff,
    services,
    appointments,
    reviews,
    addStaff,
    updateStaff,
    deleteStaff,
    addService,
    updateService,
    deleteService,
    addAppointment,
    updateAppointment,
    deleteAppointment,
    addReview,
    replyToReview,
    getStaffAverageRating,
    getStaffReviews,
  };
};