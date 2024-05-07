const express = require('express')
const router = express.Router()
const pixController = require('../controller/pix')


router.post('/cob', (req,res) => {
    pixController.gerar_cobranca(req, res) 
}) 

router.get('/qrcode/:locId', (req, res) => {
    pixController.gerar_qrcode(req, res)
})

module.exports = router