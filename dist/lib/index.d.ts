export declare type TSql = string | number | null;
export declare type Api = {
    query(sql: string): Promise<any>;
    esc(value: TSql): string;
    buildInsertQuery(table: string, values: Record<string, TSql>, onDuplicateKeyAction: "IGNORE" | "THROW ERROR"): string;
    buildInsertOrUpdateQueries<T extends Record<string, TSql>>(table: string, values: T, table_key: (keyof T)[]): string;
    buildSetVarQuery(varName: string, varType: "integer_value" | "text_value", sql: string): string;
    buildGetVarQuery(varName: string): string;
    close(): Promise<void>;
};
export declare function enableLog(): void;
export declare function disableLog(): void;
export declare function connectAndGetApi(db_path: string, handleStringEncoding?: "HANDLE STRING ENCODING"): Promise<Api>;
export declare namespace connectAndGetApi {
    function decodeOkPacketsStrings(rows: any[]): void;
}
export declare namespace bool {
    function enc(b: boolean): 0 | 1;
    function enc(b: undefined): null;
    function enc(b: boolean | undefined): 0 | 1 | null;
    function dec(t: 0 | 1): boolean;
    function dec(t: null): undefined;
    function dec(t: 0 | 1 | null): boolean | undefined;
}
export declare type Response = Response.Rows | Response.Result;
export declare namespace Response {
    type Rows = any[];
    type Result = {
        affectedRows: number;
        insertId: number;
    };
}
