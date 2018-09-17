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
    const sqlStr = 'select * from userInfo '
    conn.query(sqlStr, (err, results) => {
        if (err) return res.json({ code: 1, message: '资料不存在', affextedRows: 0 })
        res.json({ code: 0, data: results, affextedRows: results.affextedRows })
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
    var param = '';
    if (req.method == "POST") {
        param = req.body;
    } else{
        param = req.query || req.params;
    }
    if (param.page == '' || param.page == null || param.page == undefined) {
        res.end(JSON.stringify({msg:'请传入参数page',status:'102'}));
        return;
    }
    var start = (param.page - 1) * 20;
    var sql = 'SELECT COUNT(*) FROM record; SELECT * FROM record limit ' + start + ',20';
    pool.getConnection(function(err, connection) {
        if(err) throw err;
        connection.query(sql,function (err, results) {
            connection.release();
            if (err){
                throw err
            }else{
                // 计算总页数
                var allCount = results[0][0]['COUNT(*)'];
                var allPage = parseInt(allCount)/20;
                var pageStr = allPage.toString();
                // 不能被整除
                if (pageStr.indexOf('.')>0) {
                    allPage = parseInt(pageStr.split('.')[0]) + 1;
                }
                var userList = results[1];
                res.end(JSON.stringify({msg:'操作成功',status:'100',totalPages:allPage,currentPage:param.page,data:userList}));
            }
        })
    })
});

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
