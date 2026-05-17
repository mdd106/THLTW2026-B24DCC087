import { CheckCircleOutlined, ClockCircleOutlined, PlusOutlined, UnorderedListOutlined } from '@ant-design/icons';
import {
	Button,
	Card,
	Col,
	DatePicker,
	Empty,
	Form,
	Input,
	Modal,
	Row,
	Select,
	Space,
	Statistic,
	Table,
	Tabs,
	Tag,
	Typography,
} from 'antd';
import moment from 'moment';
import type { DropResult } from 'react-beautiful-dnd';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { useEffect, useState } from 'react';

/** Giao diện (1 file): gradient, card, tab, kanban, bảng */
const CSS = `
.cv{min-height:100%;padding:16px 20px 32px;background:linear-gradient(180deg,#f0f5ff,#f5f5f5 240px,#fafafa)}
.cv-h{margin-bottom:16px;border-radius:12px;box-shadow:0 1px 2px rgba(0,0,0,.04)}
.cv-title{margin:0!important;font-weight:600!important;letter-spacing:-.02em}
.cv-tab .ant-tabs-nav{margin-bottom:16px}
.cv-tab.ant-tabs-card>.ant-tabs-nav .ant-tabs-tab{border-radius:8px 8px 0 0;padding:10px 20px}
.cv-tab.ant-tabs-card>.ant-tabs-nav .ant-tabs-tab-active{font-weight:600}
.cv-s{border:none;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,.06);transition:.2s}
.cv-s:hover{transform:translateY(-2px);box-shadow:0 6px 16px rgba(0,0,0,.08)}
.cv-s0{border-left:4px solid #1677ff}.cv-s1{border-left:4px solid #52c41a}.cv-s2{border-left:4px solid #ff4d4f}
.cv-k{border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.06)}
.cv-ct{font-weight:600;font-size:15px}.cv-nt{margin:0!important;border-radius:10px}
.cv-dz{min-height:280px;padding:12px;background:#fafafa;border-radius:0 0 8px 8px}
.cv-e{padding:24px 0}.cv-w{margin-bottom:10px}
.cv-tc{border-radius:10px!important;border:1px solid #f0f0f0!important}.cv-tc:hover{border-color:#d9d9d9!important}
.cv-tt{font-weight:600;font-size:14px;color:rgba(0,0,0,.85)}.cv-m{margin-top:8px;font-size:12px;color:rgba(0,0,0,.45)}
.cv-tcard{border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,.06)}
.cv-tbl .ant-table-thead>tr>th{font-weight:600;background:#fafafa}
.cv-n{font-weight:500}.cv-muted{color:rgba(0,0,0,.45)}.cv-tp{border-radius:6px}.cv-form{padding-top:8px}
`;

const LS = 'cv_tasks';
interface Task {
	id: string;
	name: string;
	description: string;
	deadline: string;
	priority: 'high' | 'medium' | 'low';
	tags: string[];
	status: 'todo' | 'doing' | 'done';
	order: number;
}
const COLS = [
	{ id: 'todo' as const, name: 'Cần làm', a: '#1677ff', tc: 'blue' as const },
	{ id: 'doing' as const, name: 'Đang làm', a: '#fa8c16', tc: 'orange' as const },
	{ id: 'done' as const, name: 'Hoàn thành', a: '#52c41a', tc: 'green' as const },
];

function load(): Task[] {
	try {
		const s = localStorage.getItem(LS);
		if (s) {
			const a = JSON.parse(s);
			if (Array.isArray(a)) return a;
		}
	} catch (_) {}
	const t = Date.now() + '';
	return [
		{
			id: t + '1',
			name: 'Viết báo cáo',
			description: '',
			deadline: moment().add(3, 'd').toISOString(),
			priority: 'high',
			tags: ['hoc'],
			status: 'todo',
			order: 0,
		},
		{
			id: t + '2',
			name: 'Đi siêu thị',
			description: '',
			deadline: moment().subtract(1, 'd').toISOString(),
			priority: 'low',
			tags: [],
			status: 'doing',
			order: 0,
		},
	];
}
const qh = (t: Task) => t.status !== 'done' && moment(t.deadline).endOf('day').isBefore(moment());

function drag(prev: Task[], { destination: d, source: s, draggableId: id }: DropResult) {
	if (!d) return prev;
	const task = prev.find((x) => x.id === id);
	if (!task) return prev;
	if (s.droppableId === d.droppableId) {
		const col = s.droppableId as Task['status'];
		const arr = [...prev.filter((x) => x.status === col).sort((a, b) => a.order - b.order)];
		const [rm] = arr.splice(s.index, 1);
		arr.splice(d.index, 0, rm);
		const m = Object.fromEntries(arr.map((x, i) => [x.id, { ...x, order: i }]));
		return prev.map((x) => m[x.id] ?? x);
	}
	const st = s.droppableId as Task['status'];
	const dn = d.droppableId as Task['status'];
	const sn = prev
		.filter((x) => x.status === st && x.id !== id)
		.sort((a, b) => a.order - b.order)
		.map((x, i) => ({ ...x, order: i }));
	const di = prev.filter((x) => x.status === dn && x.id !== id).sort((a, b) => a.order - b.order);
	di.splice(d.index, 0, { ...task, status: dn });
	const dn2 = di.map((x, i) => ({ ...x, order: i }));
	const mp = [...sn, ...dn2].reduce((o, x) => ({ ...o, [x.id]: x }), {} as Record<string, Task>);
	return prev.map((x) => mp[x.id] ?? x);
}

export default function Page() {
	const [tasks, setTasks] = useState<Task[]>(() => load());
	const [modal, setModal] = useState(false);
	const [editRow, setEditRow] = useState<Task | null>(null);
	const [filt, setFilt] = useState<string>();
	const [search, setSearch] = useState('');
	const [f] = Form.useForm();

	useEffect(() => localStorage.setItem(LS, JSON.stringify(tasks)), [tasks]);

	let rows = [...tasks];
	if (filt) rows = rows.filter((x) => x.status === filt);
	if (search.trim()) rows = rows.filter((x) => x.name.toLowerCase().includes(search.toLowerCase()));
	rows.sort((a, b) => moment(a.deadline).unix() - moment(b.deadline).unix());

	const pTag = (p: Task['priority']) =>
		p === 'high' ? <Tag color='red'>Cao</Tag> : p === 'medium' ? <Tag color='orange'>Trung bình</Tag> : <Tag>Thấp</Tag>;

	const edit = (r: Task) => {
		setEditRow(r);
		f.setFieldsValue({ ...r, deadline: moment(r.deadline) });
		setModal(true);
	};
	const add = () => {
		setEditRow(null);
		f.resetFields();
		f.setFieldsValue({ deadline: moment().add(7, 'd'), priority: 'medium', tags: [], status: 'todo' });
		setModal(true);
	};
	const save = async () => {
		const v = await f.validateFields();
		const id = `${Date.now()}`;
		const r: Task = {
			id: editRow?.id ?? id,
			name: v.name,
			description: v.description || '',
			deadline: v.deadline.toISOString(),
			priority: v.priority,
			tags: v.tags || [],
			status: editRow?.status ?? v.status ?? 'todo',
			order: editRow?.order ?? 0,
		};
		if (!editRow) {
			r.status = v.status || 'todo';
			r.order = tasks.filter((x) => x.status === r.status).length;
		}
		setTasks((t) => (editRow ? t.map((x) => (x.id === editRow.id ? { ...r, status: editRow.status } : x)) : [...t, r]));
		setModal(false);
	};

	const tbl: any[] = [
		{
			title: 'Tên',
			render: (_: unknown, r: Task) => (
				<Space wrap>
					<span className='cv-n'>{r.name}</span>
					{qh(r) && <Tag color='error'>Quá hạn</Tag>}
				</Space>
			),
		},
		{
			title: 'Deadline',
			sorter: (a: Task, b: Task) => moment(a.deadline).unix() - moment(b.deadline).unix(),
			render: (_: unknown, r: Task) => (
				<span className='cv-muted'>{moment(r.deadline).format('DD/MM/YYYY HH:mm')}</span>
			),
		},
		{ title: 'Ưu tiên', width: 110, render: (_: unknown, r: Task) => pTag(r.priority) },
		{
			title: 'TT',
			width: 124,
			render: (_: unknown, r: Task) => {
				const c = COLS.find((x) => x.id === r.status);
				return <Tag color={c?.tc}>{c?.name}</Tag>;
			},
		},
		{
			title: 'Tags',
			dataIndex: 'tags',
			render: (tags: string[]) =>
				tags?.length ? (
					<Space wrap>
						{tags.map((t) => (
							<Tag key={t} className='cv-tp'>
								{t}
							</Tag>
						))}
					</Space>
				) : (
					<span className='cv-muted'>—</span>
				),
		},
		{
			title: '',
			width: 72,
			render: (_: unknown, r: Task) => (
				<Button type='link' size='small' onClick={() => edit(r)}>
					Sửa
				</Button>
			),
		},
	];

	const tot = tasks.length;
	const done = tasks.filter((x) => x.status === 'done').length;
	const late = tasks.filter(qh).length;

	return (
		<div className='cv'>
			<style>{CSS}</style>
			<Card bordered={false} className='cv-h'>
				<Row justify='space-between' align='middle' gutter={[16, 16]}>
					<Col>
						<Typography.Title level={3} className='cv-title'>
							Theo dõi công việc cá nhân
						</Typography.Title>
						<Typography.Text type='secondary'>Kanban · Bảng · localStorage</Typography.Text>
					</Col>
					<Col>
						<Button type='primary' size='large' icon={<PlusOutlined />} onClick={add}>
							Thêm công việc
						</Button>
					</Col>
				</Row>
			</Card>

			<Tabs type='card' className='cv-tab' destroyInactiveTabPane>
				<Tabs.TabPane tab='Dashboard' key='1'>
					<Row gutter={[16, 16]}>
						{[
							{
								k: 'total',
								Ico: UnorderedListOutlined,
								ti: 'Tổng công việc',
								va: tot,
								cls: 'cv-s0',
								clr: undefined as string | undefined,
							},
							{ k: 'done', Ico: CheckCircleOutlined, ti: 'Đã hoàn thành', va: done, cls: 'cv-s1', clr: '#389e0d' },
							{ k: 'late', Ico: ClockCircleOutlined, ti: 'Quá hạn', va: late, cls: 'cv-s2', clr: '#cf1322' },
						].map(({ k, Ico, ti, va, cls, clr }) => (
							<Col xs={24} sm={8} key={k}>
								<Card hoverable className={`cv-s ${cls}`}>
									<Statistic title={ti} value={va} prefix={<Ico />} valueStyle={clr ? { color: clr } : undefined} />
								</Card>
							</Col>
						))}
					</Row>
				</Tabs.TabPane>

				<Tabs.TabPane tab='Kanban' key='2'>
					<DragDropContext onDragEnd={(x) => setTasks((t) => drag(t, x))}>
						<Row gutter={[16, 16]}>
							{COLS.map((col) => {
								const list = [...tasks.filter((x) => x.status === col.id)].sort((a, b) => a.order - b.order);
								return (
									<Col xs={24} md={8} key={col.id}>
										<Card
											className='cv-k'
											title={
												<Space>
													<span className='cv-ct'>{col.name}</span>
													<Tag className='cv-nt'>{list.length}</Tag>
												</Space>
											}
											headStyle={{ borderBottom: `3px solid ${col.a}` }}
										>
											<Droppable droppableId={col.id}>
												{(pv) => (
													<div
														ref={pv.innerRef}
														{...pv.droppableProps}
														className='cv-dz'
														style={{ borderTop: `1px solid ${col.a}22` }}
													>
														{!list.length && (
															<Empty
																image={Empty.PRESENTED_IMAGE_SIMPLE}
																description='Kéo thả việc vào đây'
																className='cv-e'
															/>
														)}
														{list.map((t, i) => (
															<Draggable key={t.id} draggableId={t.id} index={i}>
																{(p) => (
																	<div
																		ref={p.innerRef}
																		{...p.draggableProps}
																		{...p.dragHandleProps}
																		className='cv-w'
																		style={p.draggableProps.style}
																	>
																		<Card
																			hoverable
																			size='small'
																			className='cv-tc'
																			extra={
																				<Button
																					type='link'
																					size='small'
																					onClick={(e) => {
																						e.stopPropagation();
																						edit(t);
																					}}
																				>
																					Sửa
																				</Button>
																			}
																		>
																			<div className='cv-tt'>{t.name}</div>
																			<Space size={4} wrap style={{ marginTop: 6 }}>
																				{pTag(t.priority)}
																				{qh(t) && <Tag color='error'>Trễ</Tag>}
																			</Space>
																			<div className='cv-m'>
																				Hạn: <strong>{moment(t.deadline).format('DD/MM/YYYY')}</strong>
																			</div>
																		</Card>
																	</div>
																)}
															</Draggable>
														))}
														{pv.placeholder}
													</div>
												)}
											</Droppable>
										</Card>
									</Col>
								);
							})}
						</Row>
					</DragDropContext>
				</Tabs.TabPane>

				<Tabs.TabPane tab='Danh sách' key='3'>
					<Card bordered={false} className='cv-tcard'>
						<Space wrap style={{ marginBottom: 16 }}>
							<Input.Search
								allowClear
								placeholder='Tìm theo tên...'
								style={{ width: 280 }}
								onChange={(e) => setSearch(e.target.value)}
							/>
							<Select
								allowClear
								placeholder='Lọc trạng thái'
								style={{ width: 200 }}
								options={COLS.map((c) => ({ label: c.name, value: c.id }))}
								onChange={setFilt}
							/>
						</Space>
						<Table
							rowKey='id'
							columns={tbl}
							dataSource={rows}
							pagination={{ pageSize: 8, showSizeChanger: false }}
							className='cv-tbl'
						/>
					</Card>
				</Tabs.TabPane>
			</Tabs>

			<Modal
				visible={modal}
				title={editRow ? 'Sửa công việc' : 'Thêm công việc'}
				onCancel={() => setModal(false)}
				onOk={save}
				okText='Lưu'
				cancelText='Hủy'
				width={520}
				destroyOnClose
			>
				<Form form={f} layout='vertical' className='cv-form'>
					<Form.Item name='name' label='Tên' rules={[{ required: true }]}>
						<Input placeholder='Ví dụ: Học React' />
					</Form.Item>
					<Form.Item name='description' label='Mô tả'>
						<Input.TextArea rows={3} showCount maxLength={500} placeholder='Ghi chú ngắn...' />
					</Form.Item>
					<Form.Item name='deadline' label='Deadline' rules={[{ required: true }]}>
						<DatePicker showTime style={{ width: '100%' }} format='DD/MM/YYYY HH:mm' />
					</Form.Item>
					<Form.Item name='priority' label='Ưu tiên'>
						<Select
							options={[
								{ value: 'high', label: 'Cao' },
								{ value: 'medium', label: 'Trung bình' },
								{ value: 'low', label: 'Thấp' },
							]}
						/>
					</Form.Item>
					<Form.Item name='tags' label='Tags'>
						<Select mode='tags' placeholder='Enter thêm tag' />
					</Form.Item>
					{!editRow && (
						<Form.Item name='status' label='Cột ban đầu' rules={[{ required: true }]}>
							<Select options={COLS.map((c) => ({ label: c.name, value: c.id }))} />
						</Form.Item>
					)}
				</Form>
			</Modal>
		</div>
	);
}