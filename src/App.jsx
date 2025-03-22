import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import "./App.css";
import { auth } from "./firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";


import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";

// ส่วน InputField ใช้ร่วมกัน
function InputField({ type, name, placeholder, icon, handleChange, value }) {
  return (
    <div className="input-group">
      <i className={icon}></i>
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        onChange={handleChange}
        value={value}
      />
    </div>
  );
}

// ส่วน Header
function Header() {
  return (
    <header className="header">
      <div className="logo">Logo</div>
      <input type="text" className="search-bar" placeholder="Search" />
      <button className="search-btn">🔍</button>
      <nav className="nav-links">
        <Link to="#">About Us</Link>
        <Link to="#">TH/EN</Link>
        <Link to="#">Profile</Link>
      </nav>
    </header>
  );
}

// ส่วน Category Menu
function CategoryMenu() {
  const categories = ["Beach", "Culture", "Nature", "Temple", "Lifestyle"];
  return (
    <nav className="category-menu">
      {categories.map((category) => (
        <Link key={category} to="#">
          {category}
        </Link>
      ))}
    </nav>
  );
}

// ส่วน Gallery
function Gallery() {
  const galleryItems = [
    {
      src: "/src/assets/gallery1.jpg",
      title: "Beach Paradise",
      desc: "Relax and enjoy the beautiful beach.",
    },
    {
      src: "/src/assets/gallery2.jpg",
      title: "Cultural Heritage",
      desc: "Explore the rich cultural heritage of the city.",
    },
    {
      src: "/src/assets/gallery3.jpg",
      title: "Nature Adventure",
      desc: "Discover breathtaking nature landscapes.",
    },
  ];

  return (
    <div className="gallery">
      {galleryItems.map((item, index) => (
        <div className="gallery-item" key={index}>
          <img src={item.src} alt={item.title} />
          <h3>{item.title}</h3>
          <p>{item.desc}</p>
        </div>
      ))}
    </div>
  );
}




// ส่วน Home Page
function Home() {

  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate("/"); // ถ้ายังไม่ได้ล็อกอิน ให้ไปที่หน้า login
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe(); // Cleanup listener
  }, [navigate]);

  if (loading) return <p>กำลังโหลด...</p>; // แสดงข้อความโหลดก่อน


  return (
    <div className="home">
      <Header />
      <CategoryMenu />
      <main className="main-content">
        <div className="featured-container">
          <div className="featured-image">
            <img src="/src/assets/beach.jpg" alt="Beach View" />
          </div>
          <Gallery />
        </div>
      </main>
    </div>
  );
}

// ส่วน Login
function Login_() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const email = params.get("email") || "";
    const password = params.get("password") || "";
    setFormData({ email, password });
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.email.trim() === "" || formData.password.trim() === "") {
      setErrorMessage("กรุณากรอกอีเมลและรหัสผ่าน!");
      return;
    }
    try {
      await signInWithEmailAndPassword(auth, formData.email, formData.password);
      window.location.href = "/home";
    } catch (error) {
      window.location.href = "/home";
      setErrorMessage("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
    }
  };

  return (
    <div className="auth-body">
      <div className="auth-container">
        <form className="auth-form" onSubmit={handleSubmit}>
          <h2>Login</h2>
          <p>กรุณาเข้าสู่ระบบด้วยอีเมลและรหัสผ่าน</p>

          <div class="input-group">
            <input type="email" name="email" placeholder="Email" onChange={handleChange} value={formData.email} />
          </div>

          <div class="input-group">
            <input type="password" name="password" placeholder="Password" onChange={handleChange} value={formData.password} />
          </div>

          <button type="submit" className="auth-btn">Login</button>
          {errorMessage && <p className="error-message">{errorMessage}</p>}
          <div className="extra-links">
            <Link to="/register">สมัครสมาชิก</Link>
          </div>


        </form>
      </div>
    </div>
  );
}


// ส่วน Register
function Register() {
  const [formData, setFormData] = useState({ email: "", password: "", confirmPassword: "" });
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

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
    } catch (error) {
      setErrorMessage("สมัครสมาชิกไม่สำเร็จ! ลองใหม่อีกครั้ง");
    }
  };

  return (
    <div className="auth-body">
      <div className="auth-container">
        <form className="auth-form" onSubmit={handleRegister}>
          <h2>Register</h2>
          <p>กรอกข้อมูลเพื่อสมัครสมาชิก</p>

          <div class="input-group">
            <input type="email" name="email" placeholder="Email" onChange={handleChange} value={formData.email} />
          </div>

          <div class="input-group">
            <input type="password" name="password" placeholder="Password" onChange={handleChange} value={formData.password} />
          </div>

          <div class="input-group">
            <input type="password" name="confirmPassword" placeholder="Confirm Password" onChange={handleChange} value={formData.confirmPassword} />
          </div>

          <button type="submit" className="auth-btn">สมัครสมาชิก</button>
          {errorMessage && <p className="error-message">{errorMessage}</p>}
          <div className="extra-links">
            <Link to="/">กลับไปหน้า Login</Link>
          </div>
        </form>
      </div>
    </div>
  );
}

// ส่วน App (Main Router)
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login_ />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={<Home />} />
      </Routes>
    </Router>
  );
}

export default App;