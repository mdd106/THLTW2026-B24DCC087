import React, { useState } from 'react';
import useDatLich from '../../models/datlich';
import {
  Tabs,
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Space,
  Popconfirm,
  message,
  Tag,
  TimePicker,
  DatePicker,
  Typography,
  Badge,
  Row,
  Col,
  Statistic,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  FilterOutlined,
  StarOutlined,
  StarFilled,
  MessageOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { TabPane } = Tabs;
const { Option } = Select;
const { Text } = Typography;
const { RangePicker } = DatePicker;

const daysOfWeek = [
  { value: 0, label: 'Chủ nhật' },
  { value: 1, label: 'Thứ 2' },
  { value: 2, label: 'Thứ 3' },
  { value: 3, label: 'Thứ 4' },
  { value: 4, label: 'Thứ 5' },
  { value: 5, label: 'Thứ 6' },
  { value: 6, label: 'Thứ 7' },
];

const statusOptions = [
  { value: 'pending', label: 'Chờ duyệt', color: 'orange' },
  { value: 'confirmed', label: 'Xác nhận', color: 'green' },
  { value: 'completed', label: 'Hoàn thành', color: 'blue' },
  { value: 'cancelled', label: 'Hủy', color: 'red' },
];

const DatLichPage: React.FC = () => {
  const {
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
  } = useDatLich();

  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'staff' | 'service' | 'appointment'>('staff');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form] = Form.useForm();

  const [workSchedule, setWorkSchedule] = useState<{ dayOfWeek: number; startTime: string; endTime: string }[]>([]);

  const [filterStatus, setFilterStatus] = useState<string | undefined>();
  const [filterStaff, setFilterStaff] = useState<string | undefined>();
  const [filterDate, setFilterDate] = useState<string | undefined>();

  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [replyModalVisible, setReplyModalVisible] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [selectedReview, setSelectedReview] = useState<any>(null);
  const [reviewForm] = Form.useForm();
  const [replyForm] = Form.useForm();

  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);

  const filteredAppointments = appointments.filter(app => {
    if (filterStatus && app.status !== filterStatus) return false;
    if (filterStaff && app.staffId !== filterStaff) return false;
    if (filterDate && app.date !== filterDate) return false;
    return true;
  });

  const openModal = (type: typeof modalType, record?: any) => {
    setModalType(type);
    setEditingId(record?.id || null);
    if (record) {
      form.setFieldsValue({
        ...record,
        date: record.date ? dayjs(record.date) : undefined,
        time: record.time ? dayjs(record.time, 'HH:mm') : undefined,
      });
      if (type === 'staff') {
        setWorkSchedule(record.workSchedule || []);
      }
    } else {
      form.resetFields();
      if (type === 'staff') {
        setWorkSchedule([]);
      }
    }
    setModalVisible(true);
  };

  const addWorkDay = () => {
    const day = form.getFieldValue('workDay');
    const start = form.getFieldValue('workStart');
    const end = form.getFieldValue('workEnd');
    if (day === undefined || !start || !end) {
      message.warning('Chọn đầy đủ ngày và giờ');
      return;
    }
    setWorkSchedule(prev => [
      ...prev,
      { dayOfWeek: day, startTime: start.format('HH:mm'), endTime: end.format('HH:mm') },
    ]);
    form.setFieldsValue({ workDay: undefined, workStart: undefined, workEnd: undefined });
  };

  const removeWorkDay = (index: number) => {
    setWorkSchedule(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (modalType === 'staff') {
        const staffData = {
          name: values.name,
          maxCustomersPerDay: values.maxCustomersPerDay,
          workSchedule,
        };
        if (editingId) {
          updateStaff(editingId, staffData);
        } else {
          addStaff(staffData);
        }
        setModalVisible(false);
      } else if (modalType === 'service') {
        const serviceData = {
          name: values.name,
          price: values.price,
          duration: values.duration,
        };
        if (editingId) {
          updateService(editingId, serviceData);
        } else {
          addService(serviceData);
        }
        setModalVisible(false);
      } else if (modalType === 'appointment') {
        const apptData = {
          customerName: values.customerName,
          customerPhone: values.customerPhone,
          serviceId: values.serviceId,
          staffId: values.staffId,
          date: values.date.format('YYYY-MM-DD'),
          time: values.time.format('HH:mm'),
          status: values.status || 'pending',
          notes: values.notes,
        };
        let result;
        if (editingId) {
          result = updateAppointment(editingId, apptData);
        } else {
          result = addAppointment(apptData);
        }
        if (result) {
          setModalVisible(false);
        }
      }
    } catch (error) {
      console.log('Submit error:', error);
    }
  };

  const openReviewModal = (appointment: any) => {
    setSelectedAppointment(appointment);
    reviewForm.resetFields();
    setReviewModalVisible(true);
  };

  const handleSubmitReview = async () => {
    try {
      const values = await reviewForm.validateFields();
      if (!selectedAppointment) return;
      addReview({
        appointmentId: selectedAppointment.id,
        staffId: selectedAppointment.staffId,
        serviceId: selectedAppointment.serviceId,
        customerName: selectedAppointment.customerName,
        rating: values.rating,
        comment: values.comment,
      });
      setReviewModalVisible(false);
      setSelectedAppointment(null);
    } catch (error) {
      console.log('Review error:', error);
    }
  };

  const openReplyModal = (review: any) => {
    setSelectedReview(review);
    replyForm.setFieldsValue({ reply: review.reply || '' });
    setReplyModalVisible(true);
  };

  const handleSubmitReply = async () => {
    try {
      const values = await replyForm.validateFields();
      if (!selectedReview) return;
      replyToReview(selectedReview.id, values.reply);
      setReplyModalVisible(false);
      setSelectedReview(null);
    } catch (error) {
      console.log('Reply error:', error);
    }
  };

  const getFilteredAppointments = () => {
    if (!dateRange || !dateRange[0] || !dateRange[1]) return appointments;
    const start = dateRange[0].startOf('day');
    const end = dateRange[1].endOf('day');
    return appointments.filter(a => {
      const appDate = dayjs(a.date);
      return appDate.isAfter(start) && appDate.isBefore(end);
    });
  };

  const statsAppointments = getFilteredAppointments();

  const dailyStats = () => {
    const map = new Map();
    statsAppointments.forEach(app => {
      const date = app.date;
      if (!map.has(date)) {
        map.set(date, { date, count: 0, completedCount: 0, revenue: 0 });
      }
      const item = map.get(date);
      item.count += 1;
      if (app.status === 'completed') {
        item.completedCount += 1;
        const service = services.find(s => s.id === app.serviceId);
        if (service) item.revenue += service.price;
      }
    });
    return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
  };

  const serviceStats = () => {
    const map = new Map();
    statsAppointments.forEach(app => {
      if (app.status !== 'completed') return;
      const serviceId = app.serviceId;
      const service = services.find(s => s.id === serviceId);
      if (!service) return;
      if (!map.has(serviceId)) {
        map.set(serviceId, {
          serviceId,
          serviceName: service.name,
          count: 0,
          revenue: 0,
        });
      }
      const item = map.get(serviceId);
      item.count += 1;
      item.revenue += service.price;
    });
    return Array.from(map.values());
  };

  const staffStats = () => {
    const map = new Map();
    statsAppointments.forEach(app => {
      if (app.status !== 'completed') return;
      const staffId = app.staffId;
      const staffMember = staff.find(s => s.id === staffId);
      if (!staffMember) return;
      if (!map.has(staffId)) {
        map.set(staffId, {
          staffId,
          staffName: staffMember.name,
          count: 0,
          revenue: 0,
        });
      }
      const item = map.get(staffId);
      item.count += 1;
      const service = services.find(s => s.id === app.serviceId);
      if (service) item.revenue += service.price;
    });
    return Array.from(map.values());
  };

  const totalRevenue = statsAppointments
    .filter(a => a.status === 'completed')
    .reduce((sum, a) => {
      const service = services.find(s => s.id === a.serviceId);
      return sum + (service?.price || 0);
    }, 0);

  const staffColumns = [
    { title: 'Tên nhân viên', dataIndex: 'name', key: 'name' },
    { title: 'Số khách/ngày', dataIndex: 'maxCustomersPerDay', key: 'maxCustomersPerDay' },
    {
      title: 'Lịch làm việc',
      dataIndex: 'workSchedule',
      key: 'workSchedule',
      render: (sched: any[]) => (
        <ul style={{ margin: 0, paddingLeft: 16 }}>
          {sched.map((w, idx) => (
            <li key={idx}>
              {daysOfWeek.find(d => d.value === w.dayOfWeek)?.label}: {w.startTime}-{w.endTime}
            </li>
          ))}
        </ul>
      ),
    },
    {
      title: 'Đánh giá TB',
      key: 'avgRating',
      render: (_: any, record: any) => {
        const avg = getStaffAverageRating(record.id);
        return avg ? (
          <span>
            {avg.toFixed(1)} ⭐ ({reviews.filter(r => r.staffId === record.id).length} lượt)
          </span>
        ) : (
          <Text type="secondary">Chưa có</Text>
        );
      },
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, record: any) => (
        <Space>
          <Button icon={<EditOutlined />} size="small" onClick={() => openModal('staff', record)} />
          <Popconfirm title="Xóa nhân viên?" onConfirm={() => deleteStaff(record.id)}>
            <Button icon={<DeleteOutlined />} size="small" danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const serviceColumns = [
    { title: 'Tên dịch vụ', dataIndex: 'name', key: 'name' },
    {
      title: 'Giá',
      dataIndex: 'price',
      key: 'price',
      render: (p: number) => p.toLocaleString('vi-VN') + ' đ',
    },
    { title: 'Thời gian (phút)', dataIndex: 'duration', key: 'duration' },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, record: any) => (
        <Space>
          <Button icon={<EditOutlined />} size="small" onClick={() => openModal('service', record)} />
          <Popconfirm title="Xóa dịch vụ?" onConfirm={() => deleteService(record.id)}>
            <Button icon={<DeleteOutlined />} size="small" danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const appointmentColumns = [
    { title: 'Khách hàng', dataIndex: 'customerName', key: 'customerName' },
    { title: 'SĐT', dataIndex: 'customerPhone', key: 'customerPhone' },
    {
      title: 'Dịch vụ',
      dataIndex: 'serviceId',
      key: 'serviceId',
      render: (id: string) => services.find(s => s.id === id)?.name || 'N/A',
    },
    {
      title: 'Nhân viên',
      dataIndex: 'staffId',
      key: 'staffId',
      render: (id: string) => staff.find(s => s.id === id)?.name || 'N/A',
    },
    {
      title: 'Thời gian',
      key: 'datetime',
      render: (_: any, record: any) => `${record.date} ${record.time}`,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string, record: any) => (
        <Select
          value={status}
          size="small"
          style={{ width: 130 }}
          disabled={status === 'completed' || status === 'cancelled'} 
          onChange={async (newStatus) => {
            const success = await updateAppointment(record.id, { status: newStatus });
            if (success) {
              message.success('Cập nhật trạng thái thành công');
            }
          }}
        >
          {statusOptions.map(opt => (
            <Option key={opt.value} value={opt.value}>
              <Badge color={opt.color} text={opt.label} />
            </Option>
          ))}
        </Select>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, record: any) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            size="small"
            onClick={() => openModal('appointment', record)}
            disabled={record.status === 'completed' || record.status === 'cancelled'} 
          />
          <Popconfirm title="Hủy lịch hẹn?" onConfirm={() => deleteAppointment(record.id)}>
            <Button icon={<DeleteOutlined />} size="small" danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const reviewColumns = [
    {
      title: 'Khách hàng',
      dataIndex: 'customerName',
      key: 'customerName',
    },
    {
      title: 'Nhân viên',
      dataIndex: 'staffId',
      key: 'staffId',
      render: (id: string) => staff.find(s => s.id === id)?.name || 'N/A',
    },
    {
      title: 'Dịch vụ',
      dataIndex: 'serviceId',
      key: 'serviceId',
      render: (id: string) => services.find(s => s.id === id)?.name || 'N/A',
    },
    {
      title: 'Đánh giá',
      dataIndex: 'rating',
      key: 'rating',
      render: (rating: number) => (
        <span>
          {[...Array(5)].map((_, i) =>
            i < rating ? <StarFilled key={i} style={{ color: '#faad14' }} /> : <StarOutlined key={i} />
          )}
        </span>
      ),
    },
    {
      title: 'Nhận xét',
      dataIndex: 'comment',
      key: 'comment',
      ellipsis: true,
    },
    {
      title: 'Phản hồi',
      dataIndex: 'reply',
      key: 'reply',
      render: (reply: string, record: any) => (
        <Space>
          {reply ? <Text>{reply}</Text> : <Text type="secondary">Chưa phản hồi</Text>}
          <Button
            size="small"
            icon={<MessageOutlined />}
            onClick={() => openReplyModal(record)}
          >
            Phản hồi
          </Button>
        </Space>
      ),
    },
    {
      title: 'Ngày đánh giá',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (ts: number) => dayjs(ts).format('DD/MM/YYYY HH:mm'),
    },
  ];

  const dailyColumns = [
    { title: 'Ngày', dataIndex: 'date', key: 'date' },
    { title: 'Tổng lịch hẹn', dataIndex: 'count', key: 'count' },
    { title: 'Hoàn thành', dataIndex: 'completedCount', key: 'completedCount' },
    {
      title: 'Doanh thu',
      dataIndex: 'revenue',
      key: 'revenue',
      render: (val: number) => val.toLocaleString('vi-VN') + ' đ',
    },
  ];

  const serviceStatsColumns = [
    { title: 'Dịch vụ', dataIndex: 'serviceName', key: 'serviceName' },
    { title: 'Số lần thực hiện', dataIndex: 'count', key: 'count' },
    {
      title: 'Doanh thu',
      dataIndex: 'revenue',
      key: 'revenue',
      render: (val: number) => val.toLocaleString('vi-VN') + ' đ',
    },
  ];

  const staffStatsColumns = [
    { title: 'Nhân viên', dataIndex: 'staffName', key: 'staffName' },
    { title: 'Số lần phục vụ', dataIndex: 'count', key: 'count' },
    {
      title: 'Doanh thu',
      dataIndex: 'revenue',
      key: 'revenue',
      render: (val: number) => val.toLocaleString('vi-VN') + ' đ',
    },
  ];

  return (
    <div
      style={{
        padding: 24,
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
      }}
    >
      <Card style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Tabs defaultActiveKey="1" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <TabPane tab="Nhân viên" key="1" style={{ height: '100%' }}>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal('staff')} style={{ marginBottom: 16 }}>
              Thêm nhân viên
            </Button>
            <Table columns={staffColumns} dataSource={staff} rowKey="id" style={{ height: 'calc(100% - 56px)' }} />
          </TabPane>

          <TabPane tab="Dịch vụ" key="2" style={{ height: '100%' }}>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal('service')} style={{ marginBottom: 16 }}>
              Thêm dịch vụ
            </Button>
            <Table columns={serviceColumns} dataSource={services} rowKey="id" style={{ height: 'calc(100% - 56px)' }} />
          </TabPane>

          <TabPane tab="Lịch hẹn" key="3" style={{ height: '100%' }}>
            <Space style={{ marginBottom: 16 }} wrap>
              <Select
                placeholder="Lọc theo trạng thái"
                allowClear
                style={{ width: 150 }}
                onChange={value => setFilterStatus(value)}
              >
                {statusOptions.map(opt => (
                  <Option key={opt.value} value={opt.value}>{opt.label}</Option>
                ))}
              </Select>
              <Select
                placeholder="Lọc theo nhân viên"
                allowClear
                style={{ width: 150 }}
                onChange={value => setFilterStaff(value)}
              >
                {staff.map(s => <Option key={s.id} value={s.id}>{s.name}</Option>)}
              </Select>
              <DatePicker
                placeholder="Lọc theo ngày"
                allowClear
                onChange={(date) => setFilterDate(date ? date.format('YYYY-MM-DD') : undefined)}
              />
              <Button icon={<FilterOutlined />}>Lọc</Button>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal('appointment')}>
                Đặt lịch mới
              </Button>
            </Space>
            <Table columns={appointmentColumns} dataSource={filteredAppointments} rowKey="id" style={{ height: 'calc(100% - 88px)' }} />
          </TabPane>

          <TabPane tab="Đánh giá" key="4" style={{ height: '100%' }}>
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Card title="Đánh giá của khách hàng" style={{ marginBottom: 16 }}>
                <Table dataSource={reviews} rowKey="id" columns={reviewColumns} />
              </Card>
              <Card title="Lịch hẹn hoàn thành chờ đánh giá" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <Table
                  dataSource={appointments.filter(a => a.status === 'completed' && !reviews.some(r => r.appointmentId === a.id))}
                  rowKey="id"
                  columns={[
                    { title: 'Khách hàng', dataIndex: 'customerName', key: 'customerName' },
                    {
                      title: 'Dịch vụ',
                      dataIndex: 'serviceId',
                      key: 'serviceId',
                      render: (id: string) => services.find(s => s.id === id)?.name || 'N/A',
                    },
                    {
                      title: 'Nhân viên',
                      dataIndex: 'staffId',
                      key: 'staffId',
                      render: (id: string) => staff.find(s => s.id === id)?.name || 'N/A',
                    },
                    {
                      title: 'Ngày giờ',
                      key: 'datetime',
                      render: (_: any, record: any) => `${record.date} ${record.time}`,
                    },
                    {
                      title: 'Thao tác',
                      key: 'action',
                      render: (_: any, record: any) => (
                        <Button type="primary" size="small" onClick={() => openReviewModal(record)}>
                          Đánh giá
                        </Button>
                      ),
                    },
                  ]}
                  style={{ flex: 1 }}
                />
              </Card>
            </div>
          </TabPane>

          <TabPane tab="Thống kê" key="5" style={{ height: '100%' }}>
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Card title="Bộ lọc thời gian" style={{ marginBottom: 16 }}>
                <Space>
                  <RangePicker onChange={(dates) => setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs])} />
                  <Button onClick={() => setDateRange(null)}>Xóa lọc</Button>
                </Space>
              </Card>

              <Row gutter={16} style={{ marginBottom: 16 }}>
                <Col span={6}>
                  <Statistic title="Tổng lịch hẹn" value={statsAppointments.length} />
                </Col>
                <Col span={6}>
                  <Statistic title="Hoàn thành" value={statsAppointments.filter(a => a.status === 'completed').length} />
                </Col>
                <Col span={6}>
                  <Statistic
                    title="Doanh thu"
                    value={totalRevenue}
                    formatter={(val) => (val as number).toLocaleString('vi-VN') + ' đ'}
                  />
                </Col>
              </Row>

              <Card style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <Tabs size="small" defaultActiveKey="daily" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <TabPane tab="Theo ngày" key="daily" style={{ height: '100%' }}>
                    <Table columns={dailyColumns} dataSource={dailyStats()} rowKey="date" pagination={false} style={{ height: '100%' }} />
                  </TabPane>
                  <TabPane tab="Theo dịch vụ" key="service" style={{ height: '100%' }}>
                    <Table columns={serviceStatsColumns} dataSource={serviceStats()} rowKey="serviceId" pagination={false} style={{ height: '100%' }} />
                  </TabPane>
                  <TabPane tab="Theo nhân viên" key="staff" style={{ height: '100%' }}>
                    <Table columns={staffStatsColumns} dataSource={staffStats()} rowKey="staffId" pagination={false} style={{ height: '100%' }} />
                  </TabPane>
                </Tabs>
              </Card>
            </div>
          </TabPane>
        </Tabs>
      </Card>

      <Modal
        title={editingId ? 'Sửa nhân viên' : 'Thêm nhân viên'}
        visible={modalVisible && modalType === 'staff'}
        onCancel={() => setModalVisible(false)}
        onOk={handleSubmit}
        width={700}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Tên nhân viên" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="maxCustomersPerDay" label="Số khách tối đa/ngày" rules={[{ required: true }]}>
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
          <Card type="inner" title="Lịch làm việc" size="small" style={{ marginBottom: 16 }}>
            <Space align="baseline">
              <Form.Item name="workDay" label="Ngày" style={{ marginBottom: 0 }}>
                <Select placeholder="Chọn ngày" style={{ width: 120 }}>
                  {daysOfWeek.map(d => (
                    <Option key={d.value} value={d.value}>
                      {d.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item name="workStart" label="Từ" style={{ marginBottom: 0 }}>
                <TimePicker format="HH:mm" />
              </Form.Item>
              <Form.Item name="workEnd" label="Đến" style={{ marginBottom: 0 }}>
                <TimePicker format="HH:mm" />
              </Form.Item>
              <Button onClick={addWorkDay}>Thêm</Button>
            </Space>
            <div style={{ marginTop: 8 }}>
              {workSchedule.map((w, idx) => (
                <Tag key={idx} closable onClose={() => removeWorkDay(idx)} style={{ marginBottom: 4 }}>
                  {daysOfWeek.find(d => d.value === w.dayOfWeek)?.label}: {w.startTime}-{w.endTime}
                </Tag>
              ))}
            </div>
          </Card>
        </Form>
      </Modal>

      <Modal
        title={editingId ? 'Sửa dịch vụ' : 'Thêm dịch vụ'}
        visible={modalVisible && modalType === 'service'}
        onCancel={() => setModalVisible(false)}
        onOk={handleSubmit}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Tên dịch vụ" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="price" label="Giá" rules={[{ required: true }]}>
            <InputNumber
              min={0}
              style={{ width: '100%' }}
              formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            />
          </Form.Item>
          <Form.Item name="duration" label="Thời gian (phút)" rules={[{ required: true }]}>
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={editingId ? 'Sửa lịch hẹn' : 'Đặt lịch mới'}
        visible={modalVisible && modalType === 'appointment'}
        onCancel={() => setModalVisible(false)}
        onOk={handleSubmit}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="customerName" label="Tên khách hàng" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="customerPhone" label="Số điện thoại" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="serviceId" label="Dịch vụ" rules={[{ required: true }]}>
            <Select placeholder="Chọn dịch vụ">
              {services.map(s => (
                <Option key={s.id} value={s.id}>
                  {s.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="staffId" label="Nhân viên" rules={[{ required: true }]}>
            <Select placeholder="Chọn nhân viên">
              {staff.map(s => (
                <Option key={s.id} value={s.id}>
                  {s.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="date" label="Ngày" rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
          </Form.Item>
          <Form.Item name="time" label="Giờ bắt đầu" rules={[{ required: true }]}>
            <TimePicker format="HH:mm" style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="status" label="Trạng thái" initialValue="pending">
            <Select>
              {statusOptions.map(opt => (
                <Option key={opt.value} value={opt.value}>{opt.label}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="notes" label="Ghi chú">
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Đánh giá dịch vụ"
        visible={reviewModalVisible}
        onCancel={() => setReviewModalVisible(false)}
        onOk={handleSubmitReview}
        okText="Gửi đánh giá"
      >
        <Form form={reviewForm} layout="vertical">
          <Form.Item
            name="rating"
            label="Đánh giá (1-5 sao)"
            rules={[{ required: true, message: 'Vui lòng chọn số sao' }]}
          >
            <Select placeholder="Chọn số sao">
              {[1,2,3,4,5].map(s => (
                <Option key={s} value={s}>
                  {[...Array(s)].map((_, i) => '⭐')} {s} sao
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="comment" label="Nhận xét" rules={[{ required: true }]}>
            <Input.TextArea rows={3} placeholder="Chia sẻ trải nghiệm của bạn..." />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Phản hồi đánh giá"
        visible={replyModalVisible}
        onCancel={() => setReplyModalVisible(false)}
        onOk={handleSubmitReply}
        okText="Gửi phản hồi"
      >
        <Form form={replyForm} layout="vertical">
          <Form.Item name="reply" label="Nội dung phản hồi" rules={[{ required: true }]}>
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default DatLichPage;