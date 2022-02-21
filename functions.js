// IMPORTS
// ===============================================================================
const db = require('./db').db;
const begin = require('./db').begin;
const commit = require('./db').commit;
const rollback = require('./db').rollback;
const moment_tz = require('moment-timezone');
const { dnsPrefetchControl } = require('helmet');


// FUNCTIONS
// ===============================================================================

// MODELS
// ===============================================================================


// CONVERT BOOLEAN
function formatBooleanTask(header, detail_list){

    if(header != null){
        let temp_header = header;
        for(let key of Object.keys(header)){
            if(key.indexOf("Is_") != -1){
                temp_header[key] = (temp_header[key] == true);
            }
        }
        console.log(temp_header);
        return temp_header;    
    }

    if(detail_list != null){
        let temp_detail_list = detail_list;
        for(let detail_index in detail_list){
            for(let key of Object.keys(detail_list[detail_index])){
                if(key.indexOf("Is_") != -1){
                    temp_detail_list[detail_index][key] = (temp_detail_list[detail_index][key] == true);
                }
            }
        }
        console.log(temp_detail_list);
        return temp_detail_list;    
    }

}


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

        
        let header_id;

        // BEGIN
        begin.run();

        // HEADER
        let insert_head_stmt = db.prepare(
            `
                INSERT INTO task(title, action_time, created_time, updated_time, is_finished)
                VALUES (
                    '${title}',
                    ${action_time},
                    ${date_now.unix()},
                    ${date_now.unix()},
                    false
                )
            `
        );
        let insert_head_info = insert_head_stmt.run();
        header_id = insert_head_info.lastInsertRowid;
        console.log('header data created :: ' + header_id.toString());

        for(let objective_name of objective_name_list){

            // DETAIL
            let insert_detail_stmt = db.prepare(
                `
                    INSERT INTO task_detail(task_id, objective_name, is_finished)
                    VALUES (
                        ${header_id},
                        '${objective_name}',
                        false
                    )
                `
            );
            let insert_detail_info = insert_detail_stmt.run();
            detail_id = insert_detail_info.lastInsertRowid;
            console.log('detail data created :: ' + detail_id.toString());
            

        }

        // COMMIT
        commit.run();
        
        success = true;
        result = null;

    } catch(err) {

        if (db.inTransaction) rollback.run();
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
    is_finished,
    current_page,
    limit
){

    let success;
    let result;

    try {

        // HEADER
        let query = `
            SELECT 
                task_id as "Task_ID",
                title as "Title",
                action_time as "Action_Time",
                created_time as "Created_Time",
                updated_time as "Updated_Time",
                is_finished as "Is_Finished"
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

            let filter_value = "'" + '%'+title.toString().toLowerCase()+'%' + "'" ;
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

        // LIMIT 
        if(limit){
            query += ` LIMIT ${limit} `;
        }
        

        // OFFSET 
        let offset = limit * Math.max(((current_page || 0) - 1), 0);
        query += ` OFFSET ${offset} `;



        result = [];

        let search_stmt = db.prepare(
            query
        );
        
        for(const head_data of search_stmt.iterate()){

            console.log('header data fetched :: ' + head_data["Task_ID"].toString());

            let header_id = head_data["Task_ID"];
            let header_data = head_data;

            let search_detail_stmt = db.prepare(
                `
                    SELECT 
                        --// td.task_detail_id as "Task_Detail_ID",
                        td.objective_name as "Objective_Name",
                        td.is_finished as "Is_Finished"
                    FROM task_detail AS td
                    INNER JOIN task AS t ON td.task_id = t.task_id
                    WHERE td.task_id = ${header_id}
                `
            );
                
            let detail_data_list = search_detail_stmt.all();
            result.push(
                {
                    ...formatBooleanTask(header_data, null),
                    "Objective_List": formatBooleanTask(null, detail_data_list)
                }
            );

            console.log('detail data fetched :: ' + detail_data_list.length.toString() + ' item :: for header id :: ' + header_id.toString());

            
        }

        
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


// GET task search Count All
// ===============================================================================
function getTaskSearchCountAll(
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
            select  
                --// COUNT ONLY
                COUNT(*) as "Total"
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

            let filter_value = "'" + '%'+title.toString().toLowerCase()+'%' + "'" ;
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
        `;



        result = [];

        let search_stmt = db.prepare(
            query
        );
        
        let search_result = search_stmt.get();
        result = Number(search_result["Total"]);

        
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


// GET task SEARCH MAIN
// ===============================================================================
function getTaskSearchMain(
    title,
    action_time_start,
    action_time_end,
    created_time_start,
    created_time_end,
    updated_time_start,
    updated_time_end,
    is_finished,
    current_page,
    limit
){

    // GET SAMPLE PARAMETER HASIL DATA
    // ------------------------------------------------------
    let [get_search_success, get_search_result] = getTaskSearch(
        title,
        action_time_start,
        action_time_end,
        created_time_start,
        created_time_end,
        updated_time_start,
        updated_time_end,
        is_finished,
        current_page,
        limit
    )

    // IF FAILS
    if (!get_search_success){
        success = false;
        result = get_search_result;
        return [success, result]; // END
    }

    // GET SAMPLE PARAMETER HASIL DATA
    // ------------------------------------------------------
    let [get_search_count_success, get_search_count_result] = getTaskSearchCountAll(
        title,
        action_time_start,
        action_time_end,
        created_time_start,
        created_time_end,
        updated_time_start,
        updated_time_end,
        is_finished
    )

    // IF FAILS
    if (!get_search_count_success){
        success = false;
        result = get_search_count_result;
        return [success, result]; // END
    }

    // PAGINATE

    result = PaginatePagesSimple(
        get_search_result,
        current_page,
        limit,
        get_search_count_result
    );
    success = true;

    
    return [success, result]; // END

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
        let header_stmt =  db.prepare(
            `
                SELECT 
                    task_id as "Task_ID",
                    title as "Title",
                    action_time as "Action_Time",
                    created_time as "Created_Time",
                    updated_time as "Updated_Time",
                    is_finished as "Is_Finished"
                FROM task
                WHERE task_id = ${task_id}
                ORDER BY action_time asc
            `
        );
        let header_data = header_stmt.get();
        if(!header_data){
            success = true;
            result = null;
            return [
                success,
                result
            ]; 
        }
        console.log('header data fetched :: ' + header_data["Task_ID"].toString());

        let header_id = header_data["Task_ID"];
        
        let detail_stmt = db.prepare(
            `
                SELECT 
                    --// td.task_detail_id as "Task_Detail_ID",
                    td.objective_name as "Objective_Name",
                    td.is_finished as "Is_Finished"
                FROM task_detail AS td
                INNER JOIN task AS t ON td.task_id = t.task_id
                WHERE td.task_id = ${header_id}
            `
        );
        let detail_data_list = detail_stmt.all();
        console.log('detail data fetched :: ' + detail_data_list.length.toString() + ' item :: for header id :: ' + header_id.toString());


        
        result = {
            ...formatBooleanTask(header_data, null),
            "Objective_List": formatBooleanTask(null, detail_data_list)
        };

        
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
        
        let date_now_unix = moment_tz().unix();

        // BEGIN
        begin.run();

        let update_head_stmt = db.prepare(
            `
                UPDATE task
                SET title = '${title}', updated_time = ${date_now_unix}
                WHERE task_id = ${task_id}
            `
        );
        let update_head_info = update_head_stmt.run();
        console.log('header data updated :: ' + task_id.toString());

        let delete_detail_stmt = db.prepare(
            `
                DELETE FROM task_detail
                WHERE task_id = ${task_id}
            `
        );
        let delete_detail_info = delete_detail_stmt.run();
        console.log('detail data deleted :: ' + task_id.toString());

        let all_objective_done = true;
        for(let objective_data of objective_list){

            let objective_name = objective_data["Objective_Name"];
            let is_finished = objective_data["Is_Finished"].toString().toLowerCase();

            if (objective_data["Is_Finished"] == false){
                all_objective_done = false;
            }

            let insert_detail_stmt = db.prepare(
                `
                    INSERT INTO task_detail(task_id, objective_name, is_finished)
                    VALUES (
                        ${task_id},
                        '${objective_name}',
                        ${is_finished}
                    )
                `
            );
            let insert_detail_info = insert_detail_stmt.run();
        }
        console.log('detail data added :: ' + objective_list.length.toString() + ' item :: for header id :: ' + task_id.toString());
    
        if (all_objective_done){
            let update_head_stmt_finish = db.prepare(
                `
                    UPDATE task
                    SET Is_Finished = true
                    WHERE task_id = ${task_id}
                `
            );
            let update_head_info_finish = update_head_stmt_finish.run();
            console.log('header data updated finish :: ' + task_id.toString());
        }
        


        // COMMIT
        commit.run();

        success = true;
        result = null

    } catch(err) {

        if (db.inTransaction) rollback.run();
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


        // BEGIN
        begin.run();

        let delete_detail_stmt = db.prepare(
            `
                DELETE FROM task_detail
                WHERE task_id = ${task_id}
            `
        );
        let delete_detail_info = delete_detail_stmt.run();
        console.log('detail data deleted :: ' + task_id.toString());

        
        let delete_header_stmt = db.prepare(
            `
                DELETE FROM task
                WHERE task_id = ${task_id}
            `
        );
        let delete_header_info = delete_header_stmt.run();
        console.log('header data deleted :: ' + task_id.toString());

        // COMMIT
        commit.run();
        
        success = true;
        result = null

    } catch(err) {

        if (db.inTransaction) rollback.run();
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
function checkTaskIDExists(
    task_id,
){

    let success;
    let result = null;

    try {

        // HEADER
        let header_stmt =  db.prepare(
            `
                select exists(
                    select 1 
                    from task
                    where task_id = ${task_id}
                ) as "Exists"
            `
        );
        let header_data = header_stmt.get();
        console.log('header data checked :: ' + task_id.toString());

        result = (header_data["Exists"] == true);
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


// PAGINATE PAGES
// ===============================================================================
function PaginatePagesSimple(
    wanted_data_list,
    current_page,
    limit,
    total_data_count
){

    let result;

    // PROPERTY NORMALIZATION
    // ------------------------------------------------------
    current_page = Number(current_page)
    limit = limit == undefined || limit == null ? null : Number(limit)
    total_data_count = Number(total_data_count)

    // PREPARE EXTRA PAGINATION DATA
    // ------------------------------------------------------
    let max_page = 1;
    if (limit != null && total_data_count != 0){
        max_page = Math.ceil(total_data_count / limit);
    } 

    // IF CURRENT PAGE > MAX PAGE :: FORCE RETURN EMPTY
    if (current_page > max_page){
        success = true;
        result = {
            "List_Data": [],
            "Pagination_Data": {
                "Current_Page": current_page, //CURRENT ACCESSED PAGE
                "Max_Data_Per_Page": limit, //MAXIMUM DATA VIEWED ON EACH PAGE
                "Max_Page": max_page, //MAXIMUM PAGE AVAILABLE
                "Total_All_Data": total_data_count //TOTAL ALL DATA
            }
        }

        return result; // END
    }

    result = {
        "List_Data": wanted_data_list,
        "Pagination_Data": {
            "Current_Page": current_page,
            "Max_Data_Per_Page": limit,
            "Max_Page": max_page,
            "Total_All_Data": total_data_count
        }
    }

    return result; // END
}



// EXPORTS
// ===============================================================================
exports.addTask = addTask;
exports.getTaskSearchMain = getTaskSearchMain;
exports.getTaskByID = getTaskByID;
exports.updateTask = updateTask;
exports.deleteTask = deleteTask;
exports.checkTaskIDExists = checkTaskIDExists;
