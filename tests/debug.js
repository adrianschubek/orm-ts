const { Model, Mapper, QueryBuilder, MySqlDriver } = require("../dist");

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
        .select("name", "price")
        .where("name", "<>", "")
        .andWhere({ price: 599 })

    // let builder = select("books.id", "name", "price")
    //     .from("books")
    //     .where({ name: "test" })

    console.log(">> " + builder.sql());

    let x = await builder.fetch();
    x.forEach(value => console.log(Object.assign({}, value)));

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
