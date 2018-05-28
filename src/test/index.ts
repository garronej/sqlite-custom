import * as sqliteCustom from "../lib";
import * as path from "path";

(async function main(): Promise<void> {

    process.on("unhandledRejection", (error) => { throw error; });

    const api = await sqliteCustom.connectAndGetApi(
        path.join(__dirname, "..", "..", "res", "test.db")
    );

    await api.query("DELETE FROM contact_full_name");
    await api.query("DELETE FROM message");
    await api.query("DELETE FROM pin");

    let sql= api.buildInsertOrUpdateQueries("pin", {"iccid": "111111111111111", "value": "1234" }, [ "iccid" ]);

    sql += "SELECT * from pin";

    console.log(sql);

    const result= await api.query(sql);

    console.log(result);

})();


