import React, { useState, useEffect } from 'react';
import { Card, Table, Tag, Space, Button, Input, Select, Modal, Form, InputNumber, message, Popconfirm, Typography, Row, Col } from 'antd';
import { PlusOutlined, SearchOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';

const { Title } = Typography;

const KTGK = () => {
  const [courses, setCourses] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<any>(null);
  const [searchText, setSearchText] = useState('');
  const [form] = Form.useForm();

  useEffect(() => {
    const saved = localStorage.getItem('ktgk_final_v1');
    if (saved) setCourses(JSON.parse(saved));
  }, []);

  const saveAll = (data: any[]) => {
    setCourses(data);
    localStorage.setItem('ktgk_final_v1', JSON.stringify(data));
  };

  const onFinish = (values: any) => {
    const isDuplicate = courses.some(c => c.name === values.name && c.id !== editingCourse?.id);
    if (isDuplicate) {
      message.error('Tên khóa học đã tồn tại!');
      return;
    }

    let newData;
    if (editingCourse) {
      newData = courses.map(c => c.id === editingCourse.id ? { ...values, id: c.id } : c);
      message.success('Cập nhật thành công!');
    } else {
      newData = [...courses, { ...values, id: Date.now() }];
      message.success('Thêm mới thành công!');
    }

    saveAll(newData);
    setIsModalOpen(false);
    setEditingCourse(null);
    form.resetFields();
  };

  const filteredData = courses.filter(c => 
    c.name?.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <Card style={{ margin: 24 }}>
      <Title level={2} style={{ textAlign: 'center' }}>QUẢN LÝ KHÓA HỌC ONLINE</Title>
      
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <Input 
          placeholder="Tìm tên khóa học..." 
          prefix={<SearchOutlined />} 
          style={{ width: 300 }}
          onChange={e => setSearchText(e.target.value)}
        />
        <Button type="primary" danger icon={<PlusOutlined />} onClick={() => {
          setEditingCourse(null);
          form.resetFields();
          setIsModalOpen(true);
        }}>
          Thêm khóa học mới
        </Button>
      </div>

      <Table 
        dataSource={filteredData} 
        rowKey="id"
        columns={[
          { title: 'Tên khóa học', dataIndex: 'name', render: (text: string) => <b>{text}</b> },
          { title: 'Giảng viên', dataIndex: 'lecturer' },
          { title: 'Học viên', dataIndex: 'studentCount' },
          { title: 'Trạng thái', dataIndex: 'status', render: (s: string) => <Tag color="blue">{s}</Tag> },
          {
            title: 'Thao tác',
            render: (_: any, record: any) => (
              <Space>
                <Button icon={<EditOutlined />} onClick={() => {
                  setEditingCourse(record);
                  form.setFieldsValue(record);
                  setIsModalOpen(true);
                }} />
                <Popconfirm title="Xác nhận xóa?" onConfirm={() => {
                  if (record.studentCount > 0) {
                    message.error('Có học viên không được xóa!');
                    return;
                  }
                  saveAll(courses.filter(c => c.id !== record.id));
                }}>
                  <Button danger icon={<DeleteOutlined />} disabled={record.studentCount > 0} />
                </Popconfirm>
              </Space>
            )
          }
        ]}
      />

      <Modal 
        title={editingCourse ? "Chỉnh sửa" : "Thêm mới"} 
        visible={isModalOpen} // DÙNG visible THAY CHO open
        onOk={() => form.submit()} 
        onCancel={() => setIsModalOpen(false)}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item name="name" label="Tên khóa học" rules={[{ required: true, max: 100 }]}>
            <Input />
          </Form.Item>
          <Form.Item name="lecturer" label="Giảng viên" rules={[{ required: true }]}>
            <Select options={[{value: 'Nguyễn Văn A'}, {value: 'Trần Thị B'}]} />
          </Form.Item>
          <Form.Item name="studentCount" label="Số lượng học viên" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
          <Form.Item name="status" label="Trạng thái" rules={[{ required: true }]}>
            <Select options={[{value: 'Đang mở'}, {value: 'Đã kết thúc'}, {value: 'Tạm dừng'}]} />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default KTGK;