const { Register, Login, verifyToken, Profile, Update, Image, upload, Banner, Services, Balance, Topup, Transaction, Historys } = require("../lib/functions");
const { KeiLog } = require("../../lib/Logger");
const multer = require('multer');


module.exports = function (app) {

  app.post("/register", async (req, res) => {
    try {
      const exec = await Register(req, res)
      //console.log(exec);
      KeiLog(exec.status, exec.msg);
    } catch (error) {
      res.status(500).send(error);
    }
  });

  app.post('/login', async (req, res) => {
    try {
      const exec = await Login(req, res)
      KeiLog(exec.status, exec.msg);
    } catch (error) {
      res.status(500).send(error);
    }
  });

  app.get('/profile', verifyToken, async (req, res) => {
    try {
      const exec = await Profile(req, res)
      KeiLog(exec.status, exec.msg);
    } catch (error) {
      res.status(500).send(error);
    }
  });
  
  app.put('/profile/update', verifyToken, async (req, res) => {
    try {
      const exec = await Update(req, res)
      KeiLog(exec.status, exec.msg);
    } catch (error) {
      res.status(500).send(error);
    }
  });

  app.put('/profile/image', verifyToken, upload.single('file'), async (req, res) => {
    try {
      const exec = await Image(req, res)
      KeiLog(exec.status, exec.msg);
    } catch (error) {
      res.status(500).send(error);
    }
  });
  app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError || err.message === 'Format Image tidak sesuai') {
      KeiLog('INFO', err.message);
      res.status(400).json({ 
        status: 102, 
        message: 'Format Image tidak sesuai', 
        data: null 
      });
    }
  });

  app.get('/banner', verifyToken, async (req, res) => {
    try {
      const exec = await Banner(req, res)
      KeiLog(exec.status, exec.msg);
    } catch (error) {
      res.status(500).send(error);
    }
  });

  app.get('/services', verifyToken, async (req, res) => {
    try {
      const exec = await Services(req, res)
      KeiLog(exec.status, exec.msg);
    } catch (error) {
      res.status(500).send(error);
    }
  });

  app.get('/balance', verifyToken, async (req, res) => {
    try {
      const exec = await Balance(req, res)
      KeiLog(exec.status, exec.msg);
    } catch (error) {
      res.status(500).send(error);
    }
  });

  app.post('/topup', verifyToken, async (req, res) => {
    try {
      const exec = await Topup(req, res)
      KeiLog(exec.status, exec.msg);
    } catch (error) {
      res.status(500).send(error);
    }
  });

  app.post('/transaction', verifyToken, async (req, res) => {
    try {
      const exec = await Transaction(req, res)
      KeiLog(exec.status, exec.msg);
    } catch (error) {
      res.status(500).send(error);
    }
  });

  app.get('/transaction/history', verifyToken, async (req, res) => {
    try {
      const exec = await Historys(req, res)
      KeiLog(exec.status, exec.msg);
    } catch (error) {
      res.status(500).send(error);
    }
  });

};
