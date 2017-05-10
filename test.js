let express = require('express'),
    app = express(),
    ejs = require('ejs'),
    bodyParser = require('body-parser'),
    port = process.env.PORT || '3000',
    async = require('async');

app.set('view engine', 'html');
app.engine('.html', ejs.__express);
app.set('views', __dirname + '/views');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(__dirname))
let redis = require('redis'),
    redisClient = redis.createClient();

let MongoClient = require('mongodb').MongoClient;
let test = '';
let DB_CONN_STR = 'mongodb://localhost:27017/test';

let insertData = function(data) {
    //连接到表  
    console.log(data)
    return new Promise((reslove, reject) => {
        let collection = test.collection('rankList');
        //插入数据
        insertRedis(data)
        collection.insert(data, function(err, result) {
            if (err) {
                console.log('Error:' + err);
                return;
            }
            reslove(result)
        });
    })

}
let insertRedis = function(data) {
    console.log(data)
    let name = data.name;
    let score = data.score;
    async.waterfall([
        (cb) => {
            redisClient.llen("rankList", (err, result) => {
                if (err) console.log(err);
                if (result == 0) {
                    redisClient.lpush('rankList', JSON.stringify(data), (err, result) => {
                        if (err) console.log(err);

                    })
                } else {
                    cb(null, result)
                }
            })
        },
        (len, cb) => {
            
            redisClient.lrange("rankList", '0', '-1', (err, replies) => {
                var replace = ''
                for (var reply of replies) {   //数据从大到小排
                    if (+score > +JSON.parse(reply).score) {
                        replace = reply;   //如果提交的socre比记录大，继续比对
                    }else{
                    	console.log('break')
                    	break;    //如果比小，结束比对
                    }
                }
                if (replace) {  //如果replace存在，插入score
                    redisClient.linsert('rankList', 'after', replace, JSON.stringify(data), (err, result) => {
                        if (len >= 100) {  //如果队列已满，删除最后一项
                            redisClient.lpop('rankList', (err, result) => {
                                if (err) console.log(err);
                                return false;
                            })
                        }
                    })
                } else if (len < 100) {  //如果队列未满，插入score
                    redisClient.lpush('rankList', JSON.stringify(data), (err, result) => {
                        if (err) console.log(err);

                    })
                }
            })
        }
    ])

}

app.get('/', (req, res) => {
    res.render('index')
})
app.post('/postScore', (req, res) => {

    let name = req.body.name;
    let score = req.body.score
    insertData({ name: name, score: score }).then(() => {
        res.render('index');
    })
})
redisClient.on('ready', () => {
    console.log('redis Ok')
})
MongoClient.connect(DB_CONN_STR, function(err, db) {
    test = db;
    console.log('mongodb Ok')
});

app.listen(port, () => {
    console.log('node Ok')
})
