//import { BrowserRouter as Router, Routes, Route, Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { HashRouter as Router, Routes, Route, Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { FaUserCircle } from "react-icons/fa";
import axios from 'axios';
import "./App.css";

import { auth } 
  from "./firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "firebase/auth";




const postEventToFirestore = async (token, eventData, collectionName) => {
  if (!token) {
    alert("Please login first");
    return;
  }

  try {
    const firestoreData = {
      fields: {
        title: { stringValue: eventData.title },
        date: { stringValue: eventData.date },
        time: { stringValue: eventData.time },
        location: { stringValue: eventData.location },
        description: { stringValue: eventData.description }
      }
    };

    const res = await axios.post(
      `https://firestore.googleapis.com/v1/projects/local-app-4351c/databases/(default)/documents/${collectionName}`,
      firestoreData,
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      }
    );

    const firestoreID = res.data.name.split("/").pop();
    return { ...eventData, event_id: firestoreID };
  } catch (err) {
    console.error("🔥 Error posting to Firestore:", err.response?.data || err.message);
    alert("❌ ไม่สามารถบันทึกข้อมูลกิจกรรมได้");
  }
};

const patchEventToFirestore = async (token, eventData, docId, collectionName) => {
  const firestoreData = {
    fields: {
      title: { stringValue: eventData.title },
      date: { stringValue: eventData.date },
      time: { stringValue: eventData.time },
      location: { stringValue: eventData.location },
      description: { stringValue: eventData.description }
    }
  };

  await axios.patch(
    `https://firestore.googleapis.com/v1/projects/local-app-4351c/databases/(default)/documents/${collectionName}/${docId}`,
    firestoreData,
    {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    }
  );
};

const deleteEventFromFirestore = async (token, docId, collectionName) => {
  await axios.delete(
    `https://firestore.googleapis.com/v1/projects/local-app-4351c/databases/(default)/documents/${collectionName}/${docId}`,
    {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    }
  );
};


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
      ออกจากระบบ
    </a>
  );
}


// Header
function Header() {
  const [user, setUser] = useState(null);
  const logoUrl = "https://media.discordapp.net/attachments/1145732688163119195/1373647773894836234/c.png?ex=682e786e&is=682d26ee&hm=b8e952382166d8efd2f295b2530c075768b66c8c0fca885dc8b6618f29feff07&=&format=webp&quality=lossless&width=583&height=544";

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(setUser);
    return () => unsubscribe();
  }, []);

  return (
    <header className="header">
      <div className="logo">
        {user && user.photoURL ? (
          <img
            src={user.photoURL}
            alt="User Avatar"
            className="user-avatar"
          />
        ) : (
          <img
            src={logoUrl || "/assets/fallback-logo.png"}
            alt="Site Logo"
            className="site-logo"
          />
        )}
        <span className="site-name"> RAKSANA</span>
      </div>

      <nav className="nav-links">
        {user ? (
          <>
            <Link to="/profile" className="profile-link" title="โปรไฟล์ของคุณ">
              <FaUserCircle
                size={20}
                style={{ verticalAlign: "middle", marginRight: 6 }}
              />
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





// CategoryMenu
function CategoryMenu({ categories, selectedCategory, onSelectCategory }) {
  return (
    <nav className="category-menu">
      <button
        className={selectedCategory === "All" ? "active" : ""}
        onClick={() => onSelectCategory("All")}
      >
        ทั้งหมด
      
      </button>
      {categories.map((c) => (
        <button
          key={c}
          className={selectedCategory === c ? "active" : ""}
          onClick={() => onSelectCategory(c)}
        >
          {c}
        </button>
      ))}
    </nav>
  );
}

export async function getPlacesFromFirestore() {
  try {
    const url =
      "https://firestore.googleapis.com/v1/projects/local-app-4351c/databases/(default)/documents/Place";
    const res = await axios.get(url);

    const documents = res.data.documents || [];
    const placesByCategory = {};

    documents.forEach((doc) => {
      const fields = doc.fields || {};
      const id = doc.name.split("/").pop();
      const title = fields.name?.stringValue || "name";
      const description = fields.des?.stringValue || "des";
      const category = fields.type?.stringValue || "type";
      const imageUrl = fields.imge?.stringValue || "";
      const src = fields.src?.stringValue || "";

      if (!placesByCategory[category]) placesByCategory[category] = [];

      placesByCategory[category].push({
        id,
        title,
        description,
        imageUrl,
        src
      });
    });

    return placesByCategory;
  } catch (error) {
    console.error("Error fetching places from Firestore:", error);
    return {};
  }
}

function Home() {
  const [loading, setLoading] = useState(true);
  const [placesData, setPlacesData] = useState({});
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const navigate = useNavigate();
 
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate("/");
      } else {
        getPlacesFromFirestore().then((data) => {
          setPlacesData(data);
          setLoading(false);
        });
      }
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
    const exact = allPlaces.find((p) => p.title.toLowerCase() === term);
    if (exact) {
      navigate(`/detail/${exact.id}`);
    } else {
      const filtered = allPlaces.filter((p) =>
        p.title.toLowerCase().includes(term)
      );
      setSearchResults(filtered);
    }
  };
 
  const displayedPlaces =
    searchResults !== null
      ? searchResults
      : selectedCategory === "All"
      ? allPlaces
      : placesData[selectedCategory] || [];
 
  return (
    <div className="home-body">
      <Header />
      <CategoryMenu
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />
 
      <button className="custom-button2" onClick={() => navigate("/events")}>
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

        <button type="submit" className="custom-button">
          ค้นหา
        </button>

        {searchResults && searchResults.length === 0 && (
          <p style={{ color: "red", marginTop: "8px" }}>
            ไม่พบสถานที่ที่ค้นหา
          </p>
        )}
      </form>
 
      {displayedPlaces.length === 0 ? (
      <p className="no-places-message">ไม่มีสถานที่ให้แสดง</p>
    ) : (
      <div className="places-grid">
        {displayedPlaces.map((place) => (
          <div className="place-card" key={place.id}>
            {place.imageUrl ? (
              <img src={place.imageUrl} alt={place.title} />
            ) : null}
            <h3>{place.title}</h3>
            <p>{place.description}</p>
            <button onClick={() => handleViewDetails(place.id)}>
              ดูข้อมูลเพิ่มเติม
            </button>
          </div>
        ))}
      </div>
    )}
    </div>
  );
}


function Detail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [placesData, setPlacesData] = useState({});
  const [loading, setLoading] = useState(true);
  const [place, setPlace] = useState(null);

  const [reviews, setReviews] = useState([
    { user: "User1", rating: 4, comment: "บรรยากาศดีมากครับ" },
    { user: "User2", rating: 5, comment: "ประทับใจมาก" },
  ]);
  const [userRating, setUserRating] = useState(0);
  const [userComment, setUserComment] = useState(""); // ช่องใส่ข้อความ

  useEffect(() => {
    getPlacesFromFirestore()
      .then((data) => {
        setPlacesData(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!loading) {
      const allPlaces = Object.values(placesData).flat();
      const found = allPlaces.find((p) => p.id === id);
      setPlace(found || null);
    }
  }, [loading, placesData, id]);

  const handleRatingClick = (rate) => setUserRating(rate);

  const submitRating = () => {
    if (userRating === 0) {
      alert("กรุณาเลือกคะแนนก่อน");
      return;
    }
    if (userComment.trim() === "") {
      alert("กรุณาเขียนรีวิวก่อน");
      return;
    }
    const newReview = {
      user: "You",
      rating: userRating,
      comment: userComment.trim(),
    };
    setReviews([...reviews, newReview]);
    alert(`ขอบคุณสำหรับรีวิวและการให้คะแนน ${userRating} ดาว!`);
    setUserRating(0);
    setUserComment(""); // ล้างข้อความ
  };

  if (loading) return <p>กำลังโหลดข้อมูลสถานที่...</p>;
  if (!place) return <p>ไม่พบข้อมูลสถานที่</p>;

  return (
    <div className="detail-page">
      <Header />
      <button className="back-btn" onClick={() => navigate(-1)}>← กลับ</button>

      <div className="detail-main">
        <div className="detail-image">
          {place.imageUrl && <img src={place.imageUrl} alt={place.title} />}
        </div>

        <div className="detail-text">
          <h2>{place.title}</h2>
          <p><strong>รายละเอียด:</strong> {place.description}</p>
          <p><strong>ข้อมูลเพิ่มเติม:</strong> {place.src}</p>
          <p>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.title)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="location-link"
            >
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
          <h4>ให้คะแนนและเขียนรีวิว</h4>
          <div className="stars-input">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} filled={star <= userRating} onClick={() => handleRatingClick(star)} />
            ))}
          </div>
          <textarea
            placeholder="เขียนความคิดเห็นของคุณ..."
            value={userComment}
            onChange={(e) => setUserComment(e.target.value)}
            rows={4}
            style={{ width: "100%", marginTop: 10 }}
          />
          <button onClick={submitRating} className="submit-rating-btn" style={{ marginTop: 10 }}>
            ส่งรีวิว
          </button>
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

function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState({ firstName: "", lastName: "", gender: "", age: "", phone: "" });
  const [editing, setEditing] = useState(false); // เปิด/ปิดฟอร์มแก้ไข
  const [tempProfile, setTempProfile] = useState(profile); // เก็บข้อมูลชั่วคราวก่อนอัปเดต

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      setUser(currentUser);
      const initialData = { firstName: " - ", lastName: " - ", gender: " - ", age: " - ", phone: " - " };
      setProfile(initialData);
      setTempProfile(initialData);
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTempProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    setProfile(tempProfile);
    setEditing(false);
  };

  if (!user) return <p>กรุณาเข้าสู่ระบบเพื่อดูโปรไฟล์</p>;

  return (
    <div className="profile-page">
      <button className="back-btn" onClick={() => navigate(-1)}>← กลับ</button>
      <Header />
      <div className="profile-container">
        <h2>ข้อมูลโปรไฟล์</h2>
        <div className="profile-item"><strong>อีเมล:</strong> <span>{user.email}</span></div>
        <div className="profile-item"><strong>ชื่อจริง:</strong> <span>{profile.firstName}</span></div>
        <div className="profile-item"><strong>นามสกุล:</strong> <span>{profile.lastName}</span></div>
        <div className="profile-item"><strong>เพศ:</strong> <span>{profile.gender}</span></div>
        <div className="profile-item"><strong>อายุ:</strong> <span>{profile.age}</span></div>
        <div className="profile-item"><strong>เบอร์โทร:</strong> <span>{profile.phone}</span></div>
        <button onClick={() => setEditing(true)}>แก้ไขโปรไฟล์</button>
      </div>

      {editing && (
        <div className="modal">
          <div className="modal-content">
            <h3>แก้ไขข้อมูลโปรไฟล์</h3>
            <label>ชื่อจริง: <input type="text" name="firstName" value={tempProfile.firstName} onChange={handleChange} /></label>
            <label>นามสกุล: <input type="text" name="lastName" value={tempProfile.lastName} onChange={handleChange} /></label>
            <label>เพศ: <input type="text" name="gender" value={tempProfile.gender} onChange={handleChange} /></label>
            <label>อายุ: <input type="number" name="age" value={tempProfile.age} onChange={handleChange} /></label>
            <label>เบอร์โทร: <input type="text" name="phone" value={tempProfile.phone} onChange={handleChange} /></label>
            <button onClick={handleSave}>บันทึก</button>
            <button onClick={() => setEditing(false)}>ยกเลิก</button>
          </div>
        </div>
      )}
    </div>
  );
}

// Login Page
function Login_() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const logout = async () => {
      try {
        await signOut(auth);
      } catch (error) {
        console.error("Logout Error", error);
      }
    };
    logout();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const email = params.get("อีเมล") || "";
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
      navigate("/home"); // ✅ React Router navigation
    } catch {
      setErrorMessage("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
    }
  };

  return (
    <div className="auth-body">
      <div className="auth-container">
        <form className="auth-form" onSubmit={handleSubmit}>
          <h2>เข้าสู่ระบบ</h2>
          <p>กรุณาเข้าสู่ระบบด้วยอีเมลและรหัสผ่าน</p>
          <div className="input-group">
            <input type="email" name="email" placeholder="อีเมล" onChange={handleChange} value={formData.email} />
          </div>
          <div className="input-group">
            <input type="password" name="password" placeholder="รหัสผ่าน" onChange={handleChange} value={formData.password} />
          </div>
          <button type="submit" className="custom-button">เข้าสู่ระบบ</button>
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
      window.location.href = '/Project-Local-App/';
    } catch {
      setErrorMessage("สมัครสมาชิกไม่สำเร็จ! ลองใหม่อีกครั้ง");
    }
  };

  return (
    <div className="auth-body">
      <div className="auth-container">
        <form className="auth-form" onSubmit={handleRegister}>
          <h2>สมัครสมาชิก</h2>
          <p>กรอกข้อมูลเพื่อสมัครสมาชิก</p>
          <div className="input-group"><input type="email" name="email" placeholder="อีเมล" onChange={handleChange} value={formData.email} /></div>
          <div className="input-group"><input type="password" name="password" placeholder="รหัสผ่าน" onChange={handleChange} value={formData.password} /></div>
          <div className="input-group"><input type="password" name="confirmPassword" placeholder="ยืนยันรหัสผ่าน" onChange={handleChange} value={formData.confirmPassword} /></div>
          <button type="submit" className="custom-button">สมัครสมาชิก</button>
          
          {errorMessage && <p className="error-message">{errorMessage}</p>}
          <div className="extra-links"><Link to="/">กลับไปหน้า เข้าสู่ระบบ</Link></div>
        </form>
      </div>
    </div>
  );
}




function EventList() {
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [editingEvent, setEditingEvent] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [token, setToken] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        const idToken = await currentUser.getIdToken();
        setToken(idToken);
        fetchEvents(idToken); // ดึงกิจกรรม
      } else {
        setToken(null);
        navigate("/login");
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchEvents = async (idToken) => {
  try {
    const res = await axios.get(
      `https://firestore.googleapis.com/v1/projects/local-app-4351c/databases/(default)/documents/events`,
      {
        headers: { Authorization: `Bearer ${idToken}` }
      }
    );

    const parsedEvents = res.data.documents?.map(doc => {
      const fields = doc.fields || {};
      return {
        event_id: doc.name.split("/").pop(),
        title: fields.title?.stringValue || "",
        date: fields.date?.stringValue || "",
        time: fields.time?.stringValue || "",
        location: fields.location?.stringValue || "",
        description: fields.description?.stringValue || ""
      };
    }) || [];

    setEvents(parsedEvents);
  } catch (err) {
    console.error("❌ Error fetching events:", err.response?.data || err.message);
  }
};


  const handleDelete = async (id) => {
    if (window.confirm("คุณต้องการลบกิจกรรมนี้หรือไม่?")) {
      try {
        await deleteEventFromFirestore(token, id, "events");
        setEvents(events.filter(e => e.event_id !== id));
      } catch (err) {
        console.error("❌ Delete failed:", err.response?.data || err.message);
      }
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

  const handleSave = async (eventData) => {
    if (editingEvent) {
      await patchEventToFirestore(token, eventData, editingEvent.event_id, "events");
      setEvents(events.map(e => e.event_id === editingEvent.event_id ? { ...eventData, event_id: editingEvent.event_id } : e));
    } else {
      const savedEvent = await postEventToFirestore(token, eventData, "events");
      setEvents([...events, savedEvent]);
    }

    setShowForm(false);
  };

  return (
        <div className="auth-container">
          <button className="back-btn" onClick={() => navigate(-1)}>← กลับ</button>
          <div className="events-page">
              <Header />
              <h2>กิจกรรม</h2>
              <button onClick={handleCreateNew} style={{ marginBottom: 15 }}>สร้างกิจกรรมใหม่</button>
              {showForm && (
                <EventForm
                  event={editingEvent}
                  onSave={handleSave}
                  onCancel={() => setShowForm(false)}
                />
              )}
              <ul>
                {events.map(event => (
                  <li key={event.event_id} style={{ marginBottom: 15, borderBottom: "1px solid #ccc", paddingBottom: 10 }}>
                    <strong>{event.title}</strong><br />
                    วันที่: {event.date} เวลา: {event.time}<br />
                    สถานที่: {event.location}<br />
                    รายละเอียด: {event.description}<br />
                    <button onClick={() => handleEdit(event)} style={{ marginRight: 8 }}>แก้ไข</button>
                    <button onClick={() => handleDelete(event.event_id)}>ลบ</button>
                  </li>
                ))}
            </ul>
          </div>
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
