import React, { useState } from "react";
import "../styles/StudentInfoCard.css";
import avatar from "../assets/avitar.webp";

const StudentInfoCard = ({ student, onMarkTeamArrival }) => {
  const [markingArrival, setMarkingArrival] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState(new Set()); // stores member identifiers
  const [memberData, setMemberData] = useState(new Map()); // stores member details for non-account holders

  // Helper function to determine if this is pass holder data
  const isPassHolder = (data) => {
    return data && (data.passId || data.passType || data.amount !== undefined);
  };

  const handleMemberSelection = (memberIdentifier, member, isSelected) => {
    const newSelected = new Set(selectedMembers);
    const newMemberData = new Map(memberData);

    if (isSelected) {
      newSelected.add(memberIdentifier);
      if (!member.user) {
        // Store member data for non-account holders
        newMemberData.set(memberIdentifier, {
          name: member.name,
          email: member.email,
        });
      }
    } else {
      newSelected.delete(memberIdentifier);
      newMemberData.delete(memberIdentifier);
    }

    setSelectedMembers(newSelected);
    setMemberData(newMemberData);
  };

  const handleMarkTeamArrival = async () => {
    if (selectedMembers.size === 0) return;

    setMarkingArrival(true);
    try {
      if (onMarkTeamArrival) {
        // Separate members with accounts from members without accounts
        const membersWithAccounts = [];
        const membersWithoutAccounts = [];

        Array.from(selectedMembers).forEach((identifier) => {
          if (typeof identifier === "number") {
            // It's a user ID
            membersWithAccounts.push(identifier);
          } else {
            // It's a member without account, get their data
            const memberInfo = memberData.get(identifier);
            if (memberInfo) {
              membersWithoutAccounts.push(memberInfo);
            }
          }
        });

        await onMarkTeamArrival(membersWithAccounts, membersWithoutAccounts);
        setSelectedMembers(new Set());
        setMemberData(new Map());
      }
    } catch (error) {
      console.error("Error marking team arrival:", error);
    } finally {
      setMarkingArrival(false);
    }
  };

  if (!student) {
    return (
      <div className="student-card professional-card fade-in wide big neutral">
        <div className="student-card-header big">
          <div className="avatar-container">
            <img
              src={avatar}
              alt="Student Avatar"
              className="student-avatar big"
            />
          </div>

          <div className="student-header-info">
            <span className="student-name big">No Student Found</span>
          </div>
        </div>

        <div className="student-fields empty">
          <div className="student-row">
            <span className="student-value">Scan a valid QR code</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="student-card professional-card fade-in wide big neutral">
      {/* HEADER */}
      <div className="student-card-header big">
        <div className="avatar-container">
          <img
            src={student.image || avatar}
            alt={student.name}
            className="student-avatar big"
          />
        </div>

        <div className="student-header-info">
          <span className="student-name big">{student.name}</span>

          <div className="quick-stats">
            {isPassHolder(student) ? (
              <>
                <div className="stat-item">
                  <span className="stat-label">Type</span>
                  <span className="stat-value">Pass Holder</span>
                </div>

                <div className="stat-item">
                  <span className="stat-label">Pass Type</span>
                  <span className="stat-value">{student.passType}</span>
                </div>

                <div className="stat-item">
                  <span className="stat-label">Amount</span>
                  <span className="stat-value">₹{student.amount}</span>
                </div>
              </>
            ) : (
              <>
                <div className="stat-item">
                  <span className="stat-label">Role</span>
                  <span className="stat-value">
                    {student.role || "Student"}
                  </span>
                </div>

                <div className="stat-item">
                  <span className="stat-label">Gender</span>
                  <span className="stat-value">{student.gender || "N/A"}</span>
                </div>

                <div className="stat-item">
                  <span className="stat-label">Year</span>
                  <span className="stat-value">
                    {student.yearOfStudy || "N/A"}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* MAIN FIELDS */}
      <div className="student-main-fields">
        <div className="student-row">
          <span className="student-label">Email:</span>
          <span className="student-value">{student.email}</span>
        </div>

        {isPassHolder(student) ? (
          <>
            <div className="student-row">
              <span className="student-label">Phone:</span>
              <span className="student-value">{student.phone || "N/A"}</span>
            </div>

            <div className="student-row">
              <span className="student-label">Pass ID:</span>
              <span className="student-value">{student.passId}</span>
            </div>

            <div className="student-row">
              <span className="student-label">Payment Status:</span>
              <span className="student-value">
                {student.paymentStatus || "PENDING"}
              </span>
            </div>
          </>
        ) : (
          <>
            <div className="student-row">
              <span className="student-label">WhatsApp:</span>
              <span className="student-value">
                {student.whatsappNumber || "N/A"}
              </span>
            </div>

            <div className="student-row">
              <span className="student-label">College:</span>
              <span className="student-value">
                {student.collegeName || "N/A"}
              </span>
            </div>

            <div className="student-row">
              <span className="student-label">City:</span>
              <span className="student-value">{student.city || "N/A"}</span>
            </div>

            <div className="student-row">
              <span className="student-label">State:</span>
              <span className="student-value">{student.state || "N/A"}</span>
            </div>
          </>
        )}
      </div>

      {/* TEAM MEMBERS SECTION */}
      {student.teamsLed &&
        student.teamsLed.length > 0 &&
        student.teamsLed.some(
          (team) => team.members && team.members.length > 0
        ) && (
          <div className="info-section">
            <div className="section-title">Team Members - Mark Arrival</div>
            <div className="team-members-grid">
              {student.teamsLed
                .flatMap((team) => team.members || [])
                .filter(
                  (member) => !member.user || member.user.id !== student.id
                )
                .map((member) => (
                  <div key={member.id} className="team-member-card">
                    <div className="member-info">
                      <div className="member-name">
                        {member.user?.name || member.name}
                      </div>
                      <div className="member-details">
                        <span className="member-email">
                          {member.user?.email || member.email}
                        </span>
                        {(member.user?.contact ||
                          member.user?.whatsappNumber) && (
                          <span className="member-contact">
                            {member.user?.contact ||
                              member.user?.whatsappNumber}
                          </span>
                        )}
                        {(member.user?.college || member.user?.collegeName) && (
                          <span className="member-college">
                            {member.user?.college || member.user?.collegeName}
                          </span>
                        )}
                      </div>

                      {/* Arrival status */}
                      <div className="arrival-status">
                        {member.user ? (
                          member.user.Arrival ? (
                            <span className="status-badge arrived">
                              ✓ Arrived
                            </span>
                          ) : (
                            <span className="status-badge not-arrived">
                              Not Arrived
                            </span>
                          )
                        ) : // For non-account members, check hasArrived flag
                        member.hasArrived ? (
                          <span className="status-badge arrived">
                            ✓ Arrived (No Account)
                          </span>
                        ) : (
                          <span className="status-badge no-account">
                            Not Arrived (No Account)
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Selection checkbox - for members who haven't arrived (both account and non-account) */}
                    {((member.user && !member.user.Arrival) ||
                      (!member.user && !member.hasArrived)) && (
                      <div className="member-checkbox">
                        <input
                          type="checkbox"
                          checked={selectedMembers.has(
                            member.user
                              ? member.user.id
                              : `no-account-${member.id}`
                          )}
                          onChange={(e) =>
                            handleMemberSelection(
                              member.user
                                ? member.user.id
                                : `no-account-${member.id}`,
                              member,
                              e.target.checked
                            )
                          }
                          className="checkbox"
                        />
                      </div>
                    )}
                  </div>
                ))}
            </div>

            {/* Mark team arrival button */}
            {selectedMembers.size > 0 && (
              <div className="team-arrival-actions">
                <button
                  onClick={handleMarkTeamArrival}
                  disabled={markingArrival}
                  className={`mark-arrival-btn ${
                    markingArrival ? "marking" : ""
                  }`}
                >
                  {markingArrival
                    ? "Marking Arrival..."
                    : `Mark Arrival for ${selectedMembers.size} Member${
                        selectedMembers.size > 1 ? "s" : ""
                      }`}
                </button>
              </div>
            )}
          </div>
        )}

      {/* PASSES */}
      {student.passes?.length > 0 && (
        <div className="info-section">
          <div className="section-title">Passes</div>
          {student.passes.map((p) => (
            <div key={p.id} className="info-row">
              <span className="info-key">{p.type}</span>
              <span className="info-value">{p.paymentStatus}</span>
            </div>
          ))}
        </div>
      )}

      {/* REGISTRATIONS */}
      {student.registrations?.length > 0 && (
        <div className="info-section">
          <div className="section-title">Registrations</div>
          {student.registrations.map((r) => (
            <div key={r.id} className="info-row">
              <span className="info-key">
                {r.competition?.title ||
                  r.workshop?.title ||
                  "Team Registration"}
              </span>
              <span className="info-value">{r.paymentStatus}</span>
            </div>
          ))}
        </div>
      )}

      {/* TEAM LEADER */}
      {student.teamsLed?.length > 0 && (
        <div className="info-section">
          <div className="section-title">Teams Led</div>
          {student.teamsLed.map((t) => (
            <div key={t.id} className="info-row">
              <span className="info-key">{t.name}</span>
              <span className="info-value">
                {t.competition?.title || "Unknown Competition"}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* TEAM MEMBERSHIP */}
      {student.teamMembership?.length > 0 && (
        <div className="info-section">
          <div className="section-title">Team Memberships</div>
          {student.teamMembership.map((m) => (
            <div key={m.id} className="info-row">
              <span className="info-key">{m.team?.name}</span>
              <span className="info-value">
                {m.team?.competition?.title || "Competition"}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* PARTICIPANT UPLOADS */}
      {student.Participant_Participant_uploadedByIdToUser?.length > 0 && (
        <div className="info-section">
          <div className="section-title">Uploaded Participants</div>
          {student.Participant_Participant_uploadedByIdToUser.map((p) => (
            <div key={p.id} className="info-row">
              <span className="info-key">{p.teamName}</span>
              <span className="info-value">{p.Competition?.title}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentInfoCard;
