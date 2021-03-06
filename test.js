const excelToJson = require('convert-excel-to-json');

const result = excelToJson({
    sourceFile: 'nike.xlsx'
});

const saleNoReg = /\d{21}/;
const gdnoReg = /\w{6}-\w{3}/;

// console.log(result.Sheet1);
let items=[];
let workdate;
for (let item of result.Sheet1) {
    let sheet={};
    if (item.A && saleNoReg.test(item.A)) {
        let matches = saleNoReg.exec(item.A);
        workdate=matches[0].substr(0,8);
    }
    if (item.G && gdnoReg.test(item.G)) {
        let gdnoText = gdnoReg.exec(item.G);
        sheet.code=gdnoText[0];
        sheet.workdate=workdate;
        sheet.saler=item.F;
        sheet.barNo=item.H;
        sheet.qty=item.J;
        sheet.tagPrice=item.K;
        sheet.salePrice=item.L;
        sheet.profit=item.M;
        items.push(sheet);
    }
}
//按日期排序
items.sort(function(value1,value2){
    if (value1.workdate < value2.workdate){
        return -1;
    }else{
        return 1;
    }
});
console.log(items);
console.log(items[0].workdate);
console.log(items[items.length - 1].workdate);

sql=`INSERT INTO \`saleItems\` (
    \`workdate\`, \`code\`, \`barNo\`, 
    \`saler\`, \`qty\`, \`tagPrice\`, 
    \`salePrice\`, \`profit\`) 
    VALUES ('1', '1', '1', '1', '1', '1', '1', '1')`;