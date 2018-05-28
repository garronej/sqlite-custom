"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
var __values = (this && this.__values) || function (o) {
    var m = typeof Symbol === "function" && o[Symbol.iterator], i = 0;
    if (m) return m.call(o);
    return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
};
Object.defineProperty(exports, "__esModule", { value: true });
var sqlite = require("sqlite");
var runExclusive = require("run-exclusive");
var logEnable = false;
function enableLog() {
    console.log("enable sqlite log");
    logEnable = true;
}
exports.enableLog = enableLog;
function disableLog() {
    console.log("disable sqlite log");
    logEnable = false;
}
exports.disableLog = disableLog;
var valueAlloc;
(function (valueAlloc) {
    var counter = 0;
    var map = new Map();
    function alloc(value) {
        if (value === undefined) {
            throw new Error("Alloc 'undefined' which is not a SQL valid type");
        }
        var ref = "$" + counter++;
        map.set(ref, value);
        return ref;
    }
    valueAlloc.alloc = alloc;
    function retrieve(ref) {
        var value = map.get(ref);
        if (value === undefined) {
            throw new Error("sqliteCustom error, value freed");
        }
        process.nextTick(function () { return map.delete(ref); });
        return value;
    }
    valueAlloc.retrieve = retrieve;
})(valueAlloc || (valueAlloc = {}));
function connectAndGetApi(db_path, handleStringEncoding) {
    return __awaiter(this, void 0, void 0, function () {
        var _this = this;
        var db, buildSetVarQuery, buildGetVarQuery, esc, buildInsertQuery, buildInsertOrUpdateQueries, query;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, sqlite.open(db_path, { "promise": Promise })];
                case 1:
                    db = _a.sent();
                    return [4 /*yield*/, db.get("PRAGMA foreign_keys = ON")];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, db.get("PRAGMA temp_store = 2")];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, db.get("DROP TABLE IF EXISTS _variables")];
                case 4:
                    _a.sent();
                    return [4 /*yield*/, db.get([
                            "CREATE TEMP TABLE _variables (",
                            "name TEXT PRIMARY KEY,",
                            "integer_value INTEGER,",
                            "text_value TEXT",
                            ")"
                        ].join("\n"))];
                case 5:
                    _a.sent();
                    buildSetVarQuery = function (varName, varType, sql) {
                        return "INSERT OR REPLACE INTO _variables ( name, " + varType + " ) VALUES ( '" + varName + "', ( " + sql + " ) )\n;\n";
                    };
                    buildGetVarQuery = function (varName) {
                        return "( SELECT coalesce(integer_value, text_value) FROM _variables WHERE name='" + varName + "' LIMIT 1 )";
                    };
                    esc = function (value) {
                        if (handleStringEncoding && typeof value === "string") {
                            value = Buffer.from(value, "utf8").toString("binary");
                        }
                        return valueAlloc.alloc(value);
                    };
                    buildInsertQuery = function (table, values, onDuplicateKeyAction) {
                        var keys = Object.keys(values);
                        var backtickKeys = keys.map(function (key) { return "`" + key + "`"; });
                        var onDuplicate = (function () {
                            switch (onDuplicateKeyAction) {
                                case "IGNORE": return " OR IGNORE ";
                                case "THROW ERROR": return " ";
                            }
                        })();
                        return [
                            "INSERT" + onDuplicate + "INTO `" + table + "` ( " + backtickKeys.join(", ") + " )",
                            "VALUES ( " + keys.map(function (key) { return esc(values[key]); }).join(", ") + ")",
                            ";",
                            ""
                        ].join("\n");
                    };
                    buildInsertOrUpdateQueries = function (table, values, table_key) {
                        var sql = buildInsertQuery(table, values, "IGNORE");
                        var _eq = function (key) { return "`" + key + "`=" + esc(values[key]); };
                        var not_table_key = Object.keys(values).filter(function (key) { return table_key.indexOf(key) < 0; });
                        var _set = not_table_key.map(_eq).join(", ");
                        var _where = __spread(table_key.map(_eq), [
                            [
                                "NOT ( ",
                                not_table_key.map(function (key) { return (key !== null) ?
                                    "( `" + key + "` IS NOT NULL AND " + _eq(key) + " )" :
                                    "`" + key + "` IS NULL"; }).join(" AND "),
                                " ) "
                            ].join("")
                        ]).join(" AND ");
                        sql += "UPDATE `" + table + "` SET " + _set + " WHERE " + _where + "\n;\n";
                        return sql;
                    };
                    query = runExclusive.build(function (sql) { return __awaiter(_this, void 0, void 0, function () {
                        var queries, queriesValues, queries_1, queries_1_1, query_1, values, _a, _b, ref, results, queries_2, queries_2_1, query_2, values, rows, insert_id_prev, stmt, e_1_1, e_2, _c, e_3, _d, e_1, _e;
                        return __generator(this, function (_f) {
                            switch (_f.label) {
                                case 0:
                                    queries = sql.split(";")
                                        .map(function (query) { return query.replace(/^[\n]+/, "").replace(/[\n]+$/, ""); })
                                        .filter(function (part) { return !!part; });
                                    queriesValues = [];
                                    try {
                                        for (queries_1 = __values(queries), queries_1_1 = queries_1.next(); !queries_1_1.done; queries_1_1 = queries_1.next()) {
                                            query_1 = queries_1_1.value;
                                            values = {};
                                            try {
                                                for (_a = __values((query_1.match(/\$[0-9]+/g) || [])), _b = _a.next(); !_b.done; _b = _a.next()) {
                                                    ref = _b.value;
                                                    values[ref] = valueAlloc.retrieve(ref);
                                                }
                                            }
                                            catch (e_3_1) { e_3 = { error: e_3_1 }; }
                                            finally {
                                                try {
                                                    if (_b && !_b.done && (_d = _a.return)) _d.call(_a);
                                                }
                                                finally { if (e_3) throw e_3.error; }
                                            }
                                            queriesValues.push(values);
                                        }
                                    }
                                    catch (e_2_1) { e_2 = { error: e_2_1 }; }
                                    finally {
                                        try {
                                            if (queries_1_1 && !queries_1_1.done && (_c = queries_1.return)) _c.call(queries_1);
                                        }
                                        finally { if (e_2) throw e_2.error; }
                                    }
                                    results = [];
                                    _f.label = 1;
                                case 1:
                                    _f.trys.push([1, 9, 10, 11]);
                                    queries_2 = __values(queries), queries_2_1 = queries_2.next();
                                    _f.label = 2;
                                case 2:
                                    if (!!queries_2_1.done) return [3 /*break*/, 8];
                                    query_2 = queries_2_1.value;
                                    values = queriesValues.shift();
                                    if (logEnable) {
                                        console.log("SQL:\n" + query_2);
                                        console.log(values);
                                    }
                                    if (!!!query_2.match(/^SELECT/)) return [3 /*break*/, 4];
                                    return [4 /*yield*/, db.all(query_2, values)];
                                case 3:
                                    rows = _f.sent();
                                    if (handleStringEncoding) {
                                        connectAndGetApi.decodeOkPacketsStrings(rows);
                                    }
                                    results.push(rows);
                                    return [3 /*break*/, 7];
                                case 4: return [4 /*yield*/, db.get("SELECT last_insert_rowid() as insert_id_prev")];
                                case 5:
                                    insert_id_prev = (_f.sent()).insert_id_prev;
                                    return [4 /*yield*/, db.run(query_2, values)];
                                case 6:
                                    stmt = (_f.sent())["stmt"];
                                    results.push({
                                        "insertId": (insert_id_prev === stmt.lastID) ? 0 : stmt.lastID,
                                        "affectedRows": stmt.changes
                                    });
                                    _f.label = 7;
                                case 7:
                                    queries_2_1 = queries_2.next();
                                    return [3 /*break*/, 2];
                                case 8: return [3 /*break*/, 11];
                                case 9:
                                    e_1_1 = _f.sent();
                                    e_1 = { error: e_1_1 };
                                    return [3 /*break*/, 11];
                                case 10:
                                    try {
                                        if (queries_2_1 && !queries_2_1.done && (_e = queries_2.return)) _e.call(queries_2);
                                    }
                                    finally { if (e_1) throw e_1.error; }
                                    return [7 /*endfinally*/];
                                case 11: return [2 /*return*/, (results.length === 1) ? results[0] : results];
                            }
                        });
                    }); });
                    return [2 /*return*/, {
                            query: query,
                            esc: esc,
                            buildInsertQuery: buildInsertQuery,
                            buildInsertOrUpdateQueries: buildInsertOrUpdateQueries,
                            buildSetVarQuery: buildSetVarQuery,
                            buildGetVarQuery: buildGetVarQuery
                        }];
            }
        });
    });
}
exports.connectAndGetApi = connectAndGetApi;
(function (connectAndGetApi) {
    function decodeOkPacketsStrings(rows) {
        try {
            for (var rows_1 = __values(rows), rows_1_1 = rows_1.next(); !rows_1_1.done; rows_1_1 = rows_1.next()) {
                var row = rows_1_1.value;
                for (var key in row) {
                    if (typeof row[key] === "string") {
                        row[key] = Buffer.from(row[key], "binary").toString("utf8");
                    }
                }
            }
        }
        catch (e_4_1) { e_4 = { error: e_4_1 }; }
        finally {
            try {
                if (rows_1_1 && !rows_1_1.done && (_a = rows_1.return)) _a.call(rows_1);
            }
            finally { if (e_4) throw e_4.error; }
        }
        var e_4, _a;
    }
    connectAndGetApi.decodeOkPacketsStrings = decodeOkPacketsStrings;
})(connectAndGetApi = exports.connectAndGetApi || (exports.connectAndGetApi = {}));
var bool;
(function (bool) {
    function enc(b) {
        return (b === undefined) ? null : (b ? 1 : 0);
    }
    bool.enc = enc;
    function dec(t) {
        return (t === null) ? undefined : (t === 1);
    }
    bool.dec = dec;
})(bool = exports.bool || (exports.bool = {}));
;
