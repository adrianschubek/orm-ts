const { Model, Mapper, QueryBuilder, MySqlDriver, select } = require("../dist");

(async () => {

    const driver = new MySqlDriver({
        host: "localhost",
        user: "root",
        password: "",
        database: "test"
    });
    await driver.connect();

    QueryBuilder.useDriver(driver);

    let builder = QueryBuilder.use("books")
        .where({ name: 6 });

    let builder2 = select("id", "name")
        .from("books")

    console.log(">> " + builder2.sql());

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
