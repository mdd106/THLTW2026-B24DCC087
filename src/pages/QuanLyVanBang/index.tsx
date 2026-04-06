import {
  Button,
  Card,
  Col,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Row,
  Select,
  Space,
  Table,
  Tabs,
  Tag,
  Typography,
  message,
} from 'antd';
import type { ColumnsType } from 'antd/lib/table';
import MyDatePicker from '@/components/MyDatePicker';
import moment from 'moment';
import { useMemo, useState } from 'react';

type FieldType = 'String' | 'Number' | 'Date';

interface SoVanBangRecord {
  id: string;
  nam: number;
  soVanBang: string;
  moTa?: string;
}

interface QuyetDinhRecord {
  id: string;
  soQuyetDinh: string;
  ngayBanHanh: string;
  trichYeu: string;
  soVanBangId: string;
  tongLuotTraCuu: number;
}

interface DynamicFieldRecord {
  id: string;
  tenTruong: string;
  kieuDuLieu: FieldType;
}

interface VanBangRecord {
  id: string;
  soVaoSo: number;
  soHieuVanBang: string;
  maSinhVien: string;
  hoTen: string;
  ngaySinh: string;
  quyetDinhId: string;
  soVanBangId: string;
  dynamicValues: Record<string, string | number>;
}

interface SearchFormValue {
  soHieuVanBang?: string;
  soVaoSo?: number;
  maSinhVien?: string;
  hoTen?: string;
  ngaySinh?: string | moment.Moment;
}

interface QlvbState {
  soVanBangs: SoVanBangRecord[];
  quyetDinhs: QuyetDinhRecord[];
  dynamicFields: DynamicFieldRecord[];
  vanBangs: VanBangRecord[];
}

const STORAGE_KEY = 'qlvb_demo_state_v1';

const DEFAULT_STATE: QlvbState = {
  soVanBangs: [
    { id: 'svb-1', nam: 2026, soVanBang: 'VB-2026', moTa: 'Sổ văn bằng năm 2026' },
    { id: 'svb-2', nam: 2025, soVanBang: 'VB-2025', moTa: 'Sổ văn bằng năm 2025' },
  ],
  quyetDinhs: [
    {
      id: 'qd-1',
      soQuyetDinh: 'QĐ-01/2026',
      ngayBanHanh: moment().subtract(20, 'days').toISOString(),
      trichYeu: 'Công nhận tốt nghiệp đợt 1 năm 2026',
      soVanBangId: 'svb-1',
      tongLuotTraCuu: 0,
    },
  ],
  dynamicFields: [
    { id: 'f-1', tenTruong: 'Điểm trung bình', kieuDuLieu: 'Number' },
    { id: 'f-2', tenTruong: 'Xếp hạng', kieuDuLieu: 'String' },
    { id: 'f-3', tenTruong: 'Ngành đào tạo', kieuDuLieu: 'String' },
  ],
  vanBangs: [],
};

const getStateFromStorage = (): QlvbState => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw) as QlvbState;
    return {
      ...DEFAULT_STATE,
      ...parsed,
      soVanBangs: parsed.soVanBangs || [],
      quyetDinhs: parsed.quyetDinhs || [],
      dynamicFields: parsed.dynamicFields || [],
      vanBangs: parsed.vanBangs || [],
    };
  } catch {
    return DEFAULT_STATE;
  }
};

const saveState = (state: QlvbState) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

const uid = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const toIsoString = (value?: string | moment.Moment) => {
  if (!value) return undefined;
  if (typeof value === 'string') return moment(value).toISOString();
  return value.toISOString();
};

const QuanLyVanBangPage = () => {
  const [state, setState] = useState<QlvbState>(() => getStateFromStorage());

  const [visibleSoVanBang, setVisibleSoVanBang] = useState(false);
  const [visibleQuyetDinh, setVisibleQuyetDinh] = useState(false);
  const [visibleField, setVisibleField] = useState(false);
  const [visibleVanBang, setVisibleVanBang] = useState(false);

  const [editingSoVanBang, setEditingSoVanBang] = useState<SoVanBangRecord>();
  const [editingQuyetDinh, setEditingQuyetDinh] = useState<QuyetDinhRecord>();
  const [editingField, setEditingField] = useState<DynamicFieldRecord>();
  const [editingVanBang, setEditingVanBang] = useState<VanBangRecord>();

  const [searchResult, setSearchResult] = useState<VanBangRecord[]>([]);
  const [searched, setSearched] = useState(false);

  const [soVanBangForm] = Form.useForm();
  const [quyetDinhForm] = Form.useForm();
  const [fieldForm] = Form.useForm();
  const [vanBangForm] = Form.useForm();
  const [searchForm] = Form.useForm();

  const soVanBangMap = useMemo(
    () => state.soVanBangs.reduce<Record<string, SoVanBangRecord>>((acc, cur) => ({ ...acc, [cur.id]: cur }), {}),
    [state.soVanBangs],
  );
  const quyetDinhMap = useMemo(
    () => state.quyetDinhs.reduce<Record<string, QuyetDinhRecord>>((acc, cur) => ({ ...acc, [cur.id]: cur }), {}),
    [state.quyetDinhs],
  );

  const updateState = (next: QlvbState) => {
    setState(next);
    saveState(next);
  };

  const maxSoVaoSoBySoVanBang = (soVanBangId: string) => {
    const values = state.vanBangs.filter((v) => v.soVanBangId === soVanBangId).map((v) => v.soVaoSo);
    if (!values.length) return 0;
    return Math.max(...values);
  };

  const getNextSoVaoSo = (soVanBangId: string) => maxSoVaoSoBySoVanBang(soVanBangId) + 1;

  const openSoVanBangModal = (item?: SoVanBangRecord) => {
    setEditingSoVanBang(item);
    setVisibleSoVanBang(true);
    soVanBangForm.setFieldsValue(
      item || {
        nam: moment().year(),
      },
    );
  };

  const openQuyetDinhModal = (item?: QuyetDinhRecord) => {
    setEditingQuyetDinh(item);
    setVisibleQuyetDinh(true);
    quyetDinhForm.setFieldsValue(
      item
        ? { ...item, ngayBanHanh: moment(item.ngayBanHanh) }
        : { ngayBanHanh: moment(), soVanBangId: state.soVanBangs[0]?.id },
    );
  };

  const openFieldModal = (item?: DynamicFieldRecord) => {
    setEditingField(item);
    setVisibleField(true);
    fieldForm.setFieldsValue(item || { kieuDuLieu: 'String' });
  };

  const openVanBangModal = (item?: VanBangRecord) => {
    setEditingVanBang(item);
    setVisibleVanBang(true);
    const defaultSoVanBangId = item?.soVanBangId || state.soVanBangs[0]?.id;
    const dynamicValues = { ...(item?.dynamicValues || {}) };
    state.dynamicFields.forEach((field) => {
      if (field.kieuDuLieu === 'Date' && dynamicValues[field.id]) {
        dynamicValues[field.id] = moment(dynamicValues[field.id] as string) as any;
      }
    });
    vanBangForm.setFieldsValue({
      ...item,
      soVanBangId: defaultSoVanBangId,
      quyetDinhId: item?.quyetDinhId || state.quyetDinhs[0]?.id,
      ngaySinh: item?.ngaySinh ? moment(item.ngaySinh) : undefined,
      soVaoSo: item?.soVaoSo || (defaultSoVanBangId ? getNextSoVaoSo(defaultSoVanBangId) : undefined),
      dynamicValues,
    });
  };

  const submitSoVanBang = async () => {
    const values = await soVanBangForm.validateFields();
    const nextRecord: SoVanBangRecord = {
      id: editingSoVanBang?.id || uid(),
      nam: values.nam,
      soVanBang: values.soVanBang,
      moTa: values.moTa,
    };
    const soVanBangs = editingSoVanBang
      ? state.soVanBangs.map((i) => (i.id === editingSoVanBang.id ? nextRecord : i))
      : [...state.soVanBangs, nextRecord];
    updateState({ ...state, soVanBangs });
    message.success(editingSoVanBang ? 'Cập nhật sổ văn bằng thành công' : 'Thêm sổ văn bằng thành công');
    setVisibleSoVanBang(false);
    setEditingSoVanBang(undefined);
    soVanBangForm.resetFields();
  };

  const submitQuyetDinh = async () => {
    const values = await quyetDinhForm.validateFields();
    const ngayBanHanh = toIsoString(values.ngayBanHanh);
    if (!ngayBanHanh) {
      message.error('Ngày ban hành không hợp lệ');
      return;
    }
    const nextRecord: QuyetDinhRecord = {
      id: editingQuyetDinh?.id || uid(),
      soQuyetDinh: values.soQuyetDinh,
      ngayBanHanh,
      trichYeu: values.trichYeu,
      soVanBangId: values.soVanBangId,
      tongLuotTraCuu: editingQuyetDinh?.tongLuotTraCuu || 0,
    };
    const quyetDinhs = editingQuyetDinh
      ? state.quyetDinhs.map((i) => (i.id === editingQuyetDinh.id ? nextRecord : i))
      : [...state.quyetDinhs, nextRecord];
    updateState({ ...state, quyetDinhs });
    message.success(editingQuyetDinh ? 'Cập nhật quyết định thành công' : 'Thêm quyết định thành công');
    setVisibleQuyetDinh(false);
    setEditingQuyetDinh(undefined);
    quyetDinhForm.resetFields();
  };

  const submitField = async () => {
    const values = await fieldForm.validateFields();
    const nextRecord: DynamicFieldRecord = {
      id: editingField?.id || uid(),
      tenTruong: values.tenTruong,
      kieuDuLieu: values.kieuDuLieu,
    };
    const dynamicFields = editingField
      ? state.dynamicFields.map((i) => (i.id === editingField.id ? nextRecord : i))
      : [...state.dynamicFields, nextRecord];
    updateState({ ...state, dynamicFields });
    message.success(editingField ? 'Cập nhật trường thành công' : 'Thêm trường thành công');
    setVisibleField(false);
    setEditingField(undefined);
    fieldForm.resetFields();
  };

  const submitVanBang = async () => {
    const values = await vanBangForm.validateFields();
    const soVanBangId = values.soVanBangId;
    const hasDuplicate = state.vanBangs.some(
      (item) =>
        item.soVanBangId === soVanBangId &&
        item.soVaoSo === values.soVaoSo &&
        (!editingVanBang || editingVanBang.id !== item.id),
    );
    if (hasDuplicate) {
      message.error('Số vào sổ đã tồn tại trong sổ văn bằng này');
      return;
    }
    const dynamicValues = { ...(values.dynamicValues || {}) };
    state.dynamicFields.forEach((field) => {
      if (field.kieuDuLieu === 'Date' && dynamicValues[field.id]) {
        dynamicValues[field.id] = toIsoString(dynamicValues[field.id] as string | moment.Moment) as string;
      }
    });
    const ngaySinh = toIsoString(values.ngaySinh);
    if (!ngaySinh) {
      message.error('Ngày sinh không hợp lệ');
      return;
    }
    const nextRecord: VanBangRecord = {
      id: editingVanBang?.id || uid(),
      soVaoSo: values.soVaoSo,
      soHieuVanBang: values.soHieuVanBang,
      maSinhVien: values.maSinhVien,
      hoTen: values.hoTen,
      ngaySinh,
      quyetDinhId: values.quyetDinhId,
      soVanBangId: values.soVanBangId,
      dynamicValues,
    };
    const vanBangs = editingVanBang
      ? state.vanBangs.map((i) => (i.id === editingVanBang.id ? nextRecord : i))
      : [...state.vanBangs, nextRecord];
    updateState({ ...state, vanBangs });
    message.success(editingVanBang ? 'Cập nhật văn bằng thành công' : 'Thêm văn bằng thành công');
    setVisibleVanBang(false);
    setEditingVanBang(undefined);
    vanBangForm.resetFields();
  };

  const onSearch = async () => {
    const values: SearchFormValue = await searchForm.validateFields();
    const activeCriteria = [
      values.soHieuVanBang,
      values.soVaoSo,
      values.maSinhVien,
      values.hoTen,
      values.ngaySinh,
    ].filter((v) => v !== undefined && v !== null && `${v}`.trim() !== '');

    if (activeCriteria.length < 2) {
      message.warning('Cần nhập ít nhất 2 tham số tìm kiếm');
      return;
    }

    const result = state.vanBangs.filter((v) => {
      const okSoHieu = !values.soHieuVanBang || v.soHieuVanBang.includes(values.soHieuVanBang);
      const okSoVaoSo = values.soVaoSo === undefined || v.soVaoSo === values.soVaoSo;
      const okMsv = !values.maSinhVien || v.maSinhVien.includes(values.maSinhVien);
      const okHoTen = !values.hoTen || v.hoTen.toLowerCase().includes(values.hoTen.toLowerCase());
      const okNgaySinh =
        !values.ngaySinh || moment(v.ngaySinh).format('YYYY-MM-DD') === moment(values.ngaySinh).format('YYYY-MM-DD');
      return okSoHieu && okSoVaoSo && okMsv && okHoTen && okNgaySinh;
    });

    const counter = new Map<string, number>();
    result.forEach((item) => {
      counter.set(item.quyetDinhId, (counter.get(item.quyetDinhId) || 0) + 1);
    });
    const quyetDinhs = state.quyetDinhs.map((qd) => ({
      ...qd,
      tongLuotTraCuu: qd.tongLuotTraCuu + (counter.get(qd.id) || 0),
    }));
    updateState({ ...state, quyetDinhs });

    setSearchResult(result);
    setSearched(true);
  };

  const soVanBangColumns: ColumnsType<SoVanBangRecord> = [
    { title: 'Năm', dataIndex: 'nam', width: 100 },
    { title: 'Số văn bằng', dataIndex: 'soVanBang' },
    { title: 'Mô tả', dataIndex: 'moTa' },
    {
      title: 'Thao tác',
      width: 160,
      render: (_, record) => (
        <Space>
          <Button type="link" onClick={() => openSoVanBangModal(record)}>
            Sửa
          </Button>
          <Popconfirm
            title="Xóa sổ văn bằng?"
            onConfirm={() => {
              updateState({
                ...state,
                soVanBangs: state.soVanBangs.filter((i) => i.id !== record.id),
                quyetDinhs: state.quyetDinhs.filter((i) => i.soVanBangId !== record.id),
                vanBangs: state.vanBangs.filter((i) => i.soVanBangId !== record.id),
              });
              message.success('Đã xóa');
            }}
          >
            <Button danger type="link">
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const quyetDinhColumns: ColumnsType<QuyetDinhRecord> = [
    { title: 'Số QĐ', dataIndex: 'soQuyetDinh' },
    {
      title: 'Ngày ban hành',
      dataIndex: 'ngayBanHanh',
      render: (val: string) => moment(val).format('DD/MM/YYYY'),
      width: 130,
    },
    { title: 'Trích yếu', dataIndex: 'trichYeu' },
    {
      title: 'Sổ văn bằng',
      dataIndex: 'soVanBangId',
      render: (id: string) => soVanBangMap[id]?.soVanBang || '-',
      width: 140,
    },
    {
      title: 'Lượt tra cứu',
      dataIndex: 'tongLuotTraCuu',
      width: 120,
      render: (val: number) => <Tag color={val > 0 ? 'blue' : 'default'}>{val}</Tag>,
    },
    {
      title: 'Thao tác',
      width: 160,
      render: (_, record) => (
        <Space>
          <Button type="link" onClick={() => openQuyetDinhModal(record)}>
            Sửa
          </Button>
          <Popconfirm
            title="Xóa quyết định?"
            onConfirm={() => {
              updateState({
                ...state,
                quyetDinhs: state.quyetDinhs.filter((i) => i.id !== record.id),
                vanBangs: state.vanBangs.filter((i) => i.quyetDinhId !== record.id),
              });
              message.success('Đã xóa');
            }}
          >
            <Button danger type="link">
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const fieldColumns: ColumnsType<DynamicFieldRecord> = [
    { title: 'Tên trường', dataIndex: 'tenTruong' },
    {
      title: 'Kiểu dữ liệu',
      dataIndex: 'kieuDuLieu',
      width: 140,
      render: (val: FieldType) => <Tag>{val}</Tag>,
    },
    {
      title: 'Thao tác',
      width: 160,
      render: (_, record) => (
        <Space>
          <Button type="link" onClick={() => openFieldModal(record)}>
            Sửa
          </Button>
          <Popconfirm
            title="Xóa trường cấu hình?"
            onConfirm={() => {
              const nextFields = state.dynamicFields.filter((i) => i.id !== record.id);
              const nextVanBangs = state.vanBangs.map((vb) => {
                const nextDynamicValues = { ...vb.dynamicValues };
                delete nextDynamicValues[record.id];
                return { ...vb, dynamicValues: nextDynamicValues };
              });
              updateState({ ...state, dynamicFields: nextFields, vanBangs: nextVanBangs });
              message.success('Đã xóa');
            }}
          >
            <Button danger type="link">
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const vanBangColumns: ColumnsType<VanBangRecord> = [
    { title: 'Số vào sổ', dataIndex: 'soVaoSo', width: 110 },
    { title: 'Số hiệu VB', dataIndex: 'soHieuVanBang', width: 130 },
    { title: 'MSV', dataIndex: 'maSinhVien', width: 120 },
    { title: 'Họ tên', dataIndex: 'hoTen', width: 180 },
    {
      title: 'Ngày sinh',
      dataIndex: 'ngaySinh',
      render: (val: string) => moment(val).format('DD/MM/YYYY'),
      width: 130,
    },
    {
      title: 'Sổ',
      dataIndex: 'soVanBangId',
      render: (id: string) => soVanBangMap[id]?.soVanBang || '-',
      width: 120,
    },
    {
      title: 'Quyết định',
      dataIndex: 'quyetDinhId',
      render: (id: string) => quyetDinhMap[id]?.soQuyetDinh || '-',
      width: 140,
    },
    {
      title: 'Thông tin mở rộng',
      render: (_, record) => (
        <Space wrap>
          {state.dynamicFields.map((field) => (
            <Tag key={field.id}>
              {field.tenTruong}:{' '}
              {field.kieuDuLieu === 'Date' && record.dynamicValues[field.id]
                ? moment(record.dynamicValues[field.id] as string).format('DD/MM/YYYY')
                : record.dynamicValues[field.id] ?? '-'}
            </Tag>
          ))}
        </Space>
      ),
    },
    {
      title: 'Thao tác',
      width: 160,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button type="link" onClick={() => openVanBangModal(record)}>
            Sửa
          </Button>
          <Popconfirm
            title="Xóa văn bằng?"
            onConfirm={() => {
              updateState({ ...state, vanBangs: state.vanBangs.filter((i) => i.id !== record.id) });
              message.success('Đã xóa');
            }}
          >
            <Button danger type="link">
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card bordered={false}>
      <Typography.Title level={4}>Quản lý văn bằng tốt nghiệp</Typography.Title>
      <Typography.Paragraph type="secondary">
        Module mô phỏng đầy đủ theo đề: quản lý sổ văn bằng, quyết định tốt nghiệp, cấu hình phụ lục,
        thông tin văn bằng và tra cứu.
      </Typography.Paragraph>

      <Tabs defaultActiveKey="1">
        <Tabs.TabPane tab="Sổ văn bằng" key="1">
          <Button type="primary" onClick={() => openSoVanBangModal()} style={{ marginBottom: 12 }}>
            Thêm sổ văn bằng
          </Button>
          <Table rowKey="id" columns={soVanBangColumns} dataSource={state.soVanBangs} pagination={false} />
        </Tabs.TabPane>

        <Tabs.TabPane tab="Quyết định tốt nghiệp" key="2">
          <Button
            type="primary"
            onClick={() => {
              if (!state.soVanBangs.length) {
                message.warning('Cần có ít nhất 1 sổ văn bằng trước');
                return;
              }
              openQuyetDinhModal();
            }}
            style={{ marginBottom: 12 }}
          >
            Thêm quyết định
          </Button>
          <Table rowKey="id" columns={quyetDinhColumns} dataSource={state.quyetDinhs} pagination={false} />
        </Tabs.TabPane>

        <Tabs.TabPane tab="Cấu hình biểu mẫu phụ lục" key="3">
          <Button type="primary" onClick={() => openFieldModal()} style={{ marginBottom: 12 }}>
            Thêm trường cấu hình
          </Button>
          <Table rowKey="id" columns={fieldColumns} dataSource={state.dynamicFields} pagination={false} />
        </Tabs.TabPane>

        <Tabs.TabPane tab="Thông tin văn bằng" key="4">
          <Button
            type="primary"
            onClick={() => {
              if (!state.soVanBangs.length || !state.quyetDinhs.length) {
                message.warning('Cần có sổ văn bằng và quyết định trước khi thêm thông tin văn bằng');
                return;
              }
              openVanBangModal();
            }}
            style={{ marginBottom: 12 }}
          >
            Thêm văn bằng
          </Button>
          <Table
            rowKey="id"
            columns={vanBangColumns}
            dataSource={state.vanBangs}
            scroll={{ x: 1500 }}
            pagination={{ pageSize: 10 }}
          />
        </Tabs.TabPane>

        <Tabs.TabPane tab="Tra cứu văn bằng" key="5">
          <Form form={searchForm} layout="vertical">
            <Row gutter={12}>
              <Col span={8}>
                <Form.Item label="Số hiệu văn bằng" name="soHieuVanBang">
                  <Input placeholder="VD: VB-2026-0001" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="Số vào sổ" name="soVaoSo">
                  <InputNumber min={1} style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="MSV" name="maSinhVien">
                  <Input placeholder="VD: 22010001" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="Họ tên" name="hoTen">
                  <Input />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="Ngày sinh" name="ngaySinh">
                  <MyDatePicker format="DD/MM/YYYY" />
                </Form.Item>
              </Col>
            </Row>
            <Space>
              <Button type="primary" onClick={onSearch}>
                Tra cứu
              </Button>
              <Button
                onClick={() => {
                  searchForm.resetFields();
                  setSearchResult([]);
                  setSearched(false);
                }}
              >
                Đặt lại
              </Button>
            </Space>
          </Form>
          <div style={{ marginTop: 16 }}>
            {searched && (
              <Typography.Paragraph>
                Kết quả: <b>{searchResult.length}</b> bản ghi
              </Typography.Paragraph>
            )}
            <Table rowKey="id" columns={vanBangColumns} dataSource={searchResult} scroll={{ x: 1500 }} />
          </div>
        </Tabs.TabPane>
      </Tabs>

      <Modal
        title={editingSoVanBang ? 'Cập nhật sổ văn bằng' : 'Thêm sổ văn bằng'}
        visible={visibleSoVanBang}
        onCancel={() => setVisibleSoVanBang(false)}
        onOk={submitSoVanBang}
      >
        <Form layout="vertical" form={soVanBangForm}>
          <Form.Item name="nam" label="Năm" rules={[{ required: true, message: 'Không được bỏ trống' }]}>
            <InputNumber min={2000} max={2100} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="soVanBang"
            label="Số văn bằng"
            rules={[{ required: true, message: 'Không được bỏ trống' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="moTa" label="Mô tả">
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={editingQuyetDinh ? 'Cập nhật quyết định' : 'Thêm quyết định'}
        visible={visibleQuyetDinh}
        onCancel={() => setVisibleQuyetDinh(false)}
        onOk={submitQuyetDinh}
      >
        <Form layout="vertical" form={quyetDinhForm}>
          <Form.Item
            name="soQuyetDinh"
            label="Số quyết định"
            rules={[{ required: true, message: 'Không được bỏ trống' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="ngayBanHanh"
            label="Ngày ban hành"
            rules={[{ required: true, message: 'Không được bỏ trống' }]}
          >
            <MyDatePicker format="DD/MM/YYYY" />
          </Form.Item>
          <Form.Item
            name="trichYeu"
            label="Trích yếu"
            rules={[{ required: true, message: 'Không được bỏ trống' }]}
          >
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item
            name="soVanBangId"
            label="Quản lý trong sổ văn bằng"
            rules={[{ required: true, message: 'Không được bỏ trống' }]}
          >
            <Select
              options={state.soVanBangs.map((i) => ({
                value: i.id,
                label: `${i.soVanBang} (${i.nam})`,
              }))}
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={editingField ? 'Cập nhật trường cấu hình' : 'Thêm trường cấu hình'}
        visible={visibleField}
        onCancel={() => setVisibleField(false)}
        onOk={submitField}
      >
        <Form layout="vertical" form={fieldForm}>
          <Form.Item
            name="tenTruong"
            label="Tên trường"
            rules={[{ required: true, message: 'Không được bỏ trống' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="kieuDuLieu"
            label="Kiểu dữ liệu"
            rules={[{ required: true, message: 'Không được bỏ trống' }]}
          >
            <Select
              options={[
                { value: 'String', label: 'String' },
                { value: 'Number', label: 'Number' },
                { value: 'Date', label: 'Date' },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        width={720}
        title={editingVanBang ? 'Cập nhật văn bằng' : 'Thêm thông tin văn bằng'}
        visible={visibleVanBang}
        onCancel={() => setVisibleVanBang(false)}
        onOk={submitVanBang}
      >
        <Form layout="vertical" form={vanBangForm}>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item
                name="soVanBangId"
                label="Sổ văn bằng"
                rules={[{ required: true, message: 'Không được bỏ trống' }]}
              >
                <Select
                  onChange={(value) => {
                    if (!editingVanBang) {
                      vanBangForm.setFieldsValue({ soVaoSo: getNextSoVaoSo(value) });
                    }
                  }}
                  options={state.soVanBangs.map((i) => ({
                    value: i.id,
                    label: `${i.soVanBang} (${i.nam})`,
                  }))}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="soVaoSo"
                label="Số vào sổ"
                rules={[{ required: true, message: 'Không được bỏ trống' }]}
              >
                <InputNumber min={1} style={{ width: '100%' }} disabled />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="soHieuVanBang"
                label="Số hiệu văn bằng"
                rules={[{ required: true, message: 'Không được bỏ trống' }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="maSinhVien" label="Mã sinh viên" rules={[{ required: true, message: 'Bắt buộc' }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="hoTen" label="Họ tên" rules={[{ required: true, message: 'Bắt buộc' }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="ngaySinh" label="Ngày sinh" rules={[{ required: true, message: 'Bắt buộc' }]}>
                <MyDatePicker format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                name="quyetDinhId"
                label="Quyết định tốt nghiệp"
                rules={[{ required: true, message: 'Bắt buộc' }]}
              >
                <Select
                  options={state.quyetDinhs.map((i) => ({
                    value: i.id,
                    label: `${i.soQuyetDinh} - ${i.trichYeu}`,
                  }))}
                />
              </Form.Item>
            </Col>
          </Row>

          <Typography.Title level={5} style={{ marginTop: 8 }}>
            Thông tin mở rộng theo cấu hình biểu mẫu
          </Typography.Title>
          <Row gutter={12}>
            {state.dynamicFields.map((field) => (
              <Col span={12} key={field.id}>
                <Form.Item
                  name={['dynamicValues', field.id]}
                  label={`${field.tenTruong} (${field.kieuDuLieu})`}
                  rules={[{ required: true, message: 'Không được bỏ trống' }]}
                >
                  {field.kieuDuLieu === 'Number' ? (
                    <InputNumber style={{ width: '100%' }} />
                  ) : field.kieuDuLieu === 'Date' ? (
                    <MyDatePicker format="DD/MM/YYYY" />
                  ) : (
                    <Input />
                  )}
                </Form.Item>
              </Col>
            ))}
          </Row>
        </Form>
      </Modal>
    </Card>
  );
};

export default QuanLyVanBangPage;
