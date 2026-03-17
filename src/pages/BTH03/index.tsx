const express = require('express');
const app = express();
app.use(express.json());

// Dữ liệu mẫu (Thay bằng database của bạn nếu có)
let staff = [
  { id: 1, name: "Nguyen Van A", daily_limit: 5, schedule: { start: "09:00", end: "17:00" } }
];
let appointments = []; // Lưu trữ lịch hẹn
let ratings = []; // { staffId, score, comment, reply }

// --- LOGIC 1: ĐẶT LỊCH HẸN & KIỂM TRA TRÙNG ---
app.post('/bookings', (req, res) => {
  const { staffId, date, startTime, duration } = req.body; 
  // duration tính bằng phút, ví dụ: 60

  const s = staff.find(x => x.id === staffId);
  if (!s) return res.status(404).json({ error: "Không tìm thấy nhân viên" });

  // 1. Kiểm tra giới hạn khách trong ngày
  const todayBookings = appointments.filter(a => a.staffId === staffId && a.date === date);
  if (todayBookings.length >= s.daily_limit) {
    return res.status(400).json({ error: "Nhân viên đã đạt giới hạn khách trong ngày" });
  }

  // 2. Kiểm tra trùng lịch (Overlap)
  const newStart = new Date(`${date}T${startTime}`);
  const newEnd = new Date(newStart.getTime() + duration * 60000);

  const isOverlapping = todayBookings.some(appt => {
    const apptStart = new Date(`${appt.date}T${appt.startTime}`);
    const apptEnd = new Date(apptStart.getTime() + appt.duration * 60000);
    return (newStart < apptEnd && newEnd > apptStart);
  });

  if (isOverlapping) {
    return res.status(400).json({ error: "Khung giờ này đã có người đặt" });
  }

  const newAppt = { id: Date.now(), staffId, date, startTime, duration, status: 'Chờ duyệt' };
  appointments.push(newAppt);
  res.status(201).json(newAppt);
});

// --- LOGIC 2: CẬP NHẬT TRẠNG THÁI ---
app.patch('/bookings/:id', (req, res) => {
  const { status } = req.body; // 'Xác nhận', 'Hoàn thành', 'Hủy'
  const appt = appointments.find(a => a.id == req.params.id);
  if (appt) {
    appt.status = status;
    return res.json(appt);
  }
  res.status(404).send("Không tìm thấy lịch hẹn");
});

// --- LOGIC 3: ĐÁNH GIÁ & TRUNG BÌNH SAO ---
app.get('/staff/:id/rating', (req, res) => {
  const staffRatings = ratings.filter(r => r.staffId == req.params.id);
  if (staffRatings.length === 0) return res.json({ avg: 0 });
  
  const sum = staffRatings.reduce((acc, curr) => acc + curr.score, 0);
  res.json({ averageRating: sum / staffRatings.length, total: staffRatings.length });
});

app.listen(3000, () => console.log("Server chạy tại port 3000"));