let request = require("superagent");
let fs = require("fs");
//require('superagent-proxy')(request);
//let proxy = process.env.http_proxy || 'http://200.53.2.12:80';

class queryList { 
    constructor() {
        this.listUrl = "http://retail.belle.net.cn/pos/common_item_info/query/list";
        this.listBarUrl = "http://retail.belle.net.cn/pos/item_sku/query/item_no";
        this.imgUrl = "http://pic.belle.net.cn/2017/MDM/NK/";
        this.options = {
            "Host": "retail.belle.net.cn",
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.12; rv:53.0) Gecko/20100101 Firefox/53.0",
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            "Referer": "http://retail.belle.net.cn/pos/common_item_info/list",
        };
    }

    list(gdno) {
        return new Promise((resolve, reject) => {
            let cookies = fs.readFileSync("cookie.txt", "utf8").split(",");

            let formData = {
                "itemCodeSearch": gdno,
                "page": "1",
                "rows": "10",
                "pageNumber": "1",
                "pageSize": "10",
                "pageIndex": "0",
                "orderby": "asc",
            }

            let queryData = {};
            request.post(this.listUrl)
                .set(this.options)
                .set("Cookie", cookies)
                .field(formData)
                .end((err, res) => {
                    if (err) {
                        reject(err);
                    }
                    if (res.body.total < 1) {
                        resolve(false);
                    } else {
                        queryData = {
                            itemNo: res.body.rows[0].itemNo,
                            code: res.body.rows[0].code, //货号
                            colorName: res.body.rows[0].colorName,//颜色
                            name: res.body.rows[0].name,//品名
                            genderName: res.body.rows[0].genderName,//性别
                            sizeKind: res.body.rows[0].sizeKind,//尺码组
                            tagPrice: res.body.rows[0].tagPrice,//牌价
                            categoryName: res.body.rows[0].categoryName,//类别
                            purchaseSeasonName: res.body.rows[0].purchaseSeasonName,//季节
                            yearsName: res.body.rows[0].yearsName,
                        }
                        resolve(queryData);
                    }
                });
        })

    }

    listBar(item) {
        //
        return new Promise((resolve, reject) => {
            let cookies = fs.readFileSync("cookie.txt", "utf8").split(",");
            let fromData = {
                itemNo: item.itemNo,
                code: item.code,
                colorName: item.colorName,
                orderby: "asc"
            }

            request.get(this.listBarUrl)
                .query(fromData)
                .set(this.options)
                .set("Cookie", cookies)
                .end((err, res) => {
                    if (err) {
                        reject(err);
                    }
                    resolve(res.body.rows);
                });
        });
    }

}

exports = module.exports = queryList;