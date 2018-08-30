const express = require('express')
const app = express()
const moment = require('moment')

var cors = require('cors')
app.use(cors())

const bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({ extended: false }))

const mysql = require('mysql')
const conn = mysql.createConnection({
    host: '104.245.42.25',
    user: 'arvay',
    password: 'nehciew0518',
    database: 'byg',
    port: '55667',
    multipleStatements: true
})
// 获取表中所有数据
app.get('/api/getlist', (req, res) => {
    const sqlStr = 'select * from user '
    conn.query(sqlStr, (err, results) => {
        if (err) return res.json({ code: 1, message: '资料不存在', affextedRows: 0 })
        res.json({ code: 0, message: results, affextedRows: results.affextedRows })
    })
})

// 按条件获取
app.get('/api/getlistdetl', (req, res) => {
    const name = req.query.name
    const sqlStr = 'select * from admin where name=?'
    conn.query(sqlStr, name, (err, results) => {
        if (err) return res.json({ code: 1, message: '资料不存在', affextedRows: 0 })
        if (results.length == 0)
            return res.json({code: 1, message: '用户不存在', affextedRows: 0})
        res.json({ code: 0, data: results, affextedRows: results.affextedRows })
    })
})

// 添加数据
app.post('/api/addcard', (req, res) => {
    const user = req.body
    user.create_time = moment().format('YYYY-MM-DD HH:mm:ss')
    const sqlStr = 'insert into userInfo set ?'
    conn.query(sqlStr, user, (err, results) => {
        if (err) return res.json({ code: 1, message: '失败' + err, affectedRows: 0 })
        res.json({ code: 0, message: '恭喜成功', affectedRows: results.affectedRows })
    })
})

// 监听端口

app.listen(3000, () => {
    console.log('正在监听端口3000')
})
