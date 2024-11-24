const multer = require('multer');
const path = require('path');
const fs = require('fs');
const format = require("date-format");
const { KeiLog } = require("../../lib/Logger");
const db = require("../../db/db.js");
const config = require("../../config.js");
const validator = require('validator');
const jwt = require('jsonwebtoken');
const SECRET_KEY = config.key;  // Replace with a secure key

const getFormattedDate = (date) => {
  return format("yyyy-MM-dd", date);
};

const getFormattedDatetime = (date) => {
  return format("yyyy-MM-dd hh:mm:ss", date);
};

async function Register(req, res){
  const { email, first_name, last_name, password } = req.body;

  const [User] = await db.getUser(email);
  let results;

  if (User){
    results = {status: 'INFO', msg: `Email (${email}) sudah terdaftar`};
    res.status(400).json({
      status: 102,
      message: "Email sudah terdaftar",
      data: null
    });
  }else{
    const allowedDomains = ['gmail.com', 'yahoo.com', 'nutech-integrasi.com'];
    const domain = email.split('@')[1];
    if (!validator.isEmail(email) || !allowedDomains.includes(domain)) {
      results = {status: 'INFO', msg: `Parameter email (${email}) tidak sesuai format`};
      res.status(400).json({
        status: 102,
        message: "Parameter email tidak sesuai format",
        data: null
      });
    }else if (!password || password.length < 8) {
      results = {status: 'INFO', msg: `Password length minimal 8 karakter`};
      res.status(400).json({
        status: 102,
        message: "Password length minimal 8 karakter",
        data: null
      });
    }else{
    await db.insertUser(email, first_name, last_name, password);
    results = {status: 'SUCCESS', msg: `Registrasi berhasil silahkan login`};
    res.status(200).json({
      status: 0,
      message: "Registrasi berhasil silahkan login",
      data: null
    });
   }
  }

  return results;
}

async function Login(req, res){
  const { email, password } = req.body;
  const [Users] = await db.getUser(email);
  let results;

  if (Users){
    if (!password || password.length < 8) {
      results = {status: 'INFO', msg: `Username atau password salah`};
      res.status(401).json({
        status: 103,
        message: "Username atau password salah",
        data: null
      });
    }else{
      const user = { email };
      const token = jwt.sign({ email: user.email }, SECRET_KEY, { expiresIn: '12h' });

      await db.updateTokenUser(email, token);
      results = {status: 'SUCCESS', msg: `Login Sukses`};
      res.status(200).json({
        status: 0,
        message: "Login Sukses",
        data: { token: token }
      });
   }
  }else{
    const allowedDomains = ['gmail.com', 'yahoo.com', 'nutech-integrasi.com'];
    const domain = email.split('@')[1];
    if (!validator.isEmail(email) || !allowedDomains.includes(domain)) {
      results = {status: 'INFO', msg: `Parameter email (${email}) tidak sesuai format`};
      res.status(400).json({
        status: 102,
        message: "Parameter email tidak sesuai format",
        data: null
      });
    }else if (!password || password.length < 8) {
      results = {status: 'INFO', msg: `Username atau password salah`};
      res.status(401).json({
        status: 103,
        message: "Username atau password salah",
        data: null
      });
    }else{
      results = {status: 'INFO', msg: `Username atau password salah`};
      res.status(401).json({
        status: 103,
        message: "Username atau password salah",
        data: null
      });
    }
  }
  
  return results;
}

async function verifyToken(req, res, next){
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
    KeiLog('INFO', 'Token tidak valid atau kadaluwarsa');
    res.status(401).json({
      status: 108,
      message: 'Token tidak valid atau kadaluwarsa',
      data: null,
    });
  }else{
    jwt.verify(token, SECRET_KEY, (err, decoded) => {
      if (err) {
        KeiLog('INFO', 'Token tidak valid atau kadaluwarsa');
        res.status(401).json({
          status: 108,
          message: 'Token tidak valid atau kadaluwarsa',
          data: null,
        });
      }else{
        req.userEmail = decoded.email; 
        next();
      }
    });
  }
}

async function Profile(req, res){
  const email = req.userEmail;
  const [userProfile] = await db.getUser(email);
  let results;

  if (userProfile){
    results = {status: 'SUCCESS', msg: `Sukses`};
    res.status(200).json({
      status: 0,
      message: 'Sukses',
      data: {
        email: userProfile.email,
        first_name: userProfile.first_name,
        last_name: userProfile.last_name,
        profile_image: userProfile.profile_image,
      },
    });
  }

  return results;
}

async function Update(req, res){
  const { first_name, last_name } = req.body;
  const email = req.userEmail;
  const [userProfile] = await db.getUser(email);
  let results;

  if (userProfile) {
    if (!first_name || !last_name) {
      results = {status: 'INFO', msg: `First name dan last name harus diisi`};
      res.status(400).json({
        status: 107,
        message: 'First name dan last name harus diisi',
        data: null,
      });
    }else{
      const updatedProfile = {
        email: email,
        first_name,
        last_name,
        profile_image: userProfile.profile_image,
      };
    
      await db.updateProfile(email, first_name, last_name);
      results = {status: 'SUCCESS', msg: `Update Profile berhasil`};
      res.status(200).json({
        status: 0,
        message: 'Update Profile berhasil',
        data: updatedProfile,
      });
    }
  } 
  
  return results;
}

if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png'];
  if (!allowedTypes.includes(file.mimetype)) {
    cb(new Error('Format Image tidak sesuai'), false);
  }
  cb(null, true);
};

const upload = multer({ storage: storage, fileFilter: fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

async function Image(req, res){
  const email = req.userEmail;
  const [userProfile] = await db.getUser(email);
  let results;

  if (userProfile) {
    if (!req.file) {
      results = {status: 'INFO', msg: `Format Image tidak sesuai`};
      res.status(400).json({ 
        status: 102, 
        message: 'Format Image tidak sesuai', 
        data: null 
      });
    }else{
      const imageUrl = `https://yoururlapi.com/${req.file.path.replace('uploads/', '')}`;
      //const imageUrl = `https://yoururlapi.com/${req.file.path}`;
    
      const response = {
        status: 0,
        message: 'Update Profile Image berhasil',
        data: {
          email: email,
          first_name: userProfile.first_name,
          last_name: userProfile.last_name,
          profile_image: imageUrl,
        },
      };
      
      await db.updateProfileImage(email, imageUrl);
      results = {status: 'SUCCESS', msg: `Update Profile Image berhasil`};
      res.status(200).json(response);
    }
  }

  return results;
}

async function Banner(req, res){
  const email = req.userEmail;
  const [userProfile] = await db.getUser(email);
  const banners = await db.getBanners();
  let results;

  const datas = banners.map(obj => ({
    banner_name: obj.banner_name,
    banner_image: obj.banner_image,
    description: obj.description
  }));

  if (userProfile){
    results = {status: 'SUCCESS', msg: `Sukses`};
    res.status(200).json({
      status: 0,
      message: 'Sukses',
      data: datas,
    });
  }

  return results;
}

async function Services(req, res){
  const email = req.userEmail;
  const [userProfile] = await db.getUser(email);
  const services = await db.getServices();
  let results;

  const datas = services.map(obj => ({
    service_code: obj.service_code,
    service_name: obj.service_name,
    service_icon: obj.service_icon,
    service_tariff: parseInt(obj.service_tariff)
  }));

  if (userProfile){
    results = {status: 'SUCCESS', msg: `Sukses`};
    res.status(200).json({
      status: 0,
      message: 'Sukses',
      data: datas,
    });
  }

  return results;
}

async function Balance(req, res){
  const email = req.userEmail;
  const [userProfile] = await db.getUser(email);
  let results;

  if (userProfile){
    results = {status: 'SUCCESS', msg: `Get Balance Berhasil`};
    res.status(200).json({
      status: 0,
      message: 'Get Balance Berhasil',
      data: {
        balance: parseInt(userProfile.balance)
      },
    });
  }

  return results;
}

async function Topup(req, res){
  const email = req.userEmail;
  const { top_up_amount } = req.body;
  const [userProfile] = await db.getUser(email);
  let userBalance = parseInt(userProfile.balance || '0', 10);
  let results;

  const filePath = path.join(__dirname, 'invoice-sequence.json');
  let sequence = 1;

  if (fs.existsSync(filePath)) {
    const data = fs.readFileSync(filePath, 'utf8');
    sequence = JSON.parse(data).sequence + 1;
  }
  const date = getFormattedDate(new Date());

  const sequenceString = String(sequence).padStart(3, '0');
  const invoice = `INV${date}-${sequenceString}`;
  fs.writeFileSync(filePath, JSON.stringify({ sequence }));

  if (userProfile){
    if (typeof top_up_amount !== 'number' || top_up_amount <= 0) {
      results = {status: 'INFO', msg: `Parameter amount hanya boleh angka dan tidak boleh lebih kecil dari 0`};
      res.status(400).json({
        status: 102,
        message: 'Parameter amount hanya boleh angka dan tidak boleh lebih kecil dari 0',
        data: null
      });
    }else{
      userBalance += top_up_amount;
      await db.updateBalanceUser(email, userBalance);
      await db.insertTransaction(userProfile.id, 0, invoice, 'TOPUP', 'Top Up balance', top_up_amount);
      results = {status: 'SUCCESS', msg: `Top Up Balance berhasil`};
      res.status(200).json({
        status: 0,
        message: 'Top Up Balance berhasil',
        data: {
          balance: userBalance
        }
      });
    }
  }
  
  return results;
}

async function Transaction(req, res){
  const email = req.userEmail;
  const { service_code } = req.body;
  const [userProfile] = await db.getUser(email);
  const [service] = await db.getService(service_code);
  let results;

  if (!service) {
    results = {status: 'INFO', msg: `Service atau Layanan tidak ditemukan`};
    res.status(400).json({
      status: 102,
      message: 'Service atau Layanan tidak ditemukan',
      data: null
    });
  }else{

    const amount = parseInt(service.service_tariff || '0', 10); 
    let userBalance = parseInt(userProfile.balance || '0', 10);

    const filePath = path.join(__dirname, 'invoice-sequence.json');
    let sequence = 1;

    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      sequence = JSON.parse(data).sequence + 1;
    }
    const date = getFormattedDate(new Date());

    const sequenceString = String(sequence).padStart(3, '0');
    const invoice = `INV${date}-${sequenceString}`;
    fs.writeFileSync(filePath, JSON.stringify({ sequence }));

    if (userProfile) {
        if(amount > userBalance) {
          results = {status: 'INFO', msg: `Balance tidak mencukupi`};
          res.status(400).json({
            status: 102,
            message: 'Balance tidak mencukupi',
            data: null
          });
        }else{
          userBalance -= amount;
          await db.updateBalanceUser(email, userBalance);
          await db.insertTransaction(userProfile.id, service.id, invoice, 'PAYMENT', service.service_name, amount);
          results = {status: 'SUCCESS', msg: `Transaksi berhasil`};
          res.status(200).json({
            status: 0,
            message: 'Transaksi berhasil',
            data: {
              invoice_number: invoice,
              service_code: service.service_code,
              service_name: service.service_name,
              transaction_type: "PAYMENT",
              total_amount: amount,
              created_on: getFormattedDatetime(new Date())
            }
          });
        }
    }
  }
  
  return results;
}

async function Historys(req, res){
  const email = req.userEmail;
  const { offset = 0, limit = 3  } = req.query;
  const [userProfile] = await db.getUser(email);
  const History = await db.getHistory(offset, limit == 0 ? 0 : limit);
  let results;

  const transactions = History.map(obj => ({
    invoice_number: obj.invoice_number,
    transaction_type: obj.transaction_type,
    description: obj.description,
    total_amount: parseInt(obj.total_amount),
    created_on: obj.created_on,
  }));

  if (userProfile){
    results = {status: 'SUCCESS', msg: `Get History Berhasil`};
    res.status(200).json({
      status: 0,
      message: 'Get History Berhasil',
      data: {
        offset: parseInt(offset),
        limit: parseInt(limit),
        records: transactions,
      },
    });
  }

  return results;
}

module.exports = {
  Register,
  Login,
  verifyToken,
  Profile,
  Update,
  Image,
  upload,
  Banner,
  Services,
  Balance,
  Topup,
  Transaction,
  Historys
}