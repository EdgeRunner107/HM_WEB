import { useState } from 'react';

const API_BASE = 'https://asg-b2.onrender.com';
const SETTING_API = 'https://hm-web-back.onrender.com/salary-settings';

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
const waiterMembers = ['문어', '재명'];
const salaryRounds = Array.from({ length: 7 }, (_, i) => `엑셀부${i + 1}회차`);
const excludedSalaryMembers = ['문어', '재명', '이재명'];

function AdminPage() {
  const [scoreData, setScoreData] = useState([]);
  const [loadingScores, setLoadingScores] = useState(false);

  const [roundRevenues, setRoundRevenues] = useState({});
  const [shares, setShares] = useState({});
  const [penalties, setPenalties] = useState({});
  const [specialContributions, setSpecialContributions] = useState({});
  const [specialRoundShares, setSpecialRoundShares] = useState({});

  const [jobBattleRate, setJobBattleRate] = useState('0.55');
  const [totalContributionRate, setTotalContributionRate] = useState('0.7');

  const [waiterRates, setWaiterRates] = useState({
    문어: '0.55',
    재명: '0.55',
  });

  const [settingStatus, setSettingStatus] = useState('');

  const parseDateString = (value) => {
    if (!value || typeof value !== 'string') return null;

    const match = value.match(/Date\((\d+),(\d+),(\d+),(\d+),(\d+),(\d+)\)/);
    if (!match) return null;

    const [, year, month, day, hour, minute, second] = match.map(Number);
    return new Date(year, month - 1, day, hour, minute, second);
  };

  const isExcludedTimeForNormalRound = (dateText) => {
    const date = parseDateString(dateText);
    if (!date) return false;

    const hour = date.getHours();
    return hour >= 2 && hour < 12;
  };

  const shouldExcludeScore = (memberName, dateText) => {
    if (waiterMembers.includes(memberName)) {
      return false;
    }

    return isExcludedTimeForNormalRound(dateText);
  };

  const isJobBattleRound = (round) => {
    return typeof round === 'string' && round.includes('직급전');
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

      const response = await fetch(SETTING_API);

      if (!response.ok) {
        throw new Error(`${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      setRoundRevenues(data.round_revenues || {});
      setShares(data.shares || {});
      setPenalties(data.penalties || {});
      setSpecialContributions(data.special_contributions || {});
      setSpecialRoundShares(data.special_round_shares || {});
      setJobBattleRate(data.job_battle_rate || '0.55');
      setTotalContributionRate(data.total_contribution_rate || '0.7');
      setWaiterRates(data.waiter_rates || { 문어: '0.55', 재명: '0.55' });

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

      const response = await fetch(SETTING_API, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          round_revenues: roundRevenues,
          shares,
          penalties,
          special_contributions: specialContributions,
          special_round_shares: specialRoundShares,
          job_battle_rate: jobBattleRate,
          total_contribution_rate: totalContributionRate,
          waiter_rates: waiterRates,
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

  const getSpecialContribution = (round, member) => {
    return Number(specialContributions?.[round]?.[member]) || 0;
  };

  const updateSpecialContribution = (round, member, value) => {
    setSpecialContributions((prev) => ({
      ...prev,
      [round]: {
        ...(prev[round] || {}),
        [member]: value,
      },
    }));
  };

  const isSpecialRound = (round) => {
    return !!specialRoundShares?.[round]?._enabled;
  };

  const toggleSpecialRound = (round) => {
    setSpecialRoundShares((prev) => ({
      ...prev,
      [round]: {
        ...(prev[round] || {}),
        _enabled: !prev?.[round]?._enabled,
      },
    }));
  };

  const updateSpecialRoundShare = (round, member, value) => {
    setSpecialRoundShares((prev) => ({
      ...prev,
      [round]: {
        ...(prev[round] || {}),
        _enabled: true,
        [member]: value,
      },
    }));
  };

  const getMemberShare = (round, member) => {
    if (isSpecialRound(round)) {
      return Number(specialRoundShares?.[round]?.[member]) || 0;
    }

    return Number(shares[member]) || 0;
  };

  const getBaseRoundMemberScore = (roundName, memberName) => {
    return scoreData.reduce((sum, row) => {
      const dateText = row[0];
      const name = row[4];
      const round = row[8];
      const score = Number(row[7]) || 0;

      if (isJobBattleRound(round)) return sum;
      if (round !== roundName) return sum;
      if (name !== memberName) return sum;
      if (shouldExcludeScore(name, dateText)) return sum;

      return sum + score;
    }, 0);
  };

  const getRoundMemberScore = (roundName, memberName) => {
    return getBaseRoundMemberScore(roundName, memberName) + getSpecialContribution(roundName, memberName);
  };

  const getExcludedRoundScore = (roundName) => {
    return scoreData.reduce((sum, row) => {
      const dateText = row[0];
      const name = row[4];
      const round = row[8];
      const score = Number(row[7]) || 0;

      if (isJobBattleRound(round)) return sum;
      if (round !== roundName) return sum;
      if (!excludedSalaryMembers.includes(name)) return sum;
      if (shouldExcludeScore(name, dateText)) return sum;

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

    const sharePercent = getMemberShare(round, member);
    const contentAdjust = getPenaltyValue(round, member, 'content');
    const attendanceAdjust = getPenaltyValue(round, member, 'attendance');

    return adjustedRevenue * 100 * 0.63 * (sharePercent / 100) + contentAdjust + attendanceAdjust;
  };

  const jobBattleRounds = Array.from(
    new Set(scoreData.map((row) => row[8]).filter((round) => isJobBattleRound(round)))
  );

  const getJobBattleMemberScore = (memberName) => {
    return scoreData.reduce((sum, row) => {
      const name = row[4];
      const round = row[8];
      const score = Number(row[7]) || 0;

      if (!isJobBattleRound(round)) return sum;
      if (name !== memberName) return sum;

      return sum + score;
    }, 0);
  };

  const getJobBattleMemberSalary = (memberName) => {
    const score = getJobBattleMemberScore(memberName);
    const rate = Number(jobBattleRate) || 0;

    return score * 63 * rate;
  };

  const getWaiterNormalScore = (memberName) => {
    return salaryRounds.reduce((sum, round) => {
      return sum + getRoundMemberScore(round, memberName);
    }, 0);
  };

  const getWaiterTotalScore = (memberName) => {
    return getWaiterNormalScore(memberName) + getJobBattleMemberScore(memberName);
  };

  const getWaiterRate = (memberName) => {
    return Number(waiterRates?.[memberName]) || 0;
  };

  const updateWaiterRate = (memberName, value) => {
    setWaiterRates((prev) => ({
      ...prev,
      [memberName]: value,
    }));
  };

  const getWaiterAttendanceAdjust = (memberName) => {
    return salaryRounds.reduce((sum, round) => {
      return sum + getPenaltyValue(round, memberName, 'attendance');
    }, 0);
  };

  const getWaiterSalary = (memberName) => {
    const totalScore = getWaiterTotalScore(memberName);
    const rate = getWaiterRate(memberName);
    const attendanceAdjust = getWaiterAttendanceAdjust(memberName);

    return totalScore * 63 * rate + attendanceAdjust;
  };

  const scoreSummary = (() => {
    const result = {};

    scoreData.forEach((row) => {
      const dateText = row[0];
      const name = row[4];
      const score = Number(row[7]) || 0;
      const round = row[8];

      if (!name) return;
      if (!round) return;
      if (!score) return;
      if (isJobBattleRound(round)) return;
      if (shouldExcludeScore(name, dateText)) return;

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

    salaryRounds.forEach((round) => {
      salaryMembers.forEach((member) => {
        const specialScore = getSpecialContribution(round, member);

        if (!specialScore) return;

        if (!result[member]) {
          result[member] = {
            name: member,
            total: 0,
            rounds: {},
          };
        }

        result[member].total += specialScore;
        result[member].rounds[round] = (result[member].rounds[round] || 0) + specialScore;
      });
    });

    return Object.values(result).sort((a, b) => b.total - a.total);
  })();

  const totalContributionSummary = salaryMembers
    .map((member) => {
      const totalScore = salaryRounds.reduce((sum, round) => {
        return sum + getRoundMemberScore(round, member);
      }, 0);

      const contributionPay = totalScore * (Number(totalContributionRate) || 0);

      return {
        member,
        totalScore,
        contributionPay,
      };
    })
    .filter((item) => item.totalScore > 0)
    .sort((a, b) => b.totalScore - a.totalScore);

  const jobBattleSummary = salaryMembers.map((member) => {
    const score = getJobBattleMemberScore(member);
    const salary = getJobBattleMemberSalary(member);

    return {
      member,
      score,
      salary,
    };
  });

  const waiterSalarySummary = waiterMembers.map((member) => {
    const normalScore = getWaiterNormalScore(member);
    const jobBattleScore = getJobBattleMemberScore(member);
    const totalScore = getWaiterTotalScore(member);
    const attendanceAdjust = getWaiterAttendanceAdjust(member);
    const rate = getWaiterRate(member);
    const salary = getWaiterSalary(member);

    return {
      member,
      normalScore,
      jobBattleScore,
      totalScore,
      attendanceAdjust,
      rate,
      salary,
    };
  });

  const totalSalarySummary = salaryMembers.map((member) => {
    let totalScore = 0;
    let totalContent = 0;
    let totalAttendance = 0;
    let totalSpecialContribution = 0;
    let normalSalary = 0;

    salaryRounds.forEach((round) => {
      totalScore += getRoundMemberScore(round, member);
      totalSpecialContribution += getSpecialContribution(round, member);
      totalContent += getPenaltyValue(round, member, 'content');
      totalAttendance += getPenaltyValue(round, member, 'attendance');
      normalSalary += getSalary(round, member);
    });

    const jobBattleScore = getJobBattleMemberScore(member);
    const jobBattleSalary = getJobBattleMemberSalary(member);
    const waiterSalary = waiterMembers.includes(member) ? getWaiterSalary(member) : 0;

    const totalSalary = waiterMembers.includes(member)
      ? waiterSalary
      : normalSalary + jobBattleSalary;

    return {
      member,
      totalScore,
      totalSpecialContribution,
      totalContent,
      totalAttendance,
      normalSalary,
      jobBattleScore,
      jobBattleSalary,
      waiterSalary,
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
            <p>직급전 제외 / 일반 멤버 오전 2시 이후 제외 / 문어·재명은 새벽 점수 포함</p>
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
            <p>일반회차: (회차별 총매출 - 문어/재명 점수) × 100 × 0.63 × 기본 지분%</p>
            <p>직급전: 개인 직급전 점수 × 63 × 직급전 배율</p>
            <p>웨이터: 일반회차 점수 + 직급전 점수 전체 합산 × 63 × 개인 배율 - 근태금액</p>
            <p>7회차 총합 기여도: 직급전 제외 전체 점수 × 기여도 배율</p>
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

        <h3>기본 지분 설정</h3>

        <div className="share-grid">
          {salaryMembers.map((member) => (
            <label key={member} className="share-box">
              <strong>{member}</strong>
              <input
                type="number"
                placeholder="기본 지분 %"
                value={shares[member] || ''}
                onChange={(e) => updateShare(member, e.target.value)}
              />
            </label>
          ))}
        </div>

        <h3>직급전 배율 설정</h3>

        <div className="share-grid">
          <label className="share-box">
            <strong>직급전 배율</strong>
            <input
              type="number"
              step="0.01"
              placeholder="예: 0.55"
              value={jobBattleRate}
              onChange={(e) => setJobBattleRate(e.target.value)}
            />
          </label>
        </div>

        <h3>웨이터 개인별 배율 설정</h3>

        <div className="share-grid">
          {waiterMembers.map((member) => (
            <label key={`waiter-rate-${member}`} className="share-box">
              <strong>{member} 배율</strong>
              <input
                type="number"
                step="0.01"
                placeholder="예: 0.55"
                value={waiterRates?.[member] || ''}
                onChange={(e) => updateWaiterRate(member, e.target.value)}
              />
            </label>
          ))}
        </div>

        <h3>7회차 총합 기여도 배율 설정</h3>

        <div className="share-grid">
          <label className="share-box">
            <strong>기여도 배율</strong>
            <input
              type="number"
              step="0.01"
              placeholder="예: 0.7"
              value={totalContributionRate}
              onChange={(e) => setTotalContributionRate(e.target.value)}
            />
          </label>
        </div>

        <h2>7회차 + 직급전 급여 총합표</h2>

        <div className="salary-table-wrap">
          <table className="salary-table">
            <thead>
              <tr>
                <th>멤버</th>
                <th>일반회차 총점수</th>
                <th>특별기여도 총합</th>
                <th>콘텐츠 총합</th>
                <th>근태 총합</th>
                <th>일반 급여</th>
                <th>직급전 점수</th>
                <th>직급전 급여</th>
                <th>웨이터 급여</th>
                <th>최종 총 급여</th>
              </tr>
            </thead>

            <tbody>
              {totalSalarySummary.map((item) => (
                <tr key={item.member}>
                  <td>{item.member}</td>
                  <td>{item.totalScore.toLocaleString()}</td>
                  <td>{item.totalSpecialContribution.toLocaleString()}</td>
                  <td>{item.totalContent.toLocaleString()}</td>
                  <td>{item.totalAttendance.toLocaleString()}</td>
                  <td>{Math.round(item.normalSalary).toLocaleString()}원</td>
                  <td>{item.jobBattleScore.toLocaleString()}</td>
                  <td>{Math.round(item.jobBattleSalary).toLocaleString()}원</td>
                  <td>
                    {waiterMembers.includes(item.member)
                      ? `${Math.round(item.waiterSalary).toLocaleString()}원`
                      : '-'}
                  </td>
                  <td>{Math.round(item.totalSalary).toLocaleString()}원</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2>7회차 총합 기여도표</h2>

        <div className="salary-table-wrap">
          <table className="salary-table">
            <thead>
              <tr>
                <th>순위</th>
                <th>멤버</th>
                <th>직급전 제외 총점수</th>
                <th>계산식</th>
                <th>기여도 금액</th>
              </tr>
            </thead>

            <tbody>
              {totalContributionSummary.map((item, index) => (
                <tr key={`contribution-${item.member}`}>
                  <td>{index + 1}</td>
                  <td>{item.member}</td>
                  <td>{item.totalScore.toLocaleString()}</td>
                  <td>
                    {item.totalScore.toLocaleString()} × {Number(totalContributionRate) || 0}
                  </td>
                  <td>{Math.round(item.contributionPay).toLocaleString()}원</td>
                </tr>
              ))}

              {!totalContributionSummary.length && (
                <tr>
                  <td colSpan="5">점수 데이터를 불러오면 여기에 표시됩니다.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <h2>직급전 급여표</h2>

        <p>
          감지된 직급전:{' '}
          {jobBattleRounds.length ? jobBattleRounds.join(', ') : '직급전 데이터 없음'}
        </p>

        <div className="salary-table-wrap">
          <table className="salary-table">
            <thead>
              <tr>
                <th>멤버</th>
                <th>직급전 점수</th>
                <th>계산식</th>
                <th>직급전 급여</th>
              </tr>
            </thead>

            <tbody>
              {jobBattleSummary.map((item) => (
                <tr key={`job-${item.member}`}>
                  <td>{item.member}</td>
                  <td>{item.score.toLocaleString()}</td>
                  <td>
                    {item.score.toLocaleString()} × 63 × {Number(jobBattleRate) || 0}
                  </td>
                  <td>{Math.round(item.salary).toLocaleString()}원</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2>웨이터 급여표</h2>

        <div className="salary-table-wrap">
          <table className="salary-table">
            <thead>
              <tr>
                <th>웨이터</th>
                <th>일반회차 점수</th>
                <th>직급전 점수</th>
                <th>총점수</th>
                <th>개인 배율</th>
                <th>근태 차감</th>
                <th>계산식</th>
                <th>웨이터 급여</th>
              </tr>
            </thead>

            <tbody>
              {waiterSalarySummary.map((item) => (
                <tr key={`waiter-${item.member}`}>
                  <td>{item.member}</td>
                  <td>{item.normalScore.toLocaleString()}</td>
                  <td>{item.jobBattleScore.toLocaleString()}</td>
                  <td>{item.totalScore.toLocaleString()}</td>
                  <td>{item.rate}</td>
                  <td>{item.attendanceAdjust.toLocaleString()}원</td>
                  <td>
                    {item.totalScore.toLocaleString()} × 63 × {item.rate} -{' '}
                    {item.attendanceAdjust.toLocaleString()}
                  </td>
                  <td>{Math.round(item.salary).toLocaleString()}원</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {salaryRounds.map((round) => {
          const excludedScore = getExcludedRoundScore(round);
          const totalRevenue = Number(roundRevenues[round]) || 0;
          const adjustedRevenue = Math.max(totalRevenue - excludedScore, 0);
          const specialRound = isSpecialRound(round);

          return (
            <section key={round} className="round-salary-card">
              <div className="round-salary-head">
                <h3>
                  {round} {specialRound ? '(특별회차)' : ''}
                </h3>

                <label>
                  총매출
                  <input
                    type="number"
                    value={roundRevenues[round] || ''}
                    onChange={(e) => updateRoundRevenue(round, e.target.value)}
                    placeholder="총매출"
                  />
                </label>

                <button
                  type="button"
                  className={specialRound ? 'admin-submit is-blue' : 'admin-submit'}
                  onClick={() => toggleSpecialRound(round)}
                >
                  {specialRound ? '특별회차 ON' : '특별회차 OFF'}
                </button>

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
                      <th>기본 점수</th>
                      <th>특별기여도</th>
                      <th>최종 점수</th>
                      <th>{specialRound ? '특별 지분%' : '기본 지분%'}</th>
                      <th>콘텐츠 조정</th>
                      <th>근태 조정</th>
                      <th>예상 급여</th>
                    </tr>
                  </thead>

                  <tbody>
                    {salaryMembers.map((member) => {
                      const baseScore = getBaseRoundMemberScore(round, member);
                      const finalScore = getRoundMemberScore(round, member);
                      const salary = getSalary(round, member);
                      const memberShare = getMemberShare(round, member);

                      return (
                        <tr key={`${round}-${member}`}>
                          <td>{member}</td>

                          <td>{baseScore.toLocaleString()}</td>

                          <td>
                            <input
                              type="number"
                              value={specialContributions?.[round]?.[member] || ''}
                              onChange={(e) =>
                                updateSpecialContribution(round, member, e.target.value)
                              }
                              placeholder="점수 추가"
                            />
                          </td>

                          <td>{finalScore.toLocaleString()}</td>

                          <td>
                            {specialRound ? (
                              <input
                                type="number"
                                value={specialRoundShares?.[round]?.[member] || ''}
                                onChange={(e) =>
                                  updateSpecialRoundShare(round, member, e.target.value)
                                }
                                placeholder="특별 지분 %"
                              />
                            ) : (
                              `${memberShare}%`
                            )}
                          </td>

                          <td>
                            <input
                              type="number"
                              value={penalties?.[round]?.[member]?.content || ''}
                              onChange={(e) =>
                                updatePenalty(round, member, 'content', e.target.value)
                              }
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
                              placeholder="예: 10000"
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
      console.error(error);
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
