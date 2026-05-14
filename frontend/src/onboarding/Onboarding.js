import React, { useState, useContext } from "react";
import api from "../utils/api";
import "./Onboarding.css";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function Onboarding() {
  const nav = useNavigate();
  const { setUser } = useContext(AuthContext);
  const [step, setStep] = useState(1);

  const [personal, setPersonal] = useState({});
  const [members, setMembers] = useState([]);
  const [goals, setGoals] = useState({});
  const [savings, setSavings] = useState({});

  const next = () => setStep(step + 1);

  const saveAll = async () => {
    try {
      await api.post("/api/family/onboarding", {
        personal,
        members,
        goals,
        savings,
      });

      const me = await api.get("/api/auth/me");
      setUser(me.data.user);

      nav("/dashboard");
    } catch (err) {
      alert("Error saving onboarding");
    }
  };

  return (
    <div className="ob-container">
      <h2 className="ob-title">Family Setup ({step}/4)</h2>

      {/* ---------------- STEP 1 ---------------- */}
      {step === 1 && (
        <div className="ob-card">
          <h3>Personal Details</h3>

          <input
            placeholder="Your Age"
            onChange={(e) =>
              setPersonal({ ...personal, age: e.target.value })
            }
          />

          <input
            placeholder="Monthly Income (₹)"
            onChange={(e) =>
              setPersonal({ ...personal, income: e.target.value })
            }
          />

          <input
            placeholder="Your Role (Father, Mother, etc.)"
            onChange={(e) =>
              setPersonal({ ...personal, role: e.target.value })
            }
          />

          <button className="ob-btn" onClick={next}>
            Next
          </button>
        </div>
      )}

      {/* ---------------- STEP 2 ---------------- */}
      {step === 2 && (
        <div className="ob-card">
          <h3>Family Members</h3>

          <MemberAdder members={members} setMembers={setMembers} />

          <button className="ob-btn" onClick={next}>
            Next
          </button>
        </div>
      )}

      {/* ---------------- STEP 3 ---------------- */}
      {step === 3 && (
        <div className="ob-card">
          <h3>Future Goals</h3>

          <input
            placeholder="Education Fund (₹)"
            onChange={(e) =>
              setGoals({ ...goals, education: e.target.value })
            }
          />
          <input
            placeholder="Wedding Fund (₹)"
            onChange={(e) =>
              setGoals({ ...goals, wedding: e.target.value })
            }
          />
          <input
            placeholder="Home Purchase (₹)"
            onChange={(e) => setGoals({ ...goals, home: e.target.value })}
          />

          <button className="ob-btn" onClick={next}>
            Next
          </button>
        </div>
      )}

      {/* ---------------- STEP 4 ---------------- */}
      {step === 4 && (
        <div className="ob-card">
          <h3>Savings & Risk</h3>

          <input
            placeholder="Monthly Savings (₹)"
            onChange={(e) =>
              setSavings({ ...savings, save: e.target.value })
            }
          />

          <select
            onChange={(e) =>
              setSavings({ ...savings, risk: e.target.value })
            }
          >
            <option>Select Risk Level</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>

          <button className="ob-btn" onClick={saveAll}>
            Finish
          </button>
        </div>
      )}
    </div>
  );
}

/* ------------------------- MEMBER ADDER ---------------------------- */

function MemberAdder({ members, setMembers }) {
  const [temp, setTemp] = useState({
    name: "",
    age: "",
    income: "",
    role: "",
    parent: "",
  });

  const relations = [
    "Father",
    "Mother",
    "Son",
    "Daughter",
    "Wife",
    "Husband",
    "Brother",
    "Sister",
    "Grandfather",
    "Grandmother",
    "Uncle",
    "Aunt",
  ];

  const add = () => {
    if (!temp.name || !temp.role)
      return alert("Enter name and relationship");

    setMembers([...members, temp]);
    setTemp({ name: "", age: "", income: "", role: "", parent: "" });
  };

  return (
    <div>
      <input
        placeholder="Member Name"
        value={temp.name}
        onChange={(e) => setTemp({ ...temp, name: e.target.value })}
      />

      <input
        placeholder="Age"
        value={temp.age}
        onChange={(e) => setTemp({ ...temp, age: e.target.value })}
      />

      <input
        placeholder="Income (optional)"
        value={temp.income}
        onChange={(e) => setTemp({ ...temp, income: e.target.value })}
      />

      {/* Relationship selection */}
      <select
        value={temp.role}
        onChange={(e) => setTemp({ ...temp, role: e.target.value })}
      >
        <option value="">Select Relationship</option>
        {relations.map((r, i) => (
          <option key={i} value={r}>
            {r}
          </option>
        ))}
      </select>

      {/* Select parent from existing members */}
      <select
        value={temp.parent}
        onChange={(e) => setTemp({ ...temp, parent: e.target.value })}
      >
        <option value="">Select Parent (optional)</option>
        {members.map((m, i) => (
          <option key={i} value={m.name}>
            {m.name}
          </option>
        ))}
      </select>

      <button className="ob-btn-sm" onClick={add}>
        Add Member
      </button>

      {/* Live tree */}
      <FamilyTreePreview members={members} />
    </div>
  );
}

/* --------------------- LIVE TREE PREVIEW ---------------------- */

function FamilyTreePreview({ members }) {
  if (!members.length)
    return <p className="tree-empty">No members added yet.</p>;

  const roots = members.filter((m) => !m.parent);

  return (
    <div className="tree-preview">
      {roots.map((root, idx) => (
        <div key={idx} className="tree-node">
          <strong>
            {root.name} ({root.role})
          </strong>
          <TreeChildren parent={root.name} members={members} />
        </div>
      ))}
    </div>
  );
}

function TreeChildren({ parent, members }) {
  const kids = members.filter((m) => m.parent === parent);

  if (!kids.length) return null;

  return (
    <ul>
      {kids.map((child, idx) => (
        <li key={idx}>
          <span>
            {child.name} ({child.role})
          </span>
          <TreeChildren parent={child.name} members={members} />
        </li>
      ))}
    </ul>
  );
}
