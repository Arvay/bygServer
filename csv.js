var fs = require("fs");
var csv = require("fast-csv");
module.exports = {
    /**
     *
     * @param req:request
     * @param res:response
     * @param getTitle:获取excel的第一行名称
     * @param rows:每一行数据，用json数组表示
     * @param filezName:导出文件名
     */
    downLoad:function(req,res,getTitle,rows,fileName){
        //用于判断是否是最后一个数据信息
        var endLine = false;
        var stream = null;
        var argus = process.argv.splice(2);
        if(!argus || argus.length == 0){
            stream = fs.createWriteStream("./temp.csv");
        }else{
            stream = fs.createWriteStream(argus[0]);
        }
        stream.on("finish", function(){
            res.download('./temp.csv',fileName+'.csv',function(){
                fs.unlinkSync('./temp.csv'); //删除临时文件
            });

        });

        //生成头部
        var csvStream = csv.format({headers: true})
            .transform(getTitle);
        csvStream.pipe(stream);
        rows.forEach(function(row){
            csvStream.write(row);
        });

        //关闭写入
        csvStream.end(function(){
            console.log("end");
        });
    }
}

