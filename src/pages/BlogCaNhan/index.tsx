import { useEffect, useMemo, useState } from 'react';
import { Button, Card, Form, Input, Modal, Pagination, Popconfirm, Select, Space, Table, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import debounce from 'lodash/debounce';

type Post = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  cover: string;
  author: string;
  date: string;
  createdAt: string;
  tags: string[];
  status: 'draft' | 'published';
  views: number;
};

const { Paragraph, Text, Title } = Typography;

const AUTHOR = {
  name: 'MDD',
  bio: 'Sinh vien.',
  avatar: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ8yqqY53QR5ayAkNK1uSsMGjtsMxNOmYJz-A&s',
  skills: ['AOV', 'JAVALORANT', 'TFT','HTMLOL'],
};

const seed: Post[] = [
  {
    id: '1',
    title: 'Hoc React co ban',
    slug: 'hoc-react-co-ban',
    summary: 'Tong hop cach hoc React cho nguoi moi.',
    content: '# React co ban\nHoc tu component, props, state.',
    cover: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=1200',
    author: AUTHOR.name,
    date: '2026-04-18',
    createdAt: '2026-04-18',
    tags: ['React', 'Frontend'],
    status: 'published',
    views: 25,
  },
  {
    id: '2',
    title: 'Viet TypeScript de hon',
    slug: 'viet-typescript-de-hon',
    summary: 'Meo dat type don gian va de doc.',
    content: '# TypeScript\nNen dat type gon, dung lai duoc.',
    cover: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200',
    author: AUTHOR.name,
    date: '2026-04-19',
    createdAt: '2026-04-19',
    tags: ['TypeScript'],
    status: 'published',
    views: 10,
  },
];

const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

const md = (s: string) => s.replace(/^# (.*)$/gm, '<h2>$1</h2>').replace(/\n/g, '<br/>');

const BlogCaNhanPage = () => {
  const [posts, setPosts] = useState<Post[]>(seed);
  const [tab, setTab] = useState<'home' | 'about' | 'posts' | 'tags'>('home');
  const [pickId, setPickId] = useState<string>();

  const [q, setQ] = useState('');
  const [qDeb, setQDeb] = useState('');
  const [tag, setTag] = useState<string>();
  const [page, setPage] = useState(1);

  const [searchTitle, setSearchTitle] = useState('');
  const [status, setStatus] = useState<'draft' | 'published'>();
  const [openPost, setOpenPost] = useState(false);
  const [editing, setEditing] = useState<string>();
  const [form] = Form.useForm<Partial<Post>>();

  const [openTag, setOpenTag] = useState(false);
  const [tagEditing, setTagEditing] = useState<string>();
  const [tagName, setTagName] = useState('');

  const allTags = useMemo(() => Array.from(new Set(posts.flatMap((p) => p.tags))), [posts]);
  const selected = posts.find((p) => p.id === pickId);
  const published = posts.filter((p) => p.status === 'published');

  const homeList = useMemo(() => {
    const k = qDeb.trim().toLowerCase();
    return published.filter((p) => (!tag || p.tags.includes(tag)) && (!k || `${p.title} ${p.summary}`.toLowerCase().includes(k)));
  }, [published, qDeb, tag]);

  const homePageList = useMemo(() => homeList.slice((page - 1) * 9, page * 9), [homeList, page]);

  const manageList = useMemo(
    () =>
      posts.filter((p) => (!status || p.status === status) && (!searchTitle || p.title.toLowerCase().includes(searchTitle.toLowerCase()))),
    [posts, status, searchTitle],
  );

  const rel = useMemo(
    () => (selected ? published.filter((p) => p.id !== selected.id && p.tags.some((t) => selected.tags.includes(t))).slice(0, 4) : []),
    [selected, published],
  );

  const db = useMemo(() => debounce((v: string) => setQDeb(v), 300), []);
  useEffect(() => () => db.cancel(), [db]);

  const openAdd = () => {
    setEditing(undefined);
    form.resetFields();
    form.setFieldsValue({ status: 'draft', tags: [], cover: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200' });
    setOpenPost(true);
  };

  const openEdit = (p: Post) => {
    setEditing(p.id);
    form.setFieldsValue(p);
    setOpenPost(true);
  };

  const savePost = async () => {
    const v = (await form.validateFields()) as Post;
    const slug = slugify(v.slug || v.title);
    const today = new Date().toISOString().slice(0, 10);
    if (posts.some((p) => p.slug === slug && p.id !== editing)) return form.setFields([{ name: 'slug', errors: ['Slug da ton tai'] }]);

    if (editing) {
      setPosts((x) => x.map((p) => (p.id === editing ? { ...p, ...v, slug, date: v.status === 'published' ? p.date || today : p.date } : p)));
    } else {
      setPosts((x) => [{ ...v, id: `${Date.now()}`, slug, author: AUTHOR.name, createdAt: today, date: v.status === 'published' ? today : '-', views: 0 }, ...x]);
    }
    setOpenPost(false);
  };

  const delPost = (id: string) => {
    setPosts((x) => x.filter((p) => p.id !== id));
    if (pickId === id) setPickId(undefined);
  };

  const openDetail = (id: string) => {
    setPosts((x) => x.map((p) => (p.id === id ? { ...p, views: p.views + 1 } : p)));
    setPickId(id);
  };

  const saveTag = () => {
    const t = tagName.trim();
    if (!t) return;
    if (allTags.includes(t) && tagEditing !== t) return;
    if (tagEditing) setPosts((x) => x.map((p) => ({ ...p, tags: p.tags.map((a) => (a === tagEditing ? t : a)) })));
    setOpenTag(false);
  };

  const delTag = (t: string) => {
    setPosts((x) => x.map((p) => ({ ...p, tags: p.tags.filter((a) => a !== t) })));
    if (tag === t) setTag(undefined);
  };

  const postCols: ColumnsType<Post> = [
    { title: 'Tieu de', dataIndex: 'title' },
    { title: 'Trang thai', dataIndex: 'status', width: 120, render: (v) => (v === 'published' ? <Tag color="green">Da dang</Tag> : <Tag>Nhap</Tag>) },
    { title: 'The', dataIndex: 'tags', width: 200, render: (x: string[]) => <>{x.map((t) => <Tag key={t}>{t}</Tag>)}</> },
    { title: 'View', dataIndex: 'views', width: 80, align: 'right' },
    { title: 'Ngay tao', dataIndex: 'createdAt', width: 110 },
    {
      title: 'Thao tac',
      width: 140,
      render: (_, p) => (
        <Space>
          <Button type="link" onClick={() => openEdit(p)}>Sua</Button>
          <Popconfirm title="Xoa bai nay?" onConfirm={() => delPost(p.id)}><Button type="link" danger>Xoa</Button></Popconfirm>
        </Space>
      ),
    },
  ];

  if (selected) {
    return (
      <Card title={selected.title} extra={<Button onClick={() => setPickId(undefined)}>Quay lai</Button>}>
        <Text type="secondary">{selected.author} - {selected.date}</Text>
        <div style={{ margin: '8px 0' }}>{selected.tags.map((t) => <Tag key={t}>{t}</Tag>)}</div>
        <img src={selected.cover} alt={selected.title} style={{ width: '100%', maxHeight: 320, objectFit: 'cover', borderRadius: 8 }} />
        <div style={{ marginTop: 12 }} dangerouslySetInnerHTML={{ __html: md(selected.content) }} />
        <Card title="Bai viet lien quan" style={{ marginTop: 16 }}>
          {rel.length ? rel.map((p) => <Button key={p.id} type="link" onClick={() => openDetail(p.id)} style={{ paddingLeft: 0 }}>{p.title}</Button>) : <Text type="secondary">Khong co</Text>}
        </Card>
      </Card>
    );
  }

  return (
    <Card
      title="Blog ca nhan"
      extra={
        <Space>
          <Button type={tab === 'home' ? 'primary' : 'default'} onClick={() => setTab('home')}>Trang chu</Button>
          <Button type={tab === 'about' ? 'primary' : 'default'} onClick={() => setTab('about')}>Gioi thieu</Button>
          <Button type={tab === 'posts' ? 'primary' : 'default'} onClick={() => setTab('posts')}>Quan ly bai viet</Button>
          <Button type={tab === 'tags' ? 'primary' : 'default'} onClick={() => setTab('tags')}>Quan ly the</Button>
        </Space>
      }
    >
      {tab === 'home' && (
        <>
          <Space style={{ marginBottom: 12 }}>
            <Input placeholder="Tim bai..." value={q} onChange={(e) => { setQ(e.target.value); db(e.target.value); setPage(1); }} />
            <Select allowClear placeholder="Loc tag" value={tag} onChange={(v) => { setTag(v); setPage(1); }} style={{ width: 180 }} options={allTags.map((t) => ({ label: t, value: t }))} />
          </Space>
          <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(3, 1fr)' }}>
            {homePageList.map((p) => (
              <Card key={p.id} hoverable onClick={() => openDetail(p.id)} cover={<img src={p.cover} alt={p.title} style={{ height: 160, objectFit: 'cover' }} />}>
                <Title level={5}>{p.title}</Title>
                <Paragraph ellipsis={{ rows: 2 }}>{p.summary}</Paragraph>
                <Text type="secondary">{p.date} - {p.author}</Text>
              </Card>
            ))}
          </div>
          {!homeList.length && <Text type="secondary">Khong co bai phu hop</Text>}
          {!!homeList.length && <Pagination current={page} pageSize={9} total={homeList.length} onChange={setPage} style={{ marginTop: 12, textAlign: 'right' }} />}
        </>
      )}

      {tab === 'about' && (
        <Card>
          <img src={AUTHOR.avatar} alt={AUTHOR.name} style={{ width: 96, height: 96, borderRadius: '50%' }} />
          <Title level={4}>{AUTHOR.name}</Title>
          <Paragraph>{AUTHOR.bio}</Paragraph>
          {AUTHOR.skills.map((s) => <Tag key={s}>{s}</Tag>)}
        </Card>
      )}

      {tab === 'posts' && (
        <>
          <Space style={{ marginBottom: 12 }}>
            <Input placeholder="Tim tieu de..." value={searchTitle} onChange={(e) => setSearchTitle(e.target.value)} />
            <Select allowClear placeholder="Trang thai" value={status} onChange={setStatus} style={{ width: 150 }} options={[{ label: 'Nhap', value: 'draft' }, { label: 'Da dang', value: 'published' }]} />
            <Button type="primary" onClick={openAdd}>Them bai</Button>
          </Space>
          <Table rowKey="id" columns={postCols} dataSource={manageList} pagination={{ pageSize: 8 }} />
        </>
      )}

      {tab === 'tags' && (
        <>
          <Button type="primary" onClick={() => { setTagEditing(undefined); setTagName(''); setOpenTag(true); }} style={{ marginBottom: 12 }}>Them the</Button>
          <Table
            rowKey="tag"
            pagination={false}
            dataSource={allTags.map((t) => ({ tag: t, count: posts.filter((p) => p.tags.includes(t)).length }))}
            columns={[
              { title: 'Tag', dataIndex: 'tag' },
              { title: 'So bai', dataIndex: 'count', width: 100, align: 'right' },
              {
                title: 'Thao tac',
                width: 140,
                render: (_, r: { tag: string }) => (
                  <Space>
                    <Button type="link" onClick={() => { setTagEditing(r.tag); setTagName(r.tag); setOpenTag(true); }}>Sua</Button>
                    <Popconfirm title="Xoa tag?" onConfirm={() => delTag(r.tag)}><Button type="link" danger>Xoa</Button></Popconfirm>
                  </Space>
                ),
              },
            ]}
          />
        </>
      )}

      <Modal visible={openPost} title={editing ? 'Sua bai viet' : 'Them bai viet'} onCancel={() => setOpenPost(false)} onOk={savePost}>
        <Form<Partial<Post>> form={form} layout="vertical">
          <Form.Item name="title" label="Tieu de" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="slug" label="Slug"><Input /></Form.Item>
          <Form.Item name="summary" label="Tom tat" rules={[{ required: true }]}><Input.TextArea rows={2} /></Form.Item>
          <Form.Item name="content" label="Noi dung" rules={[{ required: true }]}><Input.TextArea rows={4} /></Form.Item>
          <Form.Item name="cover" label="Anh URL" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="tags" label="The" rules={[{ required: true }]}><Select mode="multiple" options={allTags.map((t) => ({ label: t, value: t }))} /></Form.Item>
          <Form.Item name="status" label="Trang thai" rules={[{ required: true }]}><Select options={[{ label: 'Nhap', value: 'draft' }, { label: 'Da dang', value: 'published' }]} /></Form.Item>
        </Form>
      </Modal>

      <Modal visible={openTag} title={tagEditing ? 'Sua the' : 'Them the'} onCancel={() => setOpenTag(false)} onOk={saveTag}>
        <Input value={tagName} onChange={(e) => setTagName(e.target.value)} placeholder="Ten the" />
      </Modal>
    </Card>
  );
};

export default BlogCaNhanPage;
