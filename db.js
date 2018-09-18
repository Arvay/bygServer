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

//修改数据
app.post('/api/updataUserInfo', (req, res) => {
    const sqlStr = 'UPDATE userInfo SET user_name = ?,user_phone = ? WHERE id = ?'
    console.log(req)
    conn.query(sqlStr,req.body, (err,results) => {
        if(err){
            res.end(JSON.stringify({msg:'错误',code:'1',err:err}));
            return;
        }
        console.log('--------------------------------');
        console.log(results);
        res.json({ code: 0, message: '修改成功', data: results })
        console.log('--------------------------------');
    })
})


// app.post('/api/updataUserInfo', function(req, res, next){
//     var param = '';
//     if (req.method == "POST") {
//         param = req.body;
//     } else{
//         param = req.query || req.params;
//     }
//     var modsqlparams = {user_name: '多大的', user_phone: '123321', id: 5};
//     console.log(modsqlparams)
//     var sql = 'UPDATE userInfo SET user_name = ?,user_phone = ? WHERE id = ?';
//
//     conn.query(sql, modsqlparams, (err, results) => {
//         if (err){
//             throw err
//         }else{
//             res.end(JSON.stringify({msg:'操作成功',code:0,data:results}));
//         }
//     })
// });


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
        res.end(JSON.stringify({msg:'请传参数page',status:'102'}));
        return;
    }
    var start = (param.page - 1) * 10;
    var sql = 'SELECT COUNT(*) FROM userInfo; SELECT * FROM userInfo limit ' + start + ',10';

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
            res.end(JSON.stringify({msg:'操作成功',code:0,totalPages:allPage,currentPage:param.page,num:allCount,data:userList}));
        }
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
