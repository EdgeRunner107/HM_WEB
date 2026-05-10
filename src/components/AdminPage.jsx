import { useState } from 'react';

const ADMIN_FORMS = [
  {
    id: 'shorts',
    title: '쇼츠 등록',
    description: '유튜브 쇼츠 제목과 URL을 등록합니다.',
    endpoint: 'https://asg-b2.onrender.com/addshorts',
    fields: [
      { name: 'title', label: 'Title', type: 'text', placeholder: '예: 오버드라이브 유나' },
      { name: 'url', label: 'URL', type: 'url', placeholder: 'https://youtube.com/shorts/...' },
    ],
  },
  {
    id: 'vod',
    title: 'VOD 등록',
    description: '아프리카 VOD 제목과 URL을 등록합니다.',
    endpoint: 'https://asg-b2.onrender.com/addafvod',
    fields: [
      { name: 'title', label: 'Title', type: 'text', placeholder: '예: 아프리카 VOD 제목' },
      { name: 'url', label: 'URL', type: 'url', placeholder: 'https://vod.sooplive.com/player/...' },
    ],
  },
  {
    id: 'signature',
    title: '시그 등록',
    description: '시그니처 제목, 연결 URL, 이미지 URL을 등록합니다.',
    endpoint: 'https://asg-b2.onrender.com/addsig',
    fields: [
      { name: 'title', label: 'Title', type: 'text', placeholder: '예: 시그니처 제목' },
      { name: 'url', label: 'URL', type: 'url', placeholder: 'https://youtube.com/shorts/...' },
      { name: 'img', label: 'IMG', type: 'url', placeholder: 'https://.../image.jpg' },
    ],
  },
];

function AdminPage() {
  return (
    <main className="admin-page">
      <section className="admin-hero">
        <p className="section-eyebrow">ADMIN</p>
        <h1>관리자 페이지</h1>
        <p>쇼츠, VOD, 시그니처 데이터를 API로 등록합니다.</p>
      </section>

      <section className="admin-form-grid">
        {ADMIN_FORMS.map((form) => (
          <AdminForm key={form.id} form={form} />
        ))}
      </section>
    </main>
  );
}

function AdminForm({ form }) {
  const [values, setValues] = useState(() =>
    form.fields.reduce((acc, field) => {
      acc[field.name] = '';
      return acc;
    }, {})
  );
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: '', message: '' });

    try {
      const response = await fetch(form.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error(`${response.status} ${response.statusText}`);
      }

      setStatus({ type: 'success', message: '등록이 완료되었습니다.' });
      setValues(
        form.fields.reduce((acc, field) => {
          acc[field.name] = '';
          return acc;
        }, {})
      );
    } catch (error) {
      setStatus({ type: 'error', message: '등록에 실패했습니다. API 상태를 확인해주세요.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="admin-card" onSubmit={handleSubmit}>
      <div className="admin-card__head">
        <h2>{form.title}</h2>
        <p>{form.description}</p>
      </div>

      <div className="admin-card__fields">
        {form.fields.map((field) => (
          <label key={field.name} className="admin-field">
            <span>{field.label}</span>
            <input
              required
              type={field.type}
              name={field.name}
              value={values[field.name]}
              placeholder={field.placeholder}
              onChange={handleChange}
            />
          </label>
        ))}
      </div>

      <button type="submit" className="admin-submit" disabled={isSubmitting}>
        {isSubmitting ? '등록 중...' : form.title}
      </button>

      {status.message ? <p className={`admin-status is-${status.type}`}>{status.message}</p> : null}
    </form>
  );
}

export default AdminPage;
