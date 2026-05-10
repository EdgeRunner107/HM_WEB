function MemberGrid({ members }) {
  return (
    <div className="member-grid">
      {members.map((member) => (
        <a key={member.id} className="member-card" href={member.href} target="_blank" rel="noreferrer">
          <div className="member-card__avatar">
            <img src={member.profileImage} alt={`${member.name} 프로필`} className="member-card__avatar-image" />
          </div>
          <div className="member-card__name">{member.name}</div>
          <div className="member-card__link">채널 이동</div>
        </a>
      ))}
    </div>
  );
}

export default MemberGrid;
