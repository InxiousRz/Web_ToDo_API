// IMPORTS
// ===============================================================================
const db = require('./db');
const moment_tz = require('moment-timezone');
const { dnsPrefetchControl } = require('helmet');


// FUNCTIONS
// ===============================================================================

// MODELS
// ===============================================================================


// ADD task
// ===============================================================================
function addTask(
    title, 
    action_time, 
    objective_name_list
){

    let success;
    let result;

    try {

        let date_now = moment_tz()
        console.log(action_time)

        // HEADER
        let header_id;
        db.run(
            `
                INSERT INTO task(title, action_time, created_time, updated_time, is_finished)
                VALUES (
                    '${title}',
                    ${moment_tz(action_time).unix()},
                    ${date_now.unix()},
                    ${date_now.unix()},
                    false
                )
            `,
            (err) => {
                if(err){
                    throw err;
                }

                header_id = this.lastID;

                console.log('header data created :: ' + header_id.toString());

            }
        );

        for(let objective_name of objective_name_list){
            // DETAIL
            db.run(
                `
                    INSERT INTO task_detail(task_id, objective_name, is_finished)
                    VALUES (
                        ${header_id},
                        '${objective_name}',
                        false
                    )
                `,
                (err) => {
                    if(err){
                        throw err;
                    }
                    console.log('detail data created :: '  + this.lastID.toString());

                }
            );

        }

        
        success = true;
        result = null;

    } catch(err) {

        console.log(err.message);
        success = false;
        result = err.message;


    }

    return [
        success,
        result
    ];

}

// GET task search
// ===============================================================================
function getTaskSearch(
    title, 
    action_time_start, 
    action_time_end,
    created_time_start, 
    created_time_end,
    updated_time_start, 
    updated_time_end,
    is_finished
){

    let success;
    let result;

    try {

        // HEADER
        let query = `
            SELECT 
                task_id,
                title,
                action_time,
                created_time,
                updated_time,
                is_finished
            FROM task
        `;
        let filter_applied = 0;

        // APPLY SEARCH - title
        if (title != null){

            if (filter_applied == 0){
                query += " where "
            } else {
                query += " and "
            }

            let filter_value = '%'+title.toString().toLowerCase()+'%';
            query += ` title like ${filter_value} `;
            filter_applied += 1;
        }

        // APPLY SEARCH - action_time_start
        if (action_time_start != null){

            if (filter_applied == 0){
                query += " where "
            } else {
                query += " and "
            }

            let filter_value = action_time_start;
            query += ` action_time >= ${filter_value} `;
            filter_applied += 1;
        }

        // APPLY SEARCH - action_time_end
        if (action_time_end != null){

            if (filter_applied == 0){
                query += " where "
            } else {
                query += " and "
            }

            let filter_value = action_time_end;
            query += ` action_time <= ${filter_value} `;
            filter_applied += 1;
        }

        // APPLY SEARCH - created_time_start
        if (created_time_start != null){

            if (filter_applied == 0){
                query += " where "
            } else {
                query += " and "
            }

            let filter_value = created_time_start;
            query += ` created_time >= ${filter_value} `;
            filter_applied += 1;
        }

        // APPLY SEARCH - created_time_end
        if (created_time_end != null){

            if (filter_applied == 0){
                query += " where "
            } else {
                query += " and "
            }

            let filter_value = created_time_end;
            query += ` created_time <= ${filter_value} `;
            filter_applied += 1;
        }

        // APPLY SEARCH - updated_time_start
        if (updated_time_start != null){

            if (filter_applied == 0){
                query += " where "
            } else {
                query += " and "
            }

            let filter_value = updated_time_start;
            query += ` updated_time >= ${filter_value} `;
            filter_applied += 1;
        }

        // APPLY SEARCH - updated_time_end
        if (updated_time_end != null){

            if (filter_applied == 0){
                query += " where "
            } else {
                query += " and "
            }

            let filter_value = updated_time_end;
            query += ` updated_time <= ${filter_value} `;
            filter_applied += 1;
        }

        // APPLY SEARCH - is_finished
        if (is_finished != null){

            if (filter_applied == 0){
                query += " where "
            } else {
                query += " and "
            }

            let filter_value = is_finished;
            query += ` is_finished = ${filter_value} `;
            filter_applied += 1;
        }


        // ORDER
        query += `
            ORDER BY action_time asc
        `


        result = [];
        
        db.each(
            query,
            (err, row) => {
                if(err){
                    throw err;
                }

                console.log('header data fetched :: ' + row["task_id"].toString());

                let header_id = row["task_id"];
                let header_data = row;
                let header_detail_data_list;

                db.all(
                    `
                        SELECT 
                            td.task_detail_id,
                            td.objective_name,
                            td.is_finished
                        FROM task_detail AS td
                        INNER JOIN task AS t ON td.task_id = t.task_id
                        WHERE td.task_id = ${header_id}
                    `,
                    (err, rows) => {
                        if(err){
                            throw err;
                        }
        
                        header_detail_data_list = rows;

                        result.push(
                            {
                                ...header_data,
                                "Objective_List": header_detail_data_list
                            }
                        );
        
                        console.log('detail data fetched :: ' + rows.length.toString() + ' item :: for header id :: ' + header_id.toString());
        
                    }
                );

                
                

            }
        );

        
        success = true;

    } catch(err) {

        console.log(err.message);
        success = false;
        result = err.message;


    }

    return [
        success,
        result
    ];

}

// GET task by ID
// ===============================================================================
function getTaskByID(
    task_id,
){

    let success;
    let result = null;

    try {

        // HEADER
        let query = `
            SELECT 
                task_id,
                title,
                action_time,
                created_time,
                updated_time,
                is_finished
            FROM task
            WHERE task_id = ${task_id}
            ORDER BY action_time asc
        `;
        
        db.get(
            query,
            (err, row) => {
                if(err){
                    throw err;
                }

                console.log('header data fetched :: ' + row["task_id"].toString());

                let header_id = row["task_id"];
                let header_data = row;
                let header_detail_data_list;

                db.all(
                    `
                        SELECT 
                            td.task_detail_id,
                            td.objective_name,
                            td.is_finished
                        FROM task_detail AS td
                        INNER JOIN task AS t ON td.task_id = t.task_id
                        WHERE td.task_id = ${header_id}
                    `,
                    (err, rows) => {
                        if(err){
                            throw err;
                        }
        
                        header_detail_data_list = rows;
        
                        console.log('detail data fetched :: ' + rows.length.toString() + ' item :: for header id :: ' + header_id.toString());
        
                    }
                );

                
                result = {
                    ...header_data,
                    "Objective_List": header_detail_data_list
                };

            }
        );

        
        success = true;

    } catch(err) {

        console.log(err.message);
        success = false;
        result = err.message;


    }

    return [
        success,
        result
    ];

}

// UPDATE task by ID
// ===============================================================================
function updateTask(
    task_id,
    title,
    objective_list
){

    let success;
    let result = null;

    try {
        
        db.serialize(function() {

            db.run(
                "BEGIN",
                (err, row) => {
                    if(err){
                        throw err;
                    }
    
                    console.log('BEGIN');
    
                }
            );

            db.run(
                `
                    UPDATE task
                    SET title = ${title}
                    WHERE task_id = ${task_id}
                `,
                (err, row) => {
                    if(err){
                        throw err;
                    }
    
                    console.log('header data updated :: ' + row["task_id"].toString());
    
                }
            );

            db.run(
                `
                    DELETE FROM task_detail
                    WHERE task_id = ${task_id}
                `,
                (err, row) => {
                    if(err){
                        throw err;
                    }
    
                    console.log('detail data deleted :: ' + row["task_id"].toString());
    
                }
            );

            for(let objective_data of objective_list){
                db.run(
                    `
                        INSERT INTO task_detail(task_id, objective_name, is_finished)
                        VALUES(${task_id}, ${objective_data["Objective_Name"]}, ${objective_data["Is_Finished"]}) ,
                    `,
                    (err, rows) => {
                        if(err){
                            throw err;
                        }
        
                        console.log('detail data added :: ' + rows.length.toString() + ' item :: for header id :: ' + task_id.toString());
        
                    }
                );
            }

            db.run(
                "COMMIT",
                (err, row) => {
                    if(err){
                        throw err;
                    }
    
                    console.log('COMMIT');
    
                }
            );

        });

        

        
        success = true;
        result = null

    } catch(err) {

        console.log(err.message);
        success = false;
        result = err.message;


    }

    return [
        success,
        result
    ];

}

// DELETE task by ID
// ===============================================================================
function deleteTask(
    task_id,
){

    let success;
    let result = null;

    try {
        
        db.serialize(function() {

            db.run(
                "BEGIN",
                (err, row) => {
                    if(err){
                        throw err;
                    }
    
                    console.log('BEGIN');
    
                }
            );

            db.run(
                `
                    DELETE FROM task_detail
                    WHERE task_id = ${task_id}
                `,
                (err, row) => {
                    if(err){
                        throw err;
                    }
    
                    console.log('detail data deleted :: ' + row["task_id"].toString());
    
                }
            );

            db.run(
                `
                    DELETE FROM task
                    WHERE task_id = ${task_id}
                `,
                (err, row) => {
                    if(err){
                        throw err;
                    }
    
                    console.log('header data deleted :: ' + row["task_id"].toString());
    
                }
            );

            db.run(
                "COMMIT",
                (err, row) => {
                    if(err){
                        throw err;
                    }
    
                    console.log('COMMIT');
    
                }
            );

        });

        

        
        success = true;
        result = null

    } catch(err) {

        console.log(err.message);
        success = false;
        result = err.message;


    }

    return [
        success,
        result
    ];

}


// EXPORTS
// ===============================================================================
exports.addTask = addTask;
exports.getTaskSearch = getTaskSearch;
exports.getTaskByID = getTaskByID;
exports.updateTask = updateTask;
exports.deleteTask = deleteTask;
