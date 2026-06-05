import { useMemo, useState } from 'react';

const API_BASE = 'https://asg-b2.onrender.com';

const ADMIN_FORMS = [
  {
    id: 'shorts',
    title: '쇼츠 등록',
    description: '유튜브 쇼츠 제목과 URL을 등록합니다.',
    endpoint: `${API_BASE}/addshorts`,
    fields: [
      { name: 'title', label: 'Title', type: 'text', placeholder: '예: 오버드라이브 유나' },
      { name: 'url', label: 'URL', type: 'url', placeholder: 'https://youtube.com/shorts/...' },
    ],
  },
  {
    id: 'vod',
    title: 'VOD 등록',
    description: '아프리카 VOD 제목과 URL을 등록합니다.',
    endpoint: `${API_BASE}/addafvod`,
    fields: [
      { name: 'title', label: 'Title', type: 'text', placeholder: '예: 아프리카 VOD 제목' },
      { name: 'url', label: 'URL', type: 'url', placeholder: 'https://vod.sooplive.com/player/...' },
    ],
  },
  {
    id: 'signature',
    title: '시그 등록',
    description: '시그니처 제목, 연결 URL, 이미지 URL을 등록합니다.',
    endpoint: `${API_BASE}/addsig`,
    fields: [
      { name: 'title', label: 'Title', type: 'text', placeholder: '예: 시그니처 제목' },
      { name: 'url', label: 'URL', type: 'url', placeholder: 'https://youtube.com/shorts/...' },
      { name: 'img', label: 'IMG', type: 'url', placeholder: 'https://.../image.jpg' },
    ],
  },
];

const salaryMembers = ['여리', '어푸', '다나', '달리', '유나', '서냥', '세교', '서현', '재명', '문어'];
const salaryRounds = Array.from({ length: 7 }, (_, i) => `엑셀부${i + 1}회차`);
const excludedSalaryMembers = ['문어', '재명', '이재명'];

function AdminPage() {
  const [scoreData, setScoreData] = useState([]);
  const [loadingScores, setLoadingScores] = useState(false);

  const [roundRevenues, setRoundRevenues] = useState({});
  const [shares, setShares] = useState({});
  const [penalties, setPenalties] = useState({});

  const [settingStatus, setSettingStatus] = useState('');

  const parseDateString = (value) => {
    if (!value || typeof value !== 'string') return null;

    const match = value.match(/Date\((\d+),(\d+),(\d+),(\d+),(\d+),(\d+)\)/);
    if (!match) return null;

    const [, year, month, day, hour, minute, second] = match.map(Number);
    return new Date(year, month - 1, day, hour, minute, second);
  };

  const fetchScoreData = async () => {
    try {
      setLoadingScores(true);
      const response = await fetch(`${API_BASE}/d`);

      if (!response.ok) {
        throw new Error(`${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      setScoreData(Array.isArray(data) ? data : []);
    } catch (error) {
      alert('점수 데이터 조회 실패');
      console.error(error);
    } finally {
      setLoadingScores(false);
    }
  };

  const loadSalarySettings = async () => {
    try {
      setSettingStatus('불러오는 중...');

      const response = await fetch(`${API_BASE}/salary-settings`);

      if (!response.ok) {
        throw new Error(`${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      setRoundRevenues(data.round_revenues || {});
      setShares(data.shares || {});
      setPenalties(data.penalties || {});

      setSettingStatus('불러오기 완료');
    } catch (error) {
      console.error(error);
      setSettingStatus('불러오기 실패');
      alert('급여 설정 불러오기 실패');
    }
  };

  const saveSalarySettings = async () => {
    try {
      setSettingStatus('저장 중...');

      const response = await fetch(`${API_BASE}/salary-settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          round_revenues: roundRevenues,
          shares,
          penalties,
        }),
      });

      if (!response.ok) {
        throw new Error(`${response.status} ${response.statusText}`);
      }

      setSettingStatus('저장 완료');
      alert('급여 설정 저장 완료');
    } catch (error) {
      console.error(error);
      setSettingStatus('저장 실패');
      alert('급여 설정 저장 실패');
    }
  };

  const scoreSummary = useMemo(() => {
    const result = {};

    scoreData.forEach((row) => {
      const dateText = row[0];
      const name = row[4];
      const score = Number(row[7]) || 0;
      const round = row[8];

      if (!name) return;
      if (!round) return;
      if (round.includes('직급전')) return;
      if (!score) return;

      const date = parseDateString(dateText);

      if (date) {
        const hour = date.getHours();

        if (hour >= 2 && hour < 12) return;
      }

      if (!result[name]) {
        result[name] = {
          name,
          total: 0,
          rounds: {},
        };
      }

      result[name].total += score;
      result[name].rounds[round] = (result[name].rounds[round] || 0) + score;
    });

    return Object.values(result).sort((a, b) => b.total - a.total);
  }, [scoreData]);

  const getRoundMemberScore = (roundName, memberName) => {
    return scoreData.reduce((sum, row) => {
      const name = row[4];
      const round = row[8];
      const score = Number(row[7]) || 0;

      if (round !== roundName) return sum;
      if (name !== memberName) return sum;

      return sum + score;
    }, 0);
  };

  const getExcludedRoundScore = (roundName) => {
    return scoreData.reduce((sum, row) => {
      const name = row[4];
      const round = row[8];
      const score = Number(row[7]) || 0;

      if (round !== roundName) return sum;
      if (!excludedSalaryMembers.includes(name)) return sum;

      return sum + score;
    }, 0);
  };

  const getPenaltyValue = (round, member, type) => {
    return Number(penalties?.[round]?.[member]?.[type]) || 0;
  };

  const updatePenalty = (round, member, type, value) => {
    setPenalties((prev) => ({
      ...prev,
      [round]: {
        ...(prev[round] || {}),
        [member]: {
          ...(prev[round]?.[member] || {}),
          [type]: value,
        },
      },
    }));
  };

  const updateShare = (member, value) => {
    setShares((prev) => ({
      ...prev,
      [member]: value,
    }));
  };

  const updateRoundRevenue = (round, value) => {
    setRoundRevenues((prev) => ({
      ...prev,
      [round]: value,
    }));
  };

  const getSalary = (round, member) => {
    const totalRevenue = Number(roundRevenues[round]) || 0;
    const excludedScore = getExcludedRoundScore(round);
    const adjustedRevenue = Math.max(totalRevenue - excludedScore, 0);

    const sharePercent = Number(shares[member]) || 0;
    const contentAdjust = getPenaltyValue(round, member, 'content');
    const attendanceAdjust = getPenaltyValue(round, member, 'attendance');

    return adjustedRevenue * 100 * 0.67 * (sharePercent / 100) + contentAdjust + attendanceAdjust;
  };

  const totalSalarySummary = salaryMembers.map((member) => {
  let totalScore = 0;
  let totalContent = 0;
  let totalAttendance = 0;
  let totalSalary = 0;

  salaryRounds.forEach((round) => {
    totalScore += getRoundMemberScore(round, member);
    totalContent += getPenaltyValue(round, member, 'content');
    totalAttendance += getPenaltyValue(round, member, 'attendance');
    totalSalary += getSalary(round, member);
  });

  return {
    member,
    totalScore,
    totalContent,
    totalAttendance,
    totalSalary,
  };
});

  return (
    <main className="admin-page">
      <section className="admin-hero">
        <p className="section-eyebrow">ADMIN</p>
        <h1>관리자 페이지</h1>
        <p>쇼츠, VOD, 시그니처 데이터 등록과 급여 설정을 관리합니다.</p>
      </section>

      <section className="admin-form-grid">
        {ADMIN_FORMS.map((form) => (
          <AdminForm key={form.id} form={form} />
        ))}
      </section>

      <section className="admin-salary-console">
        <div className="salary-console-head">
          <div>
            <p className="section-eyebrow">SALARY</p>
            <h2>개인별 총 점수 콘솔</h2>
            <p>직급전 제외 / 오전 2시 이후 오전 시간대 점수 제외</p>
          </div>

          <button type="button" className="admin-submit" onClick={fetchScoreData}>
            {loadingScores ? '불러오는 중...' : '점수 데이터 불러오기'}
          </button>
        </div>

        <div className="salary-table-wrap">
          <table className="salary-table">
            <thead>
              <tr>
                <th>순위</th>
                <th>이름</th>
                <th>총점</th>
                <th>회차별 점수</th>
              </tr>
            </thead>
            <tbody>
              {scoreSummary.map((item, index) => (
                <tr key={item.name}>
                  <td>{index + 1}</td>
                  <td>{item.name}</td>
                  <td>{item.total.toLocaleString()}</td>
                  <td>
                    {Object.entries(item.rounds).map(([round, score]) => (
                      <div key={round}>
                        {round}: {score.toLocaleString()}
                      </div>
                    ))}
                  </td>
                </tr>
              ))}

              {!scoreSummary.length && (
                <tr>
                  <td colSpan="4">점수 데이터를 불러오면 여기에 표시됩니다.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <hr className="admin-divider" />

        <div className="salary-console-head">
          <div>
            <h2>급여 계산표</h2>
            <p>
              계산식: (회차별 총매출 - 문어/재명 점수) × 100 × 0.67 × 지분% + 콘텐츠조정 + 근태조정
            </p>
          </div>

          <div className="salary-actions">
            <button type="button" className="admin-submit" onClick={saveSalarySettings}>
              저장하기
            </button>
            <button type="button" className="admin-submit is-blue" onClick={loadSalarySettings}>
              불러오기
            </button>
          </div>
        </div>

        {settingStatus ? <p className="admin-status is-success">{settingStatus}</p> : null}

        <h3>지분 설정</h3>

        <div className="share-grid">
          {salaryMembers.map((member) => (
            <label key={member} className="share-box">
              <strong>{member}</strong>
              <input
                type="number"
                placeholder="지분 %"
                value={shares[member] || ''}
                onChange={(e) => updateShare(member, e.target.value)}
              />
            </label>
          ))}
        </div>

        <h2>7회차 급여 총합표</h2>

        <div className="salary-table-wrap">
          <table className="salary-table">
            <thead>
              <tr>
                <th>멤버</th>
                <th>7회차 총점수</th>
                <th>콘텐츠 총합</th>
                <th>근태 총합</th>
                <th>7회차 총 급여</th>
              </tr>
            </thead>

            <tbody>
              {totalSalarySummary.map((item) => (
                <tr key={item.member}>
                  <td>{item.member}</td>
                  <td>{item.totalScore.toLocaleString()}</td>
                  <td>{item.totalContent.toLocaleString()}</td>
                  <td>{item.totalAttendance.toLocaleString()}</td>
                  <td>{Math.round(item.totalSalary).toLocaleString()}원</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {salaryRounds.map((round) => {
          const excludedScore = getExcludedRoundScore(round);
          const totalRevenue = Number(roundRevenues[round]) || 0;
          const adjustedRevenue = Math.max(totalRevenue - excludedScore, 0);

          return (
            <section key={round} className="round-salary-card">
              <div className="round-salary-head">
                <h3>{round}</h3>

                <label>
                  총매출
                  <input
                    type="number"
                    value={roundRevenues[round] || ''}
                    onChange={(e) => updateRoundRevenue(round, e.target.value)}
                    placeholder="총매출"
                  />
                </label>

                <p>
                  문어/재명 제외점수: {excludedScore.toLocaleString()} / 계산매출:{' '}
                  {adjustedRevenue.toLocaleString()}
                </p>
              </div>

              <div className="salary-table-wrap">
                <table className="salary-table">
                  <thead>
                    <tr>
                      <th>멤버</th>
                      <th>회차 점수</th>
                      <th>지분%</th>
                      <th>콘텐츠 조정</th>
                      <th>근태 조정</th>
                      <th>예상 급여</th>
                    </tr>
                  </thead>

                  <tbody>
                    {salaryMembers.map((member) => {
                      const memberScore = getRoundMemberScore(round, member);
                      const salary = getSalary(round, member);

                      return (
                        <tr key={`${round}-${member}`}>
                          <td>{member}</td>
                          <td>{memberScore.toLocaleString()}</td>
                          <td>{Number(shares[member]) || 0}%</td>
                          <td>
                            <input
                              type="number"
                              value={penalties?.[round]?.[member]?.content || ''}
                              onChange={(e) => updatePenalty(round, member, 'content', e.target.value)}
                              placeholder="예: -10000"
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              value={penalties?.[round]?.[member]?.attendance || ''}
                              onChange={(e) =>
                                updatePenalty(round, member, 'attendance', e.target.value)
                              }
                              placeholder="예: -10000"
                            />
                          </td>
                          <td>{Math.round(salary).toLocaleString()}원</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          );
        })}
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
        headers: { 'Content-Type': 'application/json' },
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
