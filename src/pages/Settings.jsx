import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useSettings } from "../context/SettingsContext";
import { loadJson } from "../utils/storage";
import { useGlobalSave } from "../hooks/useGlobalSave";
import "../styles/pages.css";

function Settings() {
  const { user } = useAuth();
  const { settings, updateSettings } = useSettings();

  const [profile, setProfile] = useState(() =>
    loadJson("conpro:settings:profile", {
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      company: user?.company || "",
      role: user?.role || "",
    })
  );
  const [profileSaved, setProfileSaved] = useState(false);

  const [notifications, setNotifications] = useState(() =>
    loadJson("conpro:settings:notifications", {
      emailAlerts: true,
      taskReminders: true,
      budgetWarnings: true,
      safetyAlerts: true,
      weeklyReport: false,
      dailyDigest: false,
    })
  );
  const [notifSaved, setNotifSaved] = useState(false);

  const [activeSection, setActiveSection] = useState("profile");

  useGlobalSave("conpro:settings:profile", profile);
  useGlobalSave("conpro:settings:notifications", notifications);

  function handleProfileChange(e) {
    setProfile({ ...profile, [e.target.name]: e.target.value });
    setProfileSaved(false);
  }

  function handleProfileSave(e) {
    e.preventDefault();
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 3000);
  }

  function handleToggle(key) {
    setNotifications({ ...notifications, [key]: !notifications[key] });
    setNotifSaved(false);
  }

  function handleNotifSave() {
    setNotifSaved(true);
    setTimeout(() => setNotifSaved(false), 3000);
  }

  function handleAppearanceChange(e) {
    updateSettings({ [e.target.name]: e.target.value });
  }

  const sections = [
    { id: "profile", label: "Profile", icon: "\u{1F464}" },
    { id: "notifications", label: "Notifications", icon: "\u{1F514}" },
    { id: "appearance", label: "Appearance", icon: "\u{1F3A8}" },
    { id: "security", label: "Security", icon: "\u{1F512}" },
  ];

  return (
    <div>
      <div className="page-header">
        <h1>Settings</h1>
        <p>Configure your account and application preferences.</p>
      </div>

      <div className="settings-layout">
        <div className="settings-tabs">
          {sections.map((s) => (
            <button
              key={s.id}
              className={`settings-tab ${activeSection === s.id ? "active" : ""}`}
              onClick={() => setActiveSection(s.id)}
            >
              <span className="settings-tab-icon">{s.icon}</span>
              {s.label}
            </button>
          ))}
        </div>

        <div className="settings-panel">
          {activeSection === "profile" && (
            <div className="card">
              <div className="card-header"><h2>Profile Information</h2></div>
              <div className="card-body">
                <form className="modal-form" onSubmit={handleProfileSave}>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="name">Full Name</label>
                      <input id="name" name="name" type="text" value={profile.name} onChange={handleProfileChange} />
                    </div>
                    <div className="form-group">
                      <label htmlFor="email">Email</label>
                      <input id="email" name="email" type="email" value={profile.email} onChange={handleProfileChange} />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="phone">Phone</label>
                      <input id="phone" name="phone" type="tel" placeholder="+977-9800000000" value={profile.phone} onChange={handleProfileChange} />
                    </div>
                    <div className="form-group">
                      <label htmlFor="company">Company</label>
                      <input id="company" name="company" type="text" placeholder="Company name" value={profile.company} onChange={handleProfileChange} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="role">Role</label>
                    <select id="role" name="role" value={profile.role} onChange={handleProfileChange}>
                      <option value="Project Manager">Project Manager</option>
                      <option value="Site Engineer">Site Engineer</option>
                      <option value="Contractor">Contractor</option>
                      <option value="Client">Client</option>
                      <option value="Trial User">Trial User</option>
                    </select>
                  </div>
                  <div className="modal-actions">
                    {profileSaved && <span className="settings-saved">{"\u2705"} Saved</span>}
                    <button type="submit" className="btn btn-primary">Save Profile</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {activeSection === "notifications" && (
            <div className="card">
              <div className="card-header"><h2>Notification Preferences</h2></div>
              <div className="card-body">
                <div className="settings-toggle-list">
                  {[
                    { key: "emailAlerts", label: "Email Alerts", desc: "Receive email when tasks are assigned or updated" },
                    { key: "taskReminders", label: "Task Reminders", desc: "Get reminders for upcoming deadlines" },
                    { key: "budgetWarnings", label: "Budget Warnings", desc: "Alert when expenses exceed planned budget" },
                    { key: "safetyAlerts", label: "Safety Alerts", desc: "Immediate notification for safety incidents" },
                    { key: "weeklyReport", label: "Weekly Summary Report", desc: "Receive a weekly email summary every Monday" },
                    { key: "dailyDigest", label: "Daily Digest", desc: "Daily email with all activity from the day" },
                  ].map((item) => (
                    <div className="settings-toggle-row" key={item.key}>
                      <div>
                        <div className="settings-toggle-label">{item.label}</div>
                        <div className="settings-toggle-desc">{item.desc}</div>
                      </div>
                      <button
                        className={`settings-switch ${notifications[item.key] ? "on" : ""}`}
                        onClick={() => handleToggle(item.key)}
                        type="button"
                        aria-label={`Toggle ${item.label}`}
                      >
                        <span className="settings-switch-knob" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="modal-actions" style={{ marginTop: 20 }}>
                  {notifSaved && <span className="settings-saved">{"\u2705"} Saved</span>}
                  <button className="btn btn-primary" onClick={handleNotifSave}>Save Preferences</button>
                </div>
              </div>
            </div>
          )}

          {activeSection === "appearance" && (
            <div className="card">
              <div className="card-header"><h2>Appearance & Regional</h2></div>
              <div className="card-body">
                <form className="modal-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="language">Language</label>
                      <select id="language" name="language" value={settings.language} onChange={handleAppearanceChange}>
                        <option>English</option>
                        <option>Nepali (\u0928\u0947\u092A\u093E\u0932\u0940)</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor="dateFormat">Date Format</label>
                      <select id="dateFormat" name="dateFormat" value={settings.dateFormat} onChange={handleAppearanceChange}>
                        <option>YYYY-MM-DD</option>
                        <option>DD/MM/YYYY</option>
                        <option>MM/DD/YYYY</option>
                        <option>BS (बि.सं. YYYY-MM-DD)</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="currency">Currency</label>
                      <select id="currency" name="currency" value={settings.currency} onChange={handleAppearanceChange}>
                        <option>NPR (\u0930\u0942)</option>
                        <option>USD ($)</option>
                        <option>INR (\u20B9)</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor="timezone">Timezone</label>
                      <select id="timezone" name="timezone" value={settings.timezone} onChange={handleAppearanceChange}>
                        <option>Asia/Kathmandu (UTC+5:45)</option>
                        <option>Asia/Kolkata (UTC+5:30)</option>
                        <option>UTC (UTC+0:00)</option>
                      </select>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          )}

          {activeSection === "security" && (
            <div className="card">
              <div className="card-header"><h2>Security</h2></div>
              <div className="card-body">
                <form className="modal-form" onSubmit={(e) => { e.preventDefault(); alert("Password change functionality requires backend integration."); }}>
                  <div className="form-group">
                    <label htmlFor="currentPassword">Current Password</label>
                    <input id="currentPassword" type="password" placeholder="Enter current password" />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="newPassword">New Password</label>
                      <input id="newPassword" type="password" placeholder="Min 6 characters" />
                    </div>
                    <div className="form-group">
                      <label htmlFor="confirmNew">Confirm New Password</label>
                      <input id="confirmNew" type="password" placeholder="Re-enter new password" />
                    </div>
                  </div>
                  <div className="modal-actions">
                    <button type="submit" className="btn btn-primary">Change Password</button>
                  </div>
                </form>

                <div className="settings-danger-zone">
                  <h3>Danger Zone</h3>
                  <p>Permanently delete your account and all associated data.</p>
                  <button className="btn btn-danger" onClick={() => alert("Account deletion requires backend integration.")}>
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Settings;
