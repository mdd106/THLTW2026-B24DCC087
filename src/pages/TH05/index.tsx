import { CheckOutlined, CloseOutlined, DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import {
  Button,
  Card,
  Form,
  Input,
  Modal,
  Popconfirm,
  Select,
  Space,
  Switch,
  Table,
  Tabs,
  Tag,
  Typography,
} from 'antd';
import dayjs from 'dayjs';
import { useMemo, useState } from 'react';
import { useModel } from 'umi';

import type { CLB, DonDangKy, ThanhVien } from '@/models/clb';

const trangThaiTag = (t: DonDangKy['trangThai']) => {
  const map = {
    pending: { color: 'gold', text: 'Chờ duyệt' },
    approved: { color: 'green', text: 'Đã duyệt' },
    rejected: { color: 'red', text: 'Từ chối' },
  } as const;
  const x = map[t];
  return <Tag color={x.color}>{x.text}</Tag>;
};

const ManageClub: React.FC = () => {
  const {
    clbList,
    donDangKy,
    thanhVien,
    addCLB,
    updateCLB,
    deleteCLB,
    addDonDangKy,
    deleteDonDangKy,
    duyetDon,
    changeClbForThanhVien,
    removeThanhVien,
  } = useModel('clb');

  const [clbModalOpen, setClbModalOpen] = useState(false);
  const [editingClb, setEditingClb] = useState<CLB | null>(null);
  const [clbForm] = Form.useForm();

  const [donModalOpen, setDonModalOpen] = useState(false);
  const [donForm] = Form.useForm();

  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [pendingRejectIds, setPendingRejectIds] = useState<string[]>([]);
  const [rejectReason, setRejectReason] = useState('');

  const [selectedDonIds, setSelectedDonIds] = useState<string[]>([]);
  const [selectedTvIds, setSelectedTvIds] = useState<string[]>([]);
  const [transferClbId, setTransferClbId] = useState<string>();

  const openAddClb = () => {
    setEditingClb(null);
    clbForm.resetFields();
    clbForm.setFieldsValue({ hoatDong: true });
    setClbModalOpen(true);
  };

  const openEditClb = (record: CLB) => {
    setEditingClb(record);
    clbForm.setFieldsValue(record);
    setClbModalOpen(true);
  };

  const submitClb = async () => {
    const v = await clbForm.validateFields();
    if (editingClb) {
      updateCLB(editingClb.id, v);
    } else {
      addCLB(v as Omit<CLB, 'id'>);
    }
    setClbModalOpen(false);
  };

  const openAddDon = () => {
    donForm.resetFields();
    if (clbList[0]) donForm.setFieldsValue({ clbId: clbList[0].id });
    setDonModalOpen(true);
  };

  const submitDon = async () => {
    const v = await donForm.validateFields();
    addDonDangKy(v);
    setDonModalOpen(false);
  };

  const pendingDon = useMemo(() => donDangKy.filter((d) => d.trangThai === 'pending'), [donDangKy]);

  const approveSelected = () => {
    if (!selectedDonIds.length) return;
    duyetDon(selectedDonIds, 'approved');
    setSelectedDonIds([]);
  };

  const requestRejectSelected = () => {
    if (!selectedDonIds.length) return;
    setPendingRejectIds(selectedDonIds);
    setRejectReason('');
    setRejectModalOpen(true);
  };

  const confirmReject = () => {
    const ok = duyetDon(pendingRejectIds, 'rejected', rejectReason.trim() || undefined);
    if (!ok) return;
    setRejectModalOpen(false);
    setPendingRejectIds([]);
    setSelectedDonIds([]);
  };

  const applyTransfer = () => {
    if (!transferClbId || !selectedTvIds.length) return;
    changeClbForThanhVien(selectedTvIds, transferClbId);
    setSelectedTvIds([]);
    setTransferClbId(undefined);
  };

  const clbColumns: ColumnsType<CLB> = [
    {
      title: 'Tên CLB',
      dataIndex: 'ten',
      ellipsis: true,
    },
    {
      title: 'Chủ nhiệm',
      dataIndex: 'chuNhiem',
      width: 160,
    },
    {
      title: 'Ngày thành lập',
      dataIndex: 'ngayThanhLap',
      width: 120,
    },
    {
      title: 'Hoạt động',
      dataIndex: 'hoatDong',
      width: 100,
      render: (v: boolean) => <Tag color={v ? 'green' : 'default'}>{v ? 'Có' : 'Không'}</Tag>,
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 120,
      render: (_, r) => (
        <Space>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => openEditClb(r)} />
          <Popconfirm title="Xóa CLB này?" onConfirm={() => deleteCLB(r.id)}>
            <Button type="link" danger size="small" icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const donColumns: ColumnsType<DonDangKy> = [
    { title: 'Họ tên', dataIndex: 'hoTen', width: 160, ellipsis: true },
    { title: 'Email', dataIndex: 'email', width: 180, ellipsis: true },
    {
      title: 'CLB',
      dataIndex: 'clbId',
      width: 140,
      render: (id: string) => clbList.find((c) => c.id === id)?.ten ?? id,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'trangThai',
      width: 110,
      render: (t) => trangThaiTag(t),
    },
    {
      title: 'Cập nhật',
      dataIndex: 'updatedAt',
      width: 150,
      render: (n: number) => dayjs(n).format('DD/MM/YYYY HH:mm'),
    },
    {
      title: '',
      key: 'del',
      width: 70,
      render: (_, r) => (
        <Popconfirm title="Xóa đơn?" onConfirm={() => deleteDonDangKy(r.id)}>
          <Button type="link" danger size="small" icon={<DeleteOutlined />} />
        </Popconfirm>
      ),
    },
  ];

  const tvColumns: ColumnsType<ThanhVien> = [
    { title: 'Họ tên', dataIndex: 'hoTen', width: 160, ellipsis: true },
    { title: 'Email', dataIndex: 'email', width: 180, ellipsis: true },
    {
      title: 'CLB',
      dataIndex: 'clbId',
      width: 160,
      render: (id: string) => clbList.find((c) => c.id === id)?.ten ?? id,
    },
    { title: 'Ngày đăng ký', dataIndex: 'ngayDangKy', width: 120 },
    {
      title: '',
      key: 'rm',
      width: 70,
      render: (_, r) => (
        <Popconfirm title="Xóa thành viên?" onConfirm={() => removeThanhVien(r.id)}>
          <Button type="link" danger size="small" icon={<DeleteOutlined />} />
        </Popconfirm>
      ),
    },
  ];

  return (
    <Card>
      <Typography.Title level={4} style={{ marginTop: 0 }}>
        Quản lý CLB
      </Typography.Title>
      <Tabs defaultActiveKey="clb">
        <Tabs.TabPane tab="Danh sách CLB" key="clb">
          <Space style={{ marginBottom: 16 }}>
            <Button type="primary" icon={<PlusOutlined />} onClick={openAddClb}>
              Thêm CLB
            </Button>
          </Space>
          <Table rowKey="id" columns={clbColumns} dataSource={clbList} pagination={{ pageSize: 8 }} />
        </Tabs.TabPane>
        <Tabs.TabPane tab="Đơn đăng ký" key="don">
          <Space style={{ marginBottom: 16 }} wrap>
            <Button type="primary" icon={<PlusOutlined />} onClick={openAddDon}>
              Tạo đơn (demo)
            </Button>
            <Button
              type="primary"
              ghost
              icon={<CheckOutlined />}
              disabled={!selectedDonIds.length}
              onClick={approveSelected}
            >
              Duyệt đã chọn
            </Button>
            <Button danger icon={<CloseOutlined />} disabled={!selectedDonIds.length} onClick={requestRejectSelected}>
              Từ chối đã chọn
            </Button>
            <Typography.Text type="secondary">Còn {pendingDon.length} đơn chờ duyệt</Typography.Text>
          </Space>
          <Table
            rowKey="id"
            rowSelection={{
              selectedRowKeys: selectedDonIds,
              onChange: (keys) => setSelectedDonIds(keys as string[]),
              getCheckboxProps: (r) => ({ disabled: r.trangThai !== 'pending' }),
            }}
            columns={donColumns}
            dataSource={donDangKy}
            pagination={{ pageSize: 8 }}
          />
        </Tabs.TabPane>
        <Tabs.TabPane tab="Thành viên" key="tv">
          <Space style={{ marginBottom: 16 }} wrap>
            <Select
              allowClear
              placeholder="Chọn CLB để chuyển"
              style={{ minWidth: 220 }}
              value={transferClbId}
              onChange={(v) => setTransferClbId(v)}
              options={clbList.map((c) => ({ label: c.ten, value: c.id }))}
            />
            <Button type="primary" disabled={!transferClbId || !selectedTvIds.length} onClick={applyTransfer}>
              Chuyển CLB
            </Button>
          </Space>
          <Table
            rowKey="id"
            rowSelection={{
              selectedRowKeys: selectedTvIds,
              onChange: (keys) => setSelectedTvIds(keys as string[]),
            }}
            columns={tvColumns}
            dataSource={thanhVien}
            pagination={{ pageSize: 8 }}
          />
        </Tabs.TabPane>
      </Tabs>

      <Modal
        title={editingClb ? 'Sửa CLB' : 'Thêm CLB'}
        visible={clbModalOpen}
        onOk={submitClb}
        onCancel={() => setClbModalOpen(false)}
        destroyOnClose
      >
        <Form form={clbForm} layout="vertical">
          <Form.Item name="avatar" label="URL ảnh" rules={[{ required: true }]}>
            <Input placeholder="https://..." />
          </Form.Item>
          <Form.Item name="ten" label="Tên CLB" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="ngayThanhLap" label="Ngày thành lập" rules={[{ required: true }]}>
            <Input placeholder="YYYY-MM-DD" />
          </Form.Item>
          <Form.Item name="moTa" label="Mô tả (HTML đơn giản)">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="chuNhiem" label="Chủ nhiệm" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="hoatDong" label="Hoạt động" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>

      <Modal title="Đơn đăng ký" visible={donModalOpen} onOk={submitDon} onCancel={() => setDonModalOpen(false)} destroyOnClose>
        <Form form={donForm} layout="vertical">
          <Form.Item name="clbId" label="CLB" rules={[{ required: true }]}>
            <Select options={clbList.map((c) => ({ label: c.ten, value: c.id }))} />
          </Form.Item>
          <Form.Item name="hoTen" label="Họ tên" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="sdt" label="SĐT" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="gioiTinh" label="Giới tính" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="diaChi" label="Địa chỉ" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="soTruong" label="Sở trường" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="lyDo" label="Lý do" rules={[{ required: true }]}>
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Lý do từ chối"
        visible={rejectModalOpen}
        onOk={confirmReject}
        onCancel={() => setRejectModalOpen(false)}
        okText="Xác nhận từ chối"
      >
        <Input.TextArea rows={3} value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="Bắt buộc khi từ chối" />
      </Modal>
    </Card>
  );
};

export default ManageClub;
