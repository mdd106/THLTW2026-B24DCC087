import ColumnChart from '@/components/Chart/ColumnChart';
import LineChart from '@/components/Chart/LineChart';
import {
  CalendarOutlined,
  DashboardOutlined,
  EditOutlined,
  FireOutlined,
  PlusOutlined,
  TrophyOutlined,
} from '@ant-design/icons';
import {
  Button,
  Card,
  Col,
  DatePicker,
  Descriptions,
  Divider,
  Drawer,
  Empty,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Progress,
  Row,
  Segmented,
  Select,
  Space,
  Statistic,
  Table,
  Tag,
  Timeline,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import moment, { type Moment } from 'moment';
import React, { useMemo, useState } from 'react';

const { RangePicker } = DatePicker;
const { Search, TextArea } = Input;
const { Text, Title } = Typography;

type WorkoutStatus = 'completed' | 'planned' | 'skipped';
type WorkoutCategory = 'Cardio' | 'Strength' | 'Yoga' | 'HIIT' | 'Other';
type GoalType = 'Giảm cân' | 'Tăng cơ' | 'Cải thiện sức bền' | 'Khác';
type GoalStatus = 'Đang thực hiện' | 'Đã đạt' | 'Đã hủy';
type ExerciseGroup = 'Chest' | 'Back' | 'Legs' | 'Shoulders' | 'Arms' | 'Core' | 'Full Body';
type ExerciseLevel = 'Dễ' | 'Trung bình' | 'Khó';

type WorkoutItem = {
  id: string;
  date: string;
  category: WorkoutCategory;
  exercise: string;
  duration: number;
  calories: number;
  notes: string;
  status: WorkoutStatus;
};

type HealthLog = {
  id: string;
  date: string;
  weight: number;
  height: number;
  restingHeartRate: number;
  sleepHours: number;
};

type GoalItem = {
  id: string;
  name: string;
  type: GoalType;
  targetValue: number;
  currentValue: number;
  deadline: string;
  status: GoalStatus;
};

type ExerciseItem = {
  id: string;
  name: string;
  group: ExerciseGroup;
  level: ExerciseLevel;
  caloriesPerHour: number;
  description: string;
};

const workoutStatusMeta: Record<WorkoutStatus, { label: string; color: string }> = {
  completed: { label: 'Hoàn thành', color: 'green' },
  planned: { label: 'Bỏ lỡ', color: 'orange' },
  skipped: { label: 'Bỏ lỡ', color: 'red' },
};

const bmiMeta = (bmi: number) => {
  if (bmi < 18.5) return { label: 'Thiếu cân', color: 'blue' };
  if (bmi < 25) return { label: 'Bình thường', color: 'green' };
  if (bmi < 30) return { label: 'Thừa cân', color: 'gold' };
  return { label: 'Béo phì', color: 'red' };
};

const goalStatusColors: Record<GoalStatus, string> = {
  'Đang thực hiện': 'processing',
  'Đã đạt': 'success',
  'Đã hủy': 'default',
};

const exerciseGroups: ExerciseGroup[] = ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core', 'Full Body'];
const workoutCategories: WorkoutCategory[] = ['Cardio', 'Strength', 'Yoga', 'HIIT', 'Other'];

const initialWorkouts: WorkoutItem[] = [
  {
    id: 'w1',
    date: moment().subtract(8, 'days').toISOString(),
    category: 'Strength',
    exercise: 'Push Day',
    duration: 75,
    calories: 460,
    notes: 'Tập ngực, vai, tay sau.',
    status: 'completed',
  },
  {
    id: 'w2',
    date: moment().subtract(6, 'days').toISOString(),
    category: 'Cardio',
    exercise: 'Chạy bộ 5km',
    duration: 40,
    calories: 330,
    notes: 'Giữ pace ổn định.',
    status: 'completed',
  },
  {
    id: 'w3',
    date: moment().subtract(4, 'days').toISOString(),
    category: 'HIIT',
    exercise: 'Burpee Circuit',
    duration: 30,
    calories: 290,
    notes: '4 rounds, nghỉ ngắn.',
    status: 'completed',
  },
  {
    id: 'w4',
    date: moment().subtract(2, 'days').toISOString(),
    category: 'Yoga',
    exercise: 'Morning Flow',
    duration: 35,
    calories: 120,
    notes: 'Giãn cơ và hít thở.',
    status: 'completed',
  },
  {
    id: 'w5',
    date: moment().add(1, 'days').toISOString(),
    category: 'Strength',
    exercise: 'Leg Day',
    duration: 70,
    calories: 480,
    notes: 'Squat, lunge, deadlift.',
    status: 'planned',
  },
];

const initialHealthLogs: HealthLog[] = [
  { id: 'h1', date: moment().subtract(28, 'days').toISOString(), weight: 78.8, height: 175, restingHeartRate: 74, sleepHours: 6.7 },
  { id: 'h2', date: moment().subtract(21, 'days').toISOString(), weight: 78.1, height: 175, restingHeartRate: 73, sleepHours: 6.9 },
  { id: 'h3', date: moment().subtract(14, 'days').toISOString(), weight: 77.5, height: 175, restingHeartRate: 71, sleepHours: 7.2 },
  { id: 'h4', date: moment().subtract(7, 'days').toISOString(), weight: 76.9, height: 175, restingHeartRate: 70, sleepHours: 7.4 },
  { id: 'h5', date: moment().toISOString(), weight: 76.4, height: 175, restingHeartRate: 69, sleepHours: 7.5 },
];

const initialGoals: GoalItem[] = [
  { id: 'g1', name: 'Giảm 4kg trong 2 tháng', type: 'Giảm cân', targetValue: 4, currentValue: 2.4, deadline: moment().add(45, 'days').toISOString(), status: 'Đang thực hiện' },
  { id: 'g2', name: 'Tập đủ 20 buổi trong tháng', type: 'Cải thiện sức bền', targetValue: 20, currentValue: 14, deadline: moment().endOf('month').toISOString(), status: 'Đang thực hiện' },
  { id: 'g3', name: 'Ngủ trung bình 7.5h', type: 'Khác', targetValue: 7.5, currentValue: 7.2, deadline: moment().add(20, 'days').toISOString(), status: 'Đang thực hiện' },
];

const initialExercises: ExerciseItem[] = [
  { id: 'e1', name: 'Bench Press', group: 'Chest', level: 'Khó', caloriesPerHour: 420, description: 'Bài compound cho ngực, vai trước và tay sau.' },
  { id: 'e2', name: 'Pull Up', group: 'Back', level: 'Khó', caloriesPerHour: 390, description: 'Tăng sức mạnh lưng xô và tay trước.' },
  { id: 'e3', name: 'Squat', group: 'Legs', level: 'Trung bình', caloriesPerHour: 500, description: 'Bài nền tảng cho đùi trước, mông và core.' },
  { id: 'e4', name: 'Shoulder Press', group: 'Shoulders', level: 'Trung bình', caloriesPerHour: 340, description: 'Phát triển vai trước và vai giữa.' },
  { id: 'e5', name: 'Bicep Curl', group: 'Arms', level: 'Dễ', caloriesPerHour: 220, description: 'Bài cô lập cho tay trước, phù hợp người mới.' },
  { id: 'e6', name: 'Mountain Climber', group: 'Core', level: 'Trung bình', caloriesPerHour: 510, description: 'Bài đốt mỡ nhanh, tác động core và tim mạch.' },
  { id: 'e7', name: 'Burpee', group: 'Full Body', level: 'Khó', caloriesPerHour: 650, description: 'Bài toàn thân cường độ cao, cải thiện sức bền.' },
];

const calculateBmi = (weight: number, height: number) => weight / Math.pow(height / 100, 2);
const percent = (current: number, target: number) => Math.max(0, Math.min(100, Math.round((current / target) * 100)));
const createId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const ManagePage: React.FC = () => {
  const [workoutForm] = Form.useForm();
  const [healthForm] = Form.useForm();
  const [goalForm] = Form.useForm();

  const [workouts, setWorkouts] = useState<WorkoutItem[]>(initialWorkouts);
  const [healthLogs, setHealthLogs] = useState<HealthLog[]>(initialHealthLogs);
  const [goals, setGoals] = useState<GoalItem[]>(initialGoals);
  const [exerciseLibrary] = useState<ExerciseItem[]>(initialExercises);

  const [workoutModalVisible, setWorkoutModalVisible] = useState(false);
  const [healthModalVisible, setHealthModalVisible] = useState(false);
  const [goalDrawerVisible, setGoalDrawerVisible] = useState(false);
  const [exerciseModalVisible, setExerciseModalVisible] = useState(false);

  const [editingWorkout, setEditingWorkout] = useState<WorkoutItem | null>(null);
  const [editingHealth, setEditingHealth] = useState<HealthLog | null>(null);
  const [editingGoal, setEditingGoal] = useState<GoalItem | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<ExerciseItem | null>(null);

  const [workoutSearch, setWorkoutSearch] = useState('');
  const [workoutCategoryFilter, setWorkoutCategoryFilter] = useState<WorkoutCategory | 'all'>('all');
  const [workoutDateRange, setWorkoutDateRange] = useState<[Moment | null, Moment | null] | null>(null);

  const [goalStatusFilter, setGoalStatusFilter] = useState<'Tất cả' | GoalStatus>('Tất cả');
  const [exerciseGroupFilter, setExerciseGroupFilter] = useState<ExerciseGroup | 'all'>('all');
  const [exerciseSearch, setExerciseSearch] = useState('');

  const sortedWorkouts = useMemo(
    () => [...workouts].sort((a, b) => moment(b.date).valueOf() - moment(a.date).valueOf()),
    [workouts],
  );
  const sortedHealthLogs = useMemo(
    () => [...healthLogs].sort((a, b) => moment(b.date).valueOf() - moment(a.date).valueOf()),
    [healthLogs],
  );

  const filteredWorkouts = useMemo(() => {
    return sortedWorkouts.filter((item) => {
      const keyword = `${item.exercise} ${item.category}`.toLowerCase();
      const matchedKeyword = keyword.includes(workoutSearch.trim().toLowerCase());
      const matchedCategory = workoutCategoryFilter === 'all' || item.category === workoutCategoryFilter;
      const matchedDate =
        !workoutDateRange ||
        !workoutDateRange[0] ||
        !workoutDateRange[1] ||
        moment(item.date).isBetween(workoutDateRange[0], workoutDateRange[1], 'day', '[]');

      return matchedKeyword && matchedCategory && matchedDate;
    });
  }, [sortedWorkouts, workoutSearch, workoutCategoryFilter, workoutDateRange]);

  const filteredGoals = useMemo(() => {
    return goals.filter((item) => goalStatusFilter === 'Tất cả' || item.status === goalStatusFilter);
  }, [goals, goalStatusFilter]);

  const filteredExercises = useMemo(() => {
    return exerciseLibrary.filter((item) => {
      const matchedGroup = exerciseGroupFilter === 'all' || item.group === exerciseGroupFilter;
      const matchedKeyword = item.name.toLowerCase().includes(exerciseSearch.trim().toLowerCase());
      return matchedGroup && matchedKeyword;
    });
  }, [exerciseLibrary, exerciseGroupFilter, exerciseSearch]);

  const currentMonthWorkouts = useMemo(
    () => workouts.filter((item) => moment(item.date).isSame(moment(), 'month') && item.status === 'completed'),
    [workouts],
  );

  const completedCalories = useMemo(
    () => workouts.filter((item) => item.status === 'completed').reduce((sum, item) => sum + item.calories, 0),
    [workouts],
  );

  const streakDays = useMemo(() => {
    const completedDays = Array.from(
      new Set(
        workouts
          .filter((item) => item.status === 'completed')
          .map((item) => moment(item.date).startOf('day').format('YYYY-MM-DD')),
      ),
    ).sort((a, b) => moment(b).valueOf() - moment(a).valueOf());

    let streak = 0;
    let pointer = moment().startOf('day');
    while (completedDays.includes(pointer.format('YYYY-MM-DD'))) {
      streak += 1;
      pointer = pointer.subtract(1, 'day');
    }
    return streak;
  }, [workouts]);

  const completionPercent = useMemo(() => {
    if (!goals.length) return 0;
    return Math.round(goals.reduce((sum, item) => sum + percent(item.currentValue, item.targetValue), 0) / goals.length);
  }, [goals]);

  const chartMonths = useMemo(
    () => Array.from({ length: 6 }, (_, index) => moment().subtract(5 - index, 'months')),
    [],
  );
  const monthlyWorkoutData = useMemo(
    () =>
      chartMonths.map((monthValue) =>
        workouts.filter((item) => moment(item.date).isSame(monthValue, 'month') && item.status === 'completed').length,
      ),
    [chartMonths, workouts],
  );

  const healthTrend = useMemo(() => {
    const ascLogs = [...healthLogs].sort((a, b) => moment(a.date).valueOf() - moment(b.date).valueOf());
    return {
      xAxis: ascLogs.map((item) => moment(item.date).format('DD/MM')),
      weightSeries: ascLogs.map((item) => item.weight),
    };
  }, [healthLogs]);

  const latestHealth = sortedHealthLogs[0];

  const workoutColumns: ColumnsType<WorkoutItem> = [
    {
      title: 'Ngày',
      dataIndex: 'date',
      render: (value: string) => moment(value).format('DD/MM/YYYY'),
    },
    {
      title: 'Loại bài tập',
      dataIndex: 'category',
    },
    {
      title: 'Bài tập',
      dataIndex: 'exercise',
    },
    {
      title: 'Thời lượng (phút)',
      dataIndex: 'duration',
    },
    {
      title: 'Calo đốt',
      dataIndex: 'calories',
    },
    {
      title: 'Ghi chú',
      dataIndex: 'notes',
      ellipsis: true,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      render: (value: WorkoutStatus) => <Tag color={workoutStatusMeta[value].color}>{workoutStatusMeta[value].label}</Tag>,
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 140,
      render: (_, record) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => {
              setEditingWorkout(record);
              workoutForm.setFieldsValue({
                ...record,
                date: moment(record.date),
              });
              setWorkoutModalVisible(true);
            }}
          />
          <Popconfirm
            title='Xóa buổi tập này?'
            onConfirm={() => setWorkouts((prev) => prev.filter((item) => item.id !== record.id))}
          >
            <Button danger>Xóa</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const healthColumns: ColumnsType<HealthLog> = [
    {
      title: 'Ngày',
      dataIndex: 'date',
      render: (value: string) => moment(value).format('DD/MM/YYYY'),
    },
    {
      title: 'Cân nặng (kg)',
      dataIndex: 'weight',
    },
    {
      title: 'Chiều cao (cm)',
      dataIndex: 'height',
    },
    {
      title: 'BMI',
      key: 'bmi',
      render: (_, record) => calculateBmi(record.weight, record.height).toFixed(1),
    },
    {
      title: 'Nhịp tim lúc nghỉ (bpm)',
      dataIndex: 'restingHeartRate',
    },
    {
      title: 'Giờ ngủ',
      dataIndex: 'sleepHours',
    },
    {
      title: 'Phân loại',
      key: 'classification',
      render: (_, record) => {
        const bmi = calculateBmi(record.weight, record.height);
        const meta = bmiMeta(bmi);
        return <Tag color={meta.color}>{meta.label}</Tag>;
      },
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 140,
      render: (_, record) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => {
              setEditingHealth(record);
              healthForm.setFieldsValue({
                ...record,
                date: moment(record.date),
              });
              setHealthModalVisible(true);
            }}
          />
          <Popconfirm
            title='Xóa chỉ số này?'
            onConfirm={() => setHealthLogs((prev) => prev.filter((item) => item.id !== record.id))}
          >
            <Button danger>Xóa</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const openWorkoutCreate = () => {
    setEditingWorkout(null);
    workoutForm.resetFields();
    workoutForm.setFieldsValue({ date: moment(), status: 'planned', category: 'Cardio' });
    setWorkoutModalVisible(true);
  };

  const openHealthCreate = () => {
    setEditingHealth(null);
    healthForm.resetFields();
    healthForm.setFieldsValue({ date: moment(), height: latestHealth?.height ?? 175 });
    setHealthModalVisible(true);
  };

  const openGoalCreate = () => {
    setEditingGoal(null);
    goalForm.resetFields();
    goalForm.setFieldsValue({ status: 'Đang thực hiện', type: 'Giảm cân', deadline: moment().add(30, 'days') });
    setGoalDrawerVisible(true);
  };

  const submitWorkout = async () => {
    const values = await workoutForm.validateFields();
    const payload: WorkoutItem = {
      id: editingWorkout?.id ?? createId(),
      date: values.date.toISOString(),
      category: values.category,
      exercise: values.exercise,
      duration: values.duration,
      calories: values.calories,
      notes: values.notes ?? '',
      status: values.status,
    };

    setWorkouts((prev) =>
      editingWorkout ? prev.map((item) => (item.id === editingWorkout.id ? payload : item)) : [payload, ...prev],
    );
    setWorkoutModalVisible(false);
    setEditingWorkout(null);
    workoutForm.resetFields();
  };

  const submitHealth = async () => {
    const values = await healthForm.validateFields();
    const payload: HealthLog = {
      id: editingHealth?.id ?? createId(),
      date: values.date.toISOString(),
      weight: values.weight,
      height: values.height,
      restingHeartRate: values.restingHeartRate,
      sleepHours: values.sleepHours,
    };

    setHealthLogs((prev) =>
      editingHealth ? prev.map((item) => (item.id === editingHealth.id ? payload : item)) : [payload, ...prev],
    );
    setHealthModalVisible(false);
    setEditingHealth(null);
    healthForm.resetFields();
  };

  const submitGoal = async () => {
    const values = await goalForm.validateFields();
    const payload: GoalItem = {
      id: editingGoal?.id ?? createId(),
      name: values.name,
      type: values.type,
      targetValue: values.targetValue,
      currentValue: values.currentValue,
      deadline: values.deadline.toISOString(),
      status: values.status,
    };

    setGoals((prev) => (editingGoal ? prev.map((item) => (item.id === editingGoal.id ? payload : item)) : [payload, ...prev]));
    setGoalDrawerVisible(false);
    setEditingGoal(null);
    goalForm.resetFields();
  };

  return (
    <div style={{ padding: 8 }}>
      <Space direction='vertical' size={24} style={{ width: '100%' }}>
        <Card>
          <Space direction='vertical' size={4}>
            <Title level={3} style={{ margin: 0 }}>
              Quản lý luyện tập & sức khỏe
            </Title>
            <Text type='secondary'>
              Theo dõi tiến độ tập luyện, chỉ số cơ thể, mục tiêu cá nhân và thư viện bài tập trên cùng một màn hình.
            </Text>
          </Space>
        </Card>

        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} xl={6}>
            <Card>
              <Statistic
                title='Tổng buổi tập tháng này'
                value={currentMonthWorkouts.length}
                prefix={<DashboardOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} xl={6}>
            <Card>
              <Statistic title='Tổng calo đã đốt' value={completedCalories} suffix='kcal' prefix={<FireOutlined />} />
            </Card>
          </Col>
          <Col xs={24} sm={12} xl={6}>
            <Card>
              <Statistic title='Số ngày streak' value={streakDays} suffix='ngày' prefix={<CalendarOutlined />} />
            </Card>
          </Col>
          <Col xs={24} sm={12} xl={6}>
            <Card>
              <Statistic title='Mức hoàn thành mục tiêu' value={completionPercent} suffix='%' prefix={<TrophyOutlined />} />
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col xs={24} xl={14}>
            <Card>
              <ColumnChart
                title='Số buổi tập theo tháng'
                xAxis={chartMonths.map((item) => item.format('MM/YYYY'))}
                yAxis={[monthlyWorkoutData]}
                yLabel={['Buổi tập']}
                formatY={(value: number) => `${value} buổi`}
                colors={['#1677ff']}
              />
            </Card>
          </Col>
          <Col xs={24} xl={10}>
            <Card>
              <LineChart
                title='Biểu đồ cân nặng'
                xAxis={healthTrend.xAxis}
                yAxis={[healthTrend.weightSeries]}
                yLabel={['Cân nặng']}
                formatY={(value: number) => `${value.toFixed(1)} kg`}
                colors={['#52c41a']}
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col xs={24} xl={14}>
            <Card
              title='Nhật ký tập luyện'
              extra={
                <Button type='primary' icon={<PlusOutlined />} onClick={openWorkoutCreate}>
                  Thêm buổi tập
                </Button>
              }
            >
              <Space direction='vertical' size={16} style={{ width: '100%' }}>
                <Row gutter={[12, 12]}>
                  <Col xs={24} md={10}>
                    <Search placeholder='Tìm theo tên bài tập' onSearch={setWorkoutSearch} allowClear onChange={(e) => setWorkoutSearch(e.target.value)} />
                  </Col>
                  <Col xs={24} md={7}>
                    <Select
                      style={{ width: '100%' }}
                      value={workoutCategoryFilter}
                      onChange={setWorkoutCategoryFilter}
                      options={[
                        { label: 'Tất cả loại bài tập', value: 'all' },
                        ...workoutCategories.map((item) => ({ label: item, value: item })),
                      ]}
                    />
                  </Col>
                  <Col xs={24} md={7}>
                    <RangePicker style={{ width: '100%' }} onChange={(dates) => setWorkoutDateRange((dates as [Moment | null, Moment | null]) ?? null)} />
                  </Col>
                </Row>

                <Table rowKey='id' columns={workoutColumns} dataSource={filteredWorkouts} pagination={{ pageSize: 5 }} />
              </Space>
            </Card>
          </Col>

          <Col xs={24} xl={10}>
            <Card title='5 buổi tập gần nhất'>
              <Timeline>
                {sortedWorkouts.slice(0, 5).map((item) => (
                  <Timeline.Item key={item.id} color={workoutStatusMeta[item.status].color}>
                    <Space direction='vertical' size={0}>
                      <Text strong>{item.exercise}</Text>
                      <Text type='secondary'>
                        {moment(item.date).format('DD/MM/YYYY')} | {item.category} | {item.duration} phút
                      </Text>
                    </Space>
                  </Timeline.Item>
                ))}
              </Timeline>
            </Card>

            <Card title='Chỉ số sức khỏe gần nhất' style={{ marginTop: 16 }}>
              {latestHealth ? (
                <Descriptions column={1} size='small'>
                  <Descriptions.Item label='Cân nặng'>{latestHealth.weight} kg</Descriptions.Item>
                  <Descriptions.Item label='Chiều cao'>{latestHealth.height} cm</Descriptions.Item>
                  <Descriptions.Item label='BMI'>
                    {calculateBmi(latestHealth.weight, latestHealth.height).toFixed(1)}{' '}
                    <Tag color={bmiMeta(calculateBmi(latestHealth.weight, latestHealth.height)).color}>
                      {bmiMeta(calculateBmi(latestHealth.weight, latestHealth.height)).label}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label='Nhịp tim nghỉ'>{latestHealth.restingHeartRate} bpm</Descriptions.Item>
                  <Descriptions.Item label='Giờ ngủ'>{latestHealth.sleepHours} giờ</Descriptions.Item>
                </Descriptions>
              ) : (
                <Empty description='Chưa có dữ liệu sức khỏe' />
              )}
            </Card>
          </Col>
        </Row>

        <Card
          title='Nhật ký chỉ số sức khỏe'
          extra={
            <Button type='primary' icon={<PlusOutlined />} onClick={openHealthCreate}>
              Thêm chỉ số
            </Button>
          }
        >
          <Space direction='vertical' size={16} style={{ width: '100%' }}>
            <Text type='secondary'>BMI = Cân nặng (kg) / (Chiều cao (m))²</Text>
            <Table rowKey='id' columns={healthColumns} dataSource={sortedHealthLogs} pagination={{ pageSize: 5 }} />
          </Space>
        </Card>

        <Card
          title='Quản lý mục tiêu'
          extra={
            <Space>
              <Segmented
                value={goalStatusFilter}
                onChange={(value) => setGoalStatusFilter(value as 'Tất cả' | GoalStatus)}
                options={['Tất cả', 'Đang thực hiện', 'Đã đạt', 'Đã hủy']}
              />
              <Button type='primary' icon={<PlusOutlined />} onClick={openGoalCreate}>
                Thêm mục tiêu
              </Button>
            </Space>
          }
        >
          <Row gutter={[16, 16]}>
            {filteredGoals.map((goal) => (
              <Col xs={24} md={12} xl={8} key={goal.id}>
                <Card
                  hoverable
                  actions={[
                    <Button
                      key='edit'
                      type='link'
                      onClick={() => {
                        setEditingGoal(goal);
                        goalForm.setFieldsValue({
                          ...goal,
                          deadline: moment(goal.deadline),
                        });
                        setGoalDrawerVisible(true);
                      }}
                    >
                      Cập nhật
                    </Button>,
                    <Popconfirm
                      key='delete'
                      title='Xóa mục tiêu này?'
                      onConfirm={() => setGoals((prev) => prev.filter((item) => item.id !== goal.id))}
                    >
                      <Button type='link' danger>
                        Xóa
                      </Button>
                    </Popconfirm>,
                  ]}
                >
                  <Space direction='vertical' size={12} style={{ width: '100%' }}>
                    <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                      <Text strong>{goal.name}</Text>
                      <Tag color={goalStatusColors[goal.status]}>{goal.status}</Tag>
                    </Space>

                    <Text type='secondary'>
                      {goal.type} | Deadline: {moment(goal.deadline).format('DD/MM/YYYY')}
                    </Text>

                    <Progress percent={percent(goal.currentValue, goal.targetValue)} />

                    <Space align='center'>
                      <Text>Giá trị hiện tại:</Text>
                      <InputNumber
                        min={0}
                        value={goal.currentValue}
                        onChange={(value) => {
                          const nextValue = Number(value ?? 0);
                          setGoals((prev) =>
                            prev.map((item) =>
                              item.id === goal.id
                                ? {
                                    ...item,
                                    currentValue: nextValue,
                                    status: nextValue >= item.targetValue ? 'Đã đạt' : item.status === 'Đã đạt' ? 'Đang thực hiện' : item.status,
                                  }
                                : item,
                            ),
                          );
                        }}
                      />
                      <Text>/ {goal.targetValue}</Text>
                    </Space>
                  </Space>
                </Card>
              </Col>
            ))}
          </Row>
        </Card>

        <Card title='Thư viện bài tập'>
          <Space direction='vertical' size={16} style={{ width: '100%' }}>
            <Row gutter={[12, 12]}>
              <Col xs={24} md={8}>
                <Select
                  style={{ width: '100%' }}
                  value={exerciseGroupFilter}
                  onChange={setExerciseGroupFilter}
                  options={[
                    { label: 'Tất cả nhóm cơ', value: 'all' },
                    ...exerciseGroups.map((item) => ({ label: item, value: item })),
                  ]}
                />
              </Col>
              <Col xs={24} md={8}>
                <Search placeholder='Tìm theo tên bài tập' allowClear onChange={(e) => setExerciseSearch(e.target.value)} />
              </Col>
            </Row>

            <Row gutter={[16, 16]}>
              {filteredExercises.map((exercise) => (
                <Col xs={24} md={12} xl={8} key={exercise.id}>
                  <Card
                    hoverable
                    onClick={() => {
                      setSelectedExercise(exercise);
                      setExerciseModalVisible(true);
                    }}
                  >
                    <Space direction='vertical' size={8}>
                      <Text strong>{exercise.name}</Text>
                      <Space wrap>
                        <Tag color='blue'>{exercise.group}</Tag>
                        <Tag color='purple'>{exercise.level}</Tag>
                      </Space>
                      <Text type='secondary'>{exercise.description}</Text>
                      <Text>Calo đốt trung bình: {exercise.caloriesPerHour} kcal/giờ</Text>
                    </Space>
                  </Card>
                </Col>
              ))}
            </Row>
          </Space>
        </Card>
      </Space>

      <Modal
        destroyOnClose
        visible={workoutModalVisible}
        title={editingWorkout ? 'Sửa buổi tập' : 'Thêm buổi tập mới'}
        onCancel={() => {
          setWorkoutModalVisible(false);
          setEditingWorkout(null);
        }}
        onOk={submitWorkout}
      >
        <Form form={workoutForm} layout='vertical'>
          <Form.Item name='date' label='Ngày tập' rules={[{ required: true, message: 'Vui lòng chọn ngày tập' }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name='category' label='Loại tập' rules={[{ required: true, message: 'Vui lòng chọn loại tập' }]}>
            <Select options={workoutCategories.map((item) => ({ label: item, value: item }))} />
          </Form.Item>
          <Form.Item name='exercise' label='Bài tập' rules={[{ required: true, message: 'Vui lòng nhập tên bài tập' }]}>
            <Input />
          </Form.Item>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name='duration' label='Thời lượng (phút)' rules={[{ required: true, message: 'Nhập thời lượng' }]}>
                <InputNumber min={1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name='calories' label='Calo' rules={[{ required: true, message: 'Nhập calo' }]}>
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name='status' label='Trạng thái' rules={[{ required: true, message: 'Chọn trạng thái' }]}>
            <Select
              options={[
                { label: 'Hoàn thành', value: 'completed' },
                { label: 'Lên kế hoạch', value: 'planned' },
                { label: 'Bỏ lỡ', value: 'skipped' },
              ]}
            />
          </Form.Item>
          <Form.Item name='notes' label='Ghi chú'>
            <TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        destroyOnClose
        visible={healthModalVisible}
        title={editingHealth ? 'Sửa chỉ số sức khỏe' : 'Thêm chỉ số sức khỏe'}
        onCancel={() => {
          setHealthModalVisible(false);
          setEditingHealth(null);
        }}
        onOk={submitHealth}
      >
        <Form form={healthForm} layout='vertical'>
          <Form.Item name='date' label='Ngày ghi nhận' rules={[{ required: true, message: 'Vui lòng chọn ngày' }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name='weight' label='Cân nặng (kg)' rules={[{ required: true, message: 'Nhập cân nặng' }]}>
                <InputNumber min={1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name='height' label='Chiều cao (cm)' rules={[{ required: true, message: 'Nhập chiều cao' }]}>
                <InputNumber min={1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item
                name='restingHeartRate'
                label='Nhịp tim lúc nghỉ (bpm)'
                rules={[{ required: true, message: 'Nhập nhịp tim' }]}
              >
                <InputNumber min={1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name='sleepHours' label='Giờ ngủ' rules={[{ required: true, message: 'Nhập giờ ngủ' }]}>
                <InputNumber min={0} max={24} step={0.1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      <Drawer
        destroyOnClose
        width={420}
        visible={goalDrawerVisible}
        title={editingGoal ? 'Cập nhật mục tiêu' : 'Thêm mục tiêu mới'}
        onClose={() => {
          setGoalDrawerVisible(false);
          setEditingGoal(null);
        }}
        footer={
          <div style={{ textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setGoalDrawerVisible(false)}>Hủy</Button>
              <Button type='primary' onClick={submitGoal}>
                Lưu mục tiêu
              </Button>
            </Space>
          </div>
        }
      >
        <Form form={goalForm} layout='vertical'>
          <Form.Item name='name' label='Tên mục tiêu' rules={[{ required: true, message: 'Nhập tên mục tiêu' }]}>
            <Input />
          </Form.Item>
          <Form.Item name='type' label='Loại mục tiêu' rules={[{ required: true, message: 'Chọn loại mục tiêu' }]}>
            <Select options={['Giảm cân', 'Tăng cơ', 'Cải thiện sức bền', 'Khác'].map((item) => ({ label: item, value: item }))} />
          </Form.Item>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name='targetValue' label='Giá trị mục tiêu' rules={[{ required: true, message: 'Nhập mục tiêu' }]}>
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name='currentValue' label='Giá trị hiện tại' rules={[{ required: true, message: 'Nhập giá trị hiện tại' }]}>
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name='deadline' label='Deadline' rules={[{ required: true, message: 'Chọn deadline' }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name='status' label='Trạng thái' rules={[{ required: true, message: 'Chọn trạng thái' }]}>
            <Select options={['Đang thực hiện', 'Đã đạt', 'Đã hủy'].map((item) => ({ label: item, value: item }))} />
          </Form.Item>
        </Form>
      </Drawer>

      <Modal
        footer={null}
        visible={exerciseModalVisible}
        title={selectedExercise?.name}
        onCancel={() => {
          setExerciseModalVisible(false);
          setSelectedExercise(null);
        }}
      >
        {selectedExercise && (
          <Space direction='vertical' size={12} style={{ width: '100%' }}>
            <Space wrap>
              <Tag color='blue'>{selectedExercise.group}</Tag>
              <Tag color='purple'>{selectedExercise.level}</Tag>
            </Space>
            <Text>{selectedExercise.description}</Text>
            <Divider style={{ margin: '8px 0' }} />
            <Descriptions column={1} size='small'>
              <Descriptions.Item label='Tên bài tập'>{selectedExercise.name}</Descriptions.Item>
              <Descriptions.Item label='Nhóm cơ'>{selectedExercise.group}</Descriptions.Item>
              <Descriptions.Item label='Mức độ'>{selectedExercise.level}</Descriptions.Item>
              <Descriptions.Item label='Calo đốt trung bình'>{selectedExercise.caloriesPerHour} kcal/giờ</Descriptions.Item>
            </Descriptions>
          </Space>
        )}
      </Modal>
    </div>
  );
};

export default ManagePage;
