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
        item.code=gdnoText[0];
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
console.log(items);