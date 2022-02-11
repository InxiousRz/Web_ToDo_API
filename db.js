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

let db = new sqlite3_db(DBSOURCE, { verbose: console.log });(err) => {
    if(err) {
      // Cannot open database
      console.error(err.message)
      throw err
    } else {
        console.log('Connected to the SQLite database.');

        // HEAD CREATE
        db.run(
            head_table_query,
            (err) => {
                if(err){
                    throw err;
                }
                console.log('Head table created to the SQLite database.');
                
            }
        );
        
        // DETAIL CREATE
        db.run(
            detail_table_query,
            (err) => {
                if(err){
                    throw err;
                }
                console.log('Detail table created to the SQLite database.');
                
            }
        );
    }
});


module.exports = db;