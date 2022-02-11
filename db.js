var sqlite3_db = require('better-sqlite3');

const DBSOURCE = "db.sqlite";
// const DBSOURCE = ":memory:";


let head_table_query = `
    CREATE TABLE IF NOT EXISTS task (
        task_id integer PRIMARY KEY AUTOINCREMENT,
        title text, 
        action_time integer, 
        created_time integer, 
        updated_time integer, 
        is_finished boolean
    )
`;

let detail_table_query = `
    CREATE TABLE IF NOT EXISTS task_detail (
        task_detail_id integer PRIMARY KEY AUTOINCREMENT,
        task_id integer,
        objective_name text,  
        is_finished boolean,
        FOREIGN KEY (task_id) 
            REFERENCES task (task_id)

    )
`;

let db = new sqlite3_db(DBSOURCE, { verbose: console.log });
console.log('Connected to the SQLite database.');

// HEAD CREATE
let header_table_stmt = db.prepare(head_table_query);
header_table_stmt.run();
console.log('Head table created to the SQLite database.');

// DETAIL CREATE
let detail_table_stmt = db.prepare(detail_table_query);
detail_table_stmt.run();
console.log('Detail table created to the SQLite database.');

// HARD PARAM
let begin = db.prepare('BEGIN');
let commit = db.prepare('COMMIT');
let rollback = db.prepare('ROLLBACK');


exports.db = db;
exports.begin = begin;
exports.commit = commit;
exports.rollback = rollback;