const express = require('express')
const app = express()
const moment = require('moment')

var cors = require('cors')
app.use(cors())


const bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
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
    const sqlStr = 'select * from userInfo '
    conn.query(sqlStr, (err, results) => {
        if (err) return res.json({ code: 1, message: '资料不存在', affextedRows: 0 })
        res.json({ code: 0, data: results, affextedRows: results.affextedRows })
    })
})

//修改数据
app.post('/api/updataUserInfo', (req, res) => {
    const sqlStr = 'UPDATE userInfo SET is_del = ? WHERE id = ?'
    var modsqlparams = [req.query.isDel,req.query.id];
    conn.query(sqlStr,modsqlparams, (err,results) => {
        if(err){
            res.json({ code: 0, message: '错误', err: err})
            return;
        }
        res.json({ code: 0, message: '修改成功', data: results })
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

app.get('/api/getlistdetl20', function(req, res, next){
    res.writeHead(200,{'Content-Type':'text/html;charset=utf-8'});//设置response编码为utf-8
    var param = '';
    if (req.method == "POST") {
        param = req.body;
    } else{
        param = req.query || req.params;
    }
    if (param.page == '' || param.page == null || param.page == undefined) {
        res.end(JSON.stringify({msg:'请传参数page',status:'102'}));
        return;
    }
    var start = (param.page - 1) * 10;
    var isDel = parseInt(param.isDel)
    console.log(param)
    var sql = 'SELECT COUNT(*) FROM userInfo where is_del=' + isDel + '; SELECT * FROM userInfo where is_del=' + isDel + ' limit ' + start + ',10';

    conn.query(sql, (err, results) => {
        if (err){
            throw err
        }else{
            // 计算总页数
            var allCount = results[0][0]['COUNT(*)'];
            var allPage = parseInt(allCount)/10;
            var pageStr = allPage.toString();
            // 不能被整除
            if (pageStr.indexOf('.')>0) {
                allPage = parseInt(pageStr.split('.')[0]) + 1;
            }
            var userList = results[1];
            for (val of userList) {
                if (index.seat) {
                    index.seat = JSON.parse(index.seat)
                }
                if (index.start_time) {
                    index.start_time = JSON.parse(index.start_time)
                }
                if (index.train_type) {
                    index.train_type = JSON.parse(index.train_type)
                }
                if (index.user_list) {
                    index.user_list = JSON.parse(index.user_list)
                }
            }
            res.end(JSON.stringify({msg:'操作成功！',code:0,totalPages:allPage,currentPage:param.page,num:allCount,data:userList}));
        }
    })
});

// 添加数据
app.post('/api/addcard', (req, res) => {
    const user = req.body
    user.seat = JSON.stringify(user.seat)
    user.start_time = JSON.stringify(user.start_time)
    user.train_type = JSON.stringify(user.train_type)
    user.user_list = JSON.stringify(user.user_list)
    console.log(req.body)
    console.log(user)
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
