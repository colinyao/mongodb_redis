let express=require('express'),
    app=express(),
    ejs=require('ejs'),
    port=process.env.PORT || '3000',
    async=require('async');

app.set('view engine','html');
app.engine('.html', ejs.__express);
app.set('views', __dirname+'/views');

let redis=require('redis'),
    redisClient=redis.createClient();

let MongoClient = require('mongodb').MongoClient;
let test='';
let DB_CONN_STR = 'mongodb://localhost:27017/test';    

let insertData = function(callback) {  
    //连接到表  
    let collection = test.collection('rankList');
    //插入数据
    let data = [{"name":'wilson001',"score":21}];
    collection.insert(data, function(err, result) { 
        if(err)
        {
            console.log('Error:'+ err);
            return;
        }     
        if(callback)callback(result);
    });
}

app.get('/',(req,res)=>{
	res.render('index')
})
app.post('/postScore',(req,res)=>{
	let name=req.params.name;
	let score=req.params.score
	insertData()
	res.render('index');
})
redisClient.on('ready',()=>{
   console.log('redis Ok')
})
MongoClient.connect(DB_CONN_STR, function(err, db) {
	test=db;
	console.log('mongodb Ok')
});

app.listen(port,()=>{
	console.log('node Ok')
})
