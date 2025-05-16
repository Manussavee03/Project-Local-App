import { BrowserRouter as Router, Routes, Route, Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { FaUserCircle } from "react-icons/fa";
import "./App.css";
import { auth } from "./firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";

// LogoutLink
function LogoutLink() {
  const navigate = useNavigate();
  const handleLogout = async (e) => {
    e.preventDefault();
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Logout Error", error);
    }
  };
  return (
    <a href="#" onClick={handleLogout} style={{ color: "red", cursor: "pointer" }}>
      Logout
    </a>
  );
}

// Header
function Header() {
  const [user, setUser] = useState(null);
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(setUser);
    return () => unsubscribe();
  }, []);
  return (
    <header className="header">
      <div className="logo">Logo</div>
      <input type="text" className="search-bar" placeholder="Search" />
      <button className="search-btn">🔍</button>
      <nav className="nav-links">
        <Link to="#">About Us</Link>
        <Link to="#">TH/EN</Link>
        {user ? (
          <>
            <Link to="/profile" className="profile-link" title="โปรไฟล์ของคุณ">
              <FaUserCircle size={24} style={{ verticalAlign: "middle", marginRight: 6 }} />
              <span>{user.email}</span>
            </Link>
            <LogoutLink />
          </>
        ) : (
          <Link to="/">Login</Link>
        )}
      </nav>
    </header>
  );
}

// Data
const placesData = {
  Beach: [
    { id: 1, title: "วัดพระธาตุสุโทนมงคลคีรี", description: "วัดสวยงามและเป็นแหล่งท่องเที่ยวที่สำคัญของจังหวัด", imageUrl: "/src/assets/gallery2.jpg" },
    { id: 2, title: "ชายหาดบางแสน", description: "ชายหาดยอดนิยมที่เหมาะกับการพักผ่อนและเล่นน้ำทะเล", imageUrl: "/src/assets/gallery1.jpg" },
  ],
  Culture: [
    { id: 3, title: "วัดพระแก้ว", description: "สถานที่ท่องเที่ยวเชิงวัฒนธรรมที่สำคัญของกรุงเทพฯ", imageUrl: "/src/assets/gallery3.jpg" },
    { id: 4, title: "พิพิธภัณฑ์พื้นบ้าน", description: "เรียนรู้วัฒนธรรมและประวัติศาสตร์ผ่านสิ่งของโบราณ", imageUrl: "/src/assets/culture2.jpg" },
  ],
  Nature: [
    { id: 5, title: "อุทยานแห่งชาติ", description: "สัมผัสธรรมชาติและสัตว์ป่าหลากหลายชนิด", imageUrl: "/src/assets/nature1.jpg" },
  ],
  Temple: [
    { id: 6, title: "วัดทอง", description: "วัดที่มีสถาปัตยกรรมงดงามและเป็นที่เคารพนับถือ", imageUrl: "/src/assets/temple1.jpg" },
  ],
  Lifestyle: [
    { id: 7, title: "ตลาดนัดกลางคืน", description: "สนุกกับการช็อปปิ้งและลิ้มรสอาหารท้องถิ่น", imageUrl: "/src/assets/lifestyle1.jpg" },
  ],
};

// CategoryMenu
function CategoryMenu({ categories, selectedCategory, onSelectCategory }) {
  return (
    <nav className="category-menu">
      <button className={selectedCategory === "All" ? "active" : ""} onClick={() => onSelectCategory("All")}>All</button>
      {categories.map((c) => (
        <button key={c} className={selectedCategory === c ? "active" : ""} onClick={() => onSelectCategory(c)}>{c}</button>
      ))}
    </nav>
  );
}

// Home with Search & Event Button
function Home() {
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) navigate("/");
      else setLoading(false);
    });
    return () => unsubscribe();
  }, [navigate]);

  if (loading) return <p>กำลังโหลด...</p>;

  const categories = Object.keys(placesData);
  const allPlaces = Object.values(placesData).flat();

  const handleViewDetails = (id) => navigate(`/detail/${id}`);

  const handleSearchChange = (e) => setSearchTerm(e.target.value);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const term = searchTerm.trim().toLowerCase();
    if (!term) {
      setSearchResults(null);
      return;
    }
    const exact = allPlaces.find(p => p.title.toLowerCase() === term);
    if (exact) navigate(`/detail/${exact.id}`);
    else {
      const filtered = allPlaces.filter(p => p.title.toLowerCase().includes(term));
      setSearchResults(filtered);
    }
  };

  const displayedPlaces = searchResults !== null
    ? searchResults
    : selectedCategory === "All"
    ? allPlaces
    : placesData[selectedCategory];

  return (
    <div className="home">
      <Header />
      <CategoryMenu categories={categories} selectedCategory={selectedCategory} onSelectCategory={setSelectedCategory} />

      <button
        onClick={() => navigate("/events")}
        style={{ margin: "15px 20px", padding: "10px 18px", backgroundColor: "#1abc9c", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "600" }}
      >
        กิจกรรม
      </button>

      <form onSubmit={handleSearchSubmit} style={{ margin: "20px" }}>
        <input
          type="text"
          placeholder="ค้นหาสถานที่ท่องเที่ยว"
          value={searchTerm}
          onChange={handleSearchChange}
          style={{ padding: "8px 12px", width: "250px", marginRight: "10px" }}
        />
        <button
          type="submit"
          style={{ padding: "8px 16px", backgroundColor: "#1abc9c", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "600" }}
        >
          ค้นหา
        </button>
        {searchResults && searchResults.length === 0 && <p style={{ color: "red", marginTop: "8px" }}>ไม่พบสถานที่ที่ค้นหา</p>}
      </form>

      {displayedPlaces.length === 0 ? (
        <p style={{ margin: "20px" }}>ไม่มีสถานที่ให้แสดง</p>
      ) : (
        <div className="places-grid" style={{ padding: "0 20px 40px 20px" }}>
          {displayedPlaces.map((place) => (
            <div className="place-card" key={place.id}>
              <img src={place.imageUrl} alt={place.title} />
              <h3>{place.title}</h3>
              <p>{place.description}</p>
              <button onClick={() => handleViewDetails(place.id)}>ดูข้อมูลเพิ่มเติม</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Detail Page
function Detail() {
  const { id } = useParams();
  const placeId = parseInt(id, 10);
  const navigate = useNavigate();

  let place = null;
  Object.values(placesData).forEach(arr => arr.forEach(p => { if (p.id === placeId) place = p; }));
  if (!place) return <p>ไม่พบข้อมูลสถานที่</p>;

  const [reviews, setReviews] = useState([
    { user: "User1", rating: 4, comment: "บรรยากาศดีมากครับ" },
    { user: "User2", rating: 5, comment: "ประทับใจมาก" },
  ]);
  const [userRating, setUserRating] = useState(0);

  const handleRatingClick = (rate) => setUserRating(rate);
  const submitRating = () => {
    if (userRating === 0) {
      alert("กรุณาเลือกคะแนนก่อน");
      return;
    }
    setReviews([...reviews, { user: "You", rating: userRating, comment: "ให้คะแนนจากผู้ใช้" }]);
    alert(`ขอบคุณสำหรับการให้คะแนน ${userRating} ดาว!`);
    setUserRating(0);
  };

  return (
    <div className="detail-page">
      <Header />
      <button className="back-btn" onClick={() => navigate(-1)}>← กลับ</button>

      <div className="detail-main">
        <div className="detail-image">
          <img src={place.imageUrl} alt={place.title} />
        </div>

        <div className="detail-text">
          <h2>{place.title}</h2>
          <p><strong>รายละเอียด:</strong> {place.description}</p>
          <p><strong>ข้อมูลเพิ่มเติม:</strong>ยังไม่มีข้อมูลใส่</p>
          <p>
            <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.title)}`} target="_blank" rel="noopener noreferrer" className="location-link">
              ดูพิกัดสถานที่บน Google Maps
            </a>
          </p>
        </div>
      </div>

      <div className="reviews-section">
        <h3>รีวิวจากผู้ใช้</h3>
        {reviews.length === 0 ? (
          <p>ยังไม่มีรีวิว</p>
        ) : (
          <ul className="reviews-list">
            {reviews.map((rev, i) => (
              <li key={i} className="review-item">
                <strong>{rev.user}</strong> — {renderStars(rev.rating)}
                <p>{rev.comment}</p>
              </li>
            ))}
          </ul>
        )}

        <div className="user-rating">
          <h4>ให้คะแนนสถานที่นี้</h4>
          <div className="stars-input">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} filled={star <= userRating} onClick={() => handleRatingClick(star)} />
            ))}
          </div>
          <button onClick={submitRating} className="submit-rating-btn">ส่งคะแนน</button>
        </div>
      </div>
    </div>
  );
}

function renderStars(count) {
  return (
    <>
      {[...Array(5)].map((_, i) => (
        <span key={i} style={{ color: i < count ? "#f5a623" : "#ccc" }}>★</span>
      ))}
    </>
  );
}

function Star({ filled, onClick }) {
  return (
    <span
      onClick={onClick}
      style={{ cursor: "pointer", color: filled ? "#f5a623" : "#ccc", fontSize: "24px", marginRight: "5px" }}
      role="button"
      aria-label={filled ? "filled star" : "empty star"}
    >
      ★
    </span>
  );
}

// Profile Page
function Profile() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState({ firstName: "", lastName: "", gender: "", age: "", phone: "" });

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      setUser(currentUser);
      setProfile({ firstName: "สมชาย", lastName: "ใจดี", gender: "ชาย", age: "30", phone: "0812345678" });
    }
  }, []);

  if (!user) return <p>กรุณาเข้าสู่ระบบเพื่อดูโปรไฟล์</p>;

  return (
    <div className="profile-page">
      <Header />
      <div className="profile-container">
        <h2>ข้อมูลโปรไฟล์</h2>
        <div className="profile-item"><strong>อีเมล:</strong> <span>{user.email}</span></div>
        <div className="profile-item"><strong>ชื่อจริง:</strong> <span>{profile.firstName}</span></div>
        <div className="profile-item"><strong>นามสกุล:</strong> <span>{profile.lastName}</span></div>
        <div className="profile-item"><strong>เพศ:</strong> <span>{profile.gender}</span></div>
        <div className="profile-item"><strong>อายุ:</strong> <span>{profile.age}</span></div>
        <div className="profile-item"><strong>เบอร์โทร:</strong> <span>{profile.phone}</span></div>
      </div>
    </div>
  );
}

// Login Page
function Login_() {
  useEffect(() => {
    const logout = async () => {
      try { await signOut(auth); } catch (error) { console.error("Logout Error", error); }
    };
    logout();
  }, []);

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const email = params.get("email") || "";
    const password = params.get("password") || "";
    setFormData({ email, password });
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.email.trim() === "" || formData.password.trim() === "") {
      setErrorMessage("กรุณากรอกอีเมลและรหัสผ่าน!");
      return;
    }
    try {
      await signInWithEmailAndPassword(auth, formData.email, formData.password);
      window.location.href = "/home";
    } catch {
      setErrorMessage("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
    }
  };

  return (
    <div className="auth-body">
      <div className="auth-container">
        <form className="auth-form" onSubmit={handleSubmit}>
          <h2>Login</h2>
          <p>กรุณาเข้าสู่ระบบด้วยอีเมลและรหัสผ่าน</p>
          <div className="input-group"><input type="email" name="email" placeholder="Email" onChange={handleChange} value={formData.email} /></div>
          <div className="input-group"><input type="password" name="password" placeholder="Password" onChange={handleChange} value={formData.password} /></div>
          <button type="submit" className="auth-btn">Login</button>
          {errorMessage && <p className="error-message">{errorMessage}</p>}
          <div className="extra-links"><Link to="/register">สมัครสมาชิก</Link></div>
        </form>
      </div>
    </div>
  );
}

// Register Page
function Register() {
  useEffect(() => {
    const logout = async () => {
      try { await signOut(auth); } catch (error) { console.error("Logout Error", error); }
    };
    logout();
  }, []);

  const [formData, setFormData] = useState({ email: "", password: "", confirmPassword: "" });
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleRegister = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("รหัสผ่านไม่ตรงกัน!");
      return;
    }
    if (formData.email.trim() === "" || formData.password.trim() === "") {
      setErrorMessage("กรุณากรอกข้อมูลให้ครบทุกช่อง!");
      return;
    }
    try {
      await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      alert("สมัครสมาชิกสำเร็จ!");
      window.location.href = "/";
    } catch {
      setErrorMessage("สมัครสมาชิกไม่สำเร็จ! ลองใหม่อีกครั้ง");
    }
  };

  return (
    <div className="auth-body">
      <div className="auth-container">
        <form className="auth-form" onSubmit={handleRegister}>
          <h2>Register</h2>
          <p>กรอกข้อมูลเพื่อสมัครสมาชิก</p>
          <div className="input-group"><input type="email" name="email" placeholder="Email" onChange={handleChange} value={formData.email} /></div>
          <div className="input-group"><input type="password" name="password" placeholder="Password" onChange={handleChange} value={formData.password} /></div>
          <div className="input-group"><input type="password" name="confirmPassword" placeholder="Confirm Password" onChange={handleChange} value={formData.confirmPassword} /></div>
          <button type="submit" className="auth-btn">สมัครสมาชิก</button>
          {errorMessage && <p className="error-message">{errorMessage}</p>}
          <div className="extra-links"><Link to="/">กลับไปหน้า Login</Link></div>
        </form>
      </div>
    </div>
  );
}

// Event Components and sample data
const initialEvents = [
  { event_id: "e1", title: "ปั่นจักรยานชมเมือง", date: "2025-06-20", time: "08:00", location: "สวนสาธารณะกลางเมือง", description: "ร่วมกิจกรรมปั่นจักรยานเพื่อสุขภาพ" },
];

function EventList() {
  const [events, setEvents] = useState(initialEvents);
  const [editingEvent, setEditingEvent] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const navigate = useNavigate();

  const handleDelete = (id) => {
    if (window.confirm("คุณต้องการลบกิจกรรมนี้หรือไม่?")) {
      setEvents(events.filter(e => e.event_id !== id));
    }
  };

  const handleCreateNew = () => {
    setEditingEvent(null);
    setShowForm(true);
  };

  const handleEdit = (event) => {
    setEditingEvent(event);
    setShowForm(true);
  };

  const handleSave = (eventData) => {
    if (editingEvent) {
      setEvents(events.map(e => e.event_id === editingEvent.event_id ? eventData : e));
    } else {
      setEvents([...events, { ...eventData, event_id: Date.now().toString() }]);
    }
    setShowForm(false);
  };

  return (
    <div className="events-page">
      <Header />
      <h2>กิจกรรม</h2>
      <button onClick={handleCreateNew} style={{ marginBottom: 15 }}>สร้างกิจกรรมใหม่</button>
      {showForm && <EventForm event={editingEvent} onSave={handleSave} onCancel={() => setShowForm(false)} />}
      <ul>
        {events.map(event => (
          <li key={event.event_id} style={{ marginBottom: 15, borderBottom: "1px solid #ccc", paddingBottom: 10 }}>
            <strong>{event.title}</strong><br/>
            วันที่: {event.date} เวลา: {event.time}<br/>
            สถานที่: {event.location}<br/>
            รายละเอียด: {event.description}<br/>
            <button onClick={() => handleEdit(event)} style={{ marginRight: 8 }}>แก้ไข</button>
            <button onClick={() => handleDelete(event.event_id)}>ลบ</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function EventForm({ event, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    title: event?.title || "",
    date: event?.date || "",
    time: event?.time || "",
    location: event?.location || "",
    description: event?.description || "",
  });

  const handleChange = e => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = e => {
    e.preventDefault();
    if (!formData.title || !formData.date || !formData.time) {
      alert("กรุณากรอกชื่อกิจกรรม วันที่ และเวลา");
      return;
    }
    onSave({ ...formData, event_id: event?.event_id });
  };

  return (
    <form onSubmit={handleSubmit} className="event-form" style={{ marginBottom: 20, background: "#f9f9f9", padding: 15, borderRadius: 8 }}>
      <div><label>ชื่อกิจกรรม:</label><input name="title" value={formData.title} onChange={handleChange} required /></div>
      <div><label>วันที่:</label><input type="date" name="date" value={formData.date} onChange={handleChange} required /></div>
      <div><label>เวลา:</label><input type="time" name="time" value={formData.time} onChange={handleChange} required /></div>
      <div><label>สถานที่:</label><input name="location" value={formData.location} onChange={handleChange} /></div>
      <div><label>รายละเอียด:</label><textarea name="description" value={formData.description} onChange={handleChange} /></div>
      <button type="submit" style={{ marginRight: 10 }}>บันทึก</button>
      <button type="button" onClick={onCancel}>ยกเลิก</button>
    </form>
  );
}

// Main App
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login_ />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={<Home />} />
        <Route path="/detail/:id" element={<Detail />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/events" element={<EventList />} />
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </Router>
  );
}

export default App;