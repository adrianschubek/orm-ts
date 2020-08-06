const { Model, Mapper, QueryBuilder, MySqlDriver } = require("../dist");

const main = (async () => {

    const driver = new MySqlDriver({
        host: "localhost",
        user: "root",
        password: "",
        database: "test"
    });
    await driver.connect();

    QueryBuilder.useDriver(driver);

    let builder = QueryBuilder
        .from("books")
        .where({ name: 6 });

    console.log(">> " + builder.sql());

    // let x = await builder.get();
    // x.forEach(value => console.log(Object.assign({}, value)));

    await driver.disconnect();

})();
//
// class User {
//     constructor(name) {
//         this.name = name
//     }
// }
//
// class UserMapper extends Repository {
//
// }
//
// let con = new MySqlConnection({
//     host: "localhost",
//     user: "root",
//     password: "",
//     database: "test"
// })
//
// Model.connection(con)
//
// class Book extends Model {
//
// }
//
// console.log(Book.all())
