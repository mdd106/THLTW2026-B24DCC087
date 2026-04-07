import { Alert, Button, Card, Col, Divider, Form, InputNumber, Progress, Row, Select, Space, Statistic, Table, Tag, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useMemo, useState } from 'react';

type DestinationType = 'Biển' | 'Núi' | 'Thành phố';

type Destination = {
	id: string;
	name: string;
	location: string;
	type: DestinationType;
	rating: number;
	image: string;
	priceLevel: number;
	visitHours: number;
	foodCost: number;
	stayCost: number;
	transportCost: number;
};

type PlanItem = {
	destinationId: string;
	day: number;
};

const destinations: Destination[] = [
	{
		id: 'dn',
		name: 'Đà Nẵng',
		location: 'Miền Trung',
		type: 'Biển',
		rating: 4.7,
		image: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=900&q=80',
		priceLevel: 3,
		visitHours: 6,
		foodCost: 450000,
		stayCost: 800000,
		transportCost: 350000,
	},
	{
		id: 'dl',
		name: 'Đà Lạt',
		location: 'Lâm Đồng',
		type: 'Núi',
		rating: 4.8,
		image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=900&q=80',
		priceLevel: 2,
		visitHours: 5,
		foodCost: 380000,
		stayCost: 700000,
		transportCost: 250000,
	},
	{
		id: 'hcm',
		name: 'TP. Hồ Chí Minh',
		location: 'Miền Nam',
		type: 'Thành phố',
		rating: 4.5,
		image: 'https://images.unsplash.com/photo-1583416750470-965b2707b355?auto=format&fit=crop&w=900&q=80',
		priceLevel: 4,
		visitHours: 8,
		foodCost: 500000,
		stayCost: 1000000,
		transportCost: 300000,
	},
	{
		id: 'pt',
		name: 'Phan Thiết',
		location: 'Bình Thuận',
		type: 'Biển',
		rating: 4.4,
		image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80',
		priceLevel: 2,
		visitHours: 4,
		foodCost: 320000,
		stayCost: 600000,
		transportCost: 280000,
	},
	{
		id: 'sp',
		name: 'Sa Pa',
		location: 'Lào Cai',
		type: 'Núi',
		rating: 4.9,
		image: 'https://images.unsplash.com/photo-1613004662072-bf62fd0ab42f?auto=format&fit=crop&w=900&q=80',
		priceLevel: 3,
		visitHours: 7,
		foodCost: 420000,
		stayCost: 900000,
		transportCost: 450000,
	},
];

const formatter = new Intl.NumberFormat('vi-VN');

const TourPlanningPage: React.FC = () => {
	const [typeFilter, setTypeFilter] = useState<'Tất cả' | DestinationType>('Tất cả');
	const [sortBy, setSortBy] = useState<'rating' | 'price'>('rating');
	const [plan, setPlan] = useState<PlanItem[]>([]);
	const [form] = Form.useForm<{ destinationId: string; day: number }>();
	const [budgetLimit, setBudgetLimit] = useState(5000000);

	const filteredDestinations = useMemo(() => {
		const byType = typeFilter === 'Tất cả' ? destinations : destinations.filter((d) => d.type === typeFilter);
		const sorted = [...byType].sort((a, b) => {
			if (sortBy === 'rating') return b.rating - a.rating;
			return a.priceLevel - b.priceLevel;
		});
		return sorted;
	}, [typeFilter, sortBy]);

	const plannedDestinations = useMemo(() => {
		return plan
			.map((p) => {
				const destination = destinations.find((d) => d.id === p.destinationId);
				return destination ? { ...p, destination } : null;
			})
			.filter(Boolean) as Array<PlanItem & { destination: Destination }>;
	}, [plan]);

	const budgetStats = useMemo(() => {
		const totals = plannedDestinations.reduce(
			(acc, item) => {
				acc.food += item.destination.foodCost;
				acc.transport += item.destination.transportCost;
				acc.stay += item.destination.stayCost;
				acc.totalHours += item.destination.visitHours;
				return acc;
			},
			{ food: 0, transport: 0, stay: 0, totalHours: 0 },
		);
		const total = totals.food + totals.transport + totals.stay;
		return { ...totals, total };
	}, [plannedDestinations]);

	const addPlanItem = async () => {
		const values = await form.validateFields();
		setPlan((prev) => [...prev, values]);
		form.resetFields();
	};

	const topDestinations = useMemo(() => [...destinations].sort((a, b) => b.rating - a.rating).slice(0, 3), []);

	const popularLocation = useMemo(() => {
		const map = new Map<string, number>();
		plan.forEach((p) => {
			const destination = destinations.find((d) => d.id === p.destinationId);
			if (!destination) return;
			const count = map.get(destination.location) || 0;
			map.set(destination.location, count + 1);
		});
		let result = 'Chưa có dữ liệu';
		let max = 0;
		map.forEach((count, location) => {
			if (count > max) {
				max = count;
				result = location;
			}
		});
		return result;
	}, [plan]);

	const monthlyRevenue = budgetStats.total * 1.25;

	const planColumns: ColumnsType<PlanItem & { destination: Destination }> = [
		{
			title: 'Ngày',
			dataIndex: 'day',
			width: 70,
			sorter: (a, b) => a.day - b.day,
		},
		{
			title: 'Điểm đến',
			render: (_, r) => (
				<Space>
					<img
						src={r.destination.image}
						alt={r.destination.name}
						style={{ width: 52, height: 38, objectFit: 'cover', borderRadius: 8 }}
					/>
					<div>
						<div>{r.destination.name}</div>
						<Typography.Text type="secondary">{r.destination.location}</Typography.Text>
					</div>
				</Space>
			),
		},
		{
			title: 'Thời gian',
			width: 120,
			render: (_, r) => `${r.destination.visitHours} giờ`,
		},
		{
			title: 'Ngân sách',
			width: 150,
			render: (_, r) => `${formatter.format(r.destination.foodCost + r.destination.stayCost + r.destination.transportCost)} đ`,
		},
	];

	return (
		<Space direction="vertical" size={16} style={{ width: '100%' }}>
			<Typography.Title level={3} style={{ marginBottom: 0 }}>
				Kế hoạch du lịch
			</Typography.Title>
			<Typography.Text type="secondary">Khám phá điểm đến, xây lịch trình theo ngày, theo dõi ngân sách và thống kê.</Typography.Text>

			<Row gutter={[16, 16]}>
				<Col xs={24} lg={16}>
					<Card title="1) Trang chủ - Khám phá điểm đến">
						<Space wrap style={{ marginBottom: 16 }}>
							<Select value={typeFilter} style={{ width: 170 }} onChange={setTypeFilter}>
								<Select.Option value="Tất cả">Tất cả loại hình</Select.Option>
								<Select.Option value="Biển">Biển</Select.Option>
								<Select.Option value="Núi">Núi</Select.Option>
								<Select.Option value="Thành phố">Thành phố</Select.Option>
							</Select>
							<Select value={sortBy} style={{ width: 170 }} onChange={setSortBy}>
								<Select.Option value="rating">Sắp xếp: Đánh giá</Select.Option>
								<Select.Option value="price">Sắp xếp: Giá</Select.Option>
							</Select>
						</Space>

						<Row gutter={[12, 12]}>
							{filteredDestinations.map((d) => (
								<Col xs={24} sm={12} md={12} xl={8} key={d.id}>
									<Card
										hoverable
										cover={<img alt={d.name} src={d.image} style={{ height: 150, objectFit: 'cover' }} />}
										bodyStyle={{ padding: 12 }}
									>
										<Space direction="vertical" size={4} style={{ width: '100%' }}>
											<Typography.Text strong>{d.name}</Typography.Text>
											<Typography.Text type="secondary">{d.location}</Typography.Text>
											<Space size={6}>
												<Tag color="blue">{d.type}</Tag>
												<Tag color="gold">Rating: {d.rating}</Tag>
												<Tag>Giá: {d.priceLevel}/5</Tag>
											</Space>
										</Space>
									</Card>
								</Col>
							))}
						</Row>
					</Card>
				</Col>

				<Col xs={24} lg={8}>
					<Card title="4) Trang quản trị (Admin)">
						<Space direction="vertical" size={12} style={{ width: '100%' }}>
							<Statistic title="Lịch trình đã tạo (tháng này)" value={plan.length} />
							<Statistic title="Địa điểm phổ biến" value={popularLocation} />
							<Statistic title="Doanh thu ước tính" value={`${formatter.format(Math.round(monthlyRevenue))} đ`} />
							<Divider style={{ margin: '4px 0' }} />
							<Typography.Text strong>Top điểm đến theo rating</Typography.Text>
							{topDestinations.map((d) => (
								<Space key={d.id} style={{ width: '100%', justifyContent: 'space-between' }}>
									<Typography.Text>{d.name}</Typography.Text>
									<Tag color="gold">{d.rating}</Tag>
								</Space>
							))}
						</Space>
					</Card>
				</Col>
			</Row>

			<Row gutter={[16, 16]}>
				<Col xs={24} lg={14}>
					<Card title="2) Tạo lịch trình du lịch">
						<Form layout="inline" form={form} style={{ rowGap: 12 }}>
							<Form.Item name="destinationId" rules={[{ required: true, message: 'Chọn điểm đến' }]}>
								<Select placeholder="Chọn điểm đến" style={{ minWidth: 220 }}>
									{destinations.map((d) => (
										<Select.Option key={d.id} value={d.id}>
											{d.name}
										</Select.Option>
									))}
								</Select>
							</Form.Item>
							<Form.Item name="day" rules={[{ required: true, message: 'Nhập ngày' }]}>
								<InputNumber min={1} max={30} placeholder="Ngày" />
							</Form.Item>
							<Button type="primary" icon={<PlusOutlined />} onClick={addPlanItem}>
								Thêm
							</Button>
						</Form>

						<div style={{ marginTop: 16 }}>
							<Table
								size="small"
								rowKey={(r, idx) => `${r.destinationId}-${r.day}-${idx}`}
								columns={planColumns}
								dataSource={plannedDestinations}
								pagination={{ pageSize: 5 }}
								scroll={{ x: 680 }}
							/>
						</div>
					</Card>
				</Col>

				<Col xs={24} lg={10}>
					<Card title="3) Quản lý ngân sách">
						<Space direction="vertical" size={12} style={{ width: '100%' }}>
							<Space direction="vertical" size={4} style={{ width: '100%' }}>
								<Typography.Text>Ngân sách tối đa (đ)</Typography.Text>
								<InputNumber
									style={{ width: '100%' }}
									min={0}
									step={500000}
									value={budgetLimit}
									onChange={(v) => setBudgetLimit(v || 0)}
								/>
							</Space>

							<Statistic title="Tổng ngân sách ước tính" value={`${formatter.format(budgetStats.total)} đ`} />
							<Statistic title="Tổng thời gian di chuyển/tham quan" value={`${budgetStats.totalHours} giờ`} />

							<div>
								<Typography.Text>Ăn uống</Typography.Text>
								<Progress percent={budgetStats.total ? Math.round((budgetStats.food / budgetStats.total) * 100) : 0} />
								<Typography.Text>Di chuyển</Typography.Text>
								<Progress percent={budgetStats.total ? Math.round((budgetStats.transport / budgetStats.total) * 100) : 0} />
								<Typography.Text>Lưu trú</Typography.Text>
								<Progress percent={budgetStats.total ? Math.round((budgetStats.stay / budgetStats.total) * 100) : 0} />
							</div>

							{budgetStats.total > budgetLimit ? (
								<Alert
									type="error"
									showIcon
									message="Vượt ngân sách!"
									description={`Bạn đang vượt ${formatter.format(budgetStats.total - budgetLimit)} đ so với mức cho phép.`}
								/>
							) : (
								<Alert
									type="success"
									showIcon
									message="Ngân sách ổn"
									description={`Còn lại ${formatter.format(budgetLimit - budgetStats.total)} đ.`}
								/>
							)}
						</Space>
					</Card>
				</Col>
			</Row>
		</Space>
	);
};

export default TourPlanningPage;
