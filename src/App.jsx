import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';


import { useState,useEffect } from 'react'


function InputField({ type, name, placeholder, icon, handleChange, value }) {
  return (
    <div class="input-group">
      <i class={icon}></i>
      <input type={type} name={name} placeholder={placeholder} onChange={handleChange} value={value} />
    </div>
  );
}


function Login_() {

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const email = params.get("email") || "";
    const password = params.get("password") || "";
    
    console.log("Extracted Params:", { email, password }); // ตรวจสอบค่าที่ดึงมาได้
  
    setFormData({ email, password });
  }, []);
  

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (formData.email.trim() === "" || formData.password.trim() === "") {
      setErrorMessage("กรุณากรอกอีเมลและรหัสผ่าน!");
      return;
    }
    
    window.location.href = "home.html";
  };

  return (
      <body class="auth-body">
        <div class="auth-container">
          <form class="auth-form" onSubmit={handleSubmit}>
            <h2>Login</h2>
            <p>กรุณาเข้าสู่ระบบด้วยอีเมลและรหัสผ่าน</p>

            <InputField type="email" name="email" placeholder="Email" icon="fas fa-envelope" handleChange={handleChange} value={formData.email} />
            <InputField type="password" name="password" placeholder="Password" icon="fas fa-lock" handleChange={handleChange} value={formData.password} />

            <button type="submit" class="auth-btn">Login</button>
            {errorMessage && <p class="error-message">{errorMessage}</p>}

            <div class="extra-links">
              <a href="#">ลืมรหัสผ่าน?</a>
              <a href="register.html">สมัครสมาชิก</a>
            </div>
              
          </form>
        </div>
      </body>
  );
}
function App() {

  return (
      <Login_ />
  );
}

export default App
