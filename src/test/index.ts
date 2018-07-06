import * as sqliteCustom from "../lib";
import * as path from "path";

(async function main(): Promise<void> {

    process.on("unhandledRejection", error => { throw error; });

    const api = await sqliteCustom.connectAndGetApi(
        path.join(__dirname, "..", "..", "res", "test.db")
    );

    api.query("DELETE FROM contact_full_name");
    api.query("DELETE FROM message");
    api.query("DELETE FROM pin");

    let sql = api.buildInsertOrUpdateQueries("pin", { "iccid": "111111111111111", "value": "1234" }, ["iccid"]);

    sql += "SELECT * from pin";

    console.log(sql);

    const prResult = api.query(sql);

    api.close().then(async () => {

        console.log("Db closed!");

        try {

            await api.query("SELECT * from pin");

            console.assert(false);

        } catch (error) {

            console.log("Ok error catched");

            //console.log(error.message);

        }

        console.log("PASS!");

    });

    console.log(await prResult);

})();


