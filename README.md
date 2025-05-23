**คำอธิบายโครงสร้างโปรเจกต์**
```
Project-Local-App-main/
├──📄 .gitignore              #ใช้ระบุว่าไฟล์หรือโฟลเดอร์ใดไม่ควรถูก track หรือ push ขึ้น Git 
├──📄 index.html              #ไฟล์ HTML หลักของแอป (entry point ของ frontend)
├──📄 package-lock.json       #ไฟล์ที่ล็อกเวอร์ชันของ dependency ทั้งหมด 
├──📄 package.json            #ไฟล์หลักของโปรเจกต์ Node.js
├──📄 README.md               #ไฟล์อธิบายและแนะนำโปรเจกต์
├──📄 vite.config.js          #ไฟล์คอนฟิกของ Vite, เป็น build tool
├──📁 node_modules/           # เป็นที่เก็บ dependencies ที่ติดตั้งจาก npm
├──📁 public/                 # ไฟล์ assets แบบ static ที่จะถูกเสิร์ฟตรงจาก root เช่น icon, รูปภาพ
└──📁 src/                    # โฟลเดอร์หลักของซอร์สโค้ด
    ├──📁 assets/             # ไฟล์ภาพและสื่อที่ใช้ในแอป เช่น logo, banner
    ├──📁 components/         # React components เช่น Navbar, Sidebar, Loader ฯลฯ
    ├──📁 constants/          # ค่าคงที่ต่าง ๆ ที่ใช้ทั่วทั้งโปรเจกต์ เช่น สีหรือชื่อ path
    ├──📁 firebase/           # การตั้งค่าเชื่อมต่อกับ Firebase
    ├──📁 pages/              # หน้าแต่ละหน้าของเว็บ เช่น Dashboard, Login, Register
    ├──📁 styles/             # ไฟล์ CSS หรือ SCSS (ถ้ามี)
    ├──📁 map/                # โฟลเดอร์เกี่ยวกับแผนที่
    ├──📄 App.jsx             # Entry component หลักของ React app
    ├──📄 App.css             # สไตล์หลักของคอมโพเนนต์ App
    ├──📄 main.jsx            # จุดเริ่มต้นของการ render React เข้า DOM
    ├──📄 firebase.js         # การตั้งค่า Firebase (เช่น การเชื่อมต่อ database หรือ auth
    └──📄 index.css           # ไฟล์ CSS หลักของโปรเจกต์*
```


**Deploy**
- https://manussavee03.github.io/Project-Local-App/


**สิ่งที่ยังทำไม่ได้ พร้อมแนวคิดว่าจะพัฒนาต่อ**
- ปรับหน้า UI โดยพัฒนาให้ใช้งานง่ายมากขึ้นเช่นการปรับขนาดปุ่มสำหรับกดต่างๆ
- เพิ่มระบบ รีเซ็ตรหัสผ่าน  พัฒนาเพื่อความสะดวกสบายของผู้ใช้งาน
- ดำเนินการกดค้นหาสถานที่ในแผนที่ยังไม่ได้
- หน้าhomeยังทำให้แก้ไขอะไรได้ไม่มาก


**ปัญหา docker-compose**
- ไม่สามารถอัพไฟล์ docker-compose.yml แล้วรันระบบได้


