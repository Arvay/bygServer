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
    var modsqlparams = [];
    var key = ''
    if (req.query.isDel) {
        key = 'is_del'
        modsqlparams = [req.query.isDel,req.query.id];
    }
    if (req.query.status) {
        key = 'status'
        modsqlparams = [req.query.status,req.query.id];
    }
    const sqlStr = 'UPDATE userInfo SET ' + key + ' = ? WHERE id = ?'
    conn.query(sqlStr,modsqlparams, (err,results) => {
        if(err){
            res.json({ code: 0, message: '错误', err: err})
            return;
        }
        res.json({ code: 0, message: '修改成功', data: results })
    })
})

// 按条件获取
app.get('/api/getUserInfo', (req, res) => {
    const name = req.query.id
    const sqlStr = 'select * from userInfo where id=?'
    conn.query(sqlStr, name, (err, results) => {
        console.log(results)
        for (val of results) {
            if (val.seat) {
                val.seat = JSON.parse(val.seat)
            }
            if (val.start_time) {
                val.start_time = JSON.parse(val.start_time)
            }
            if (val.train_type) {
                val.train_type = JSON.parse(val.train_type)
            }
            if (val.user_list) {
                val.user_list = JSON.parse(val.user_list)
            }
        }
        if (err) return res.json({ code: 1, message: '资料不存在', affextedRows: 0 })
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


    let sql1 = ' FROM userInfo where is_del=' + isDel + ''

    if (param.user_phone != '' && param.user_phone != null && param.user_phone != undefined) {
        let userPhone = parseInt(param.user_phone)
        sql1 = ' FROM userInfo where is_del=' + isDel + ' and user_phone like "' + userPhone + '%"'
    }

    if (param.status != '' && param.status != null && param.status != undefined) {
        sql1 = ' FROM userInfo where is_del=' + isDel + ' and status=' + param.status + ''
    }

    var sql = 'SELECT COUNT(*) ' + sql1 + '; SELECT *' + sql1 + ' limit ' + start + ',10';

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
                if (val.seat) {
                    val.seat = JSON.parse(val.seat)
                }
                if (val.start_time) {
                    val.start_time = JSON.parse(val.start_time)
                }
                if (val.train_type) {
                    val.train_type = JSON.parse(val.train_type)
                }
                if (val.user_list) {
                    val.user_list = JSON.parse(val.user_list)
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
