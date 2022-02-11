// IMPORTS
// ===============================================================================
const express = require('express');
const joi = require('joi');
const moment_tz = require('moment-timezone');

// MIDDLEWARES
// ===============================================================================

// MODELS
// ===============================================================================

// FUNCTIONS
// ===============================================================================
const addTask = require('./functions').addTask;
const getTaskSearch = require('./functions').getTaskSearch;
const getTaskByID = require('./functions').getTaskByID;
const updateTask = require('./functions').updateTask;
const deleteTask = require('./functions').deleteTask;
const checkTaskIDExists = require('./functions').checkTaskIDExists;
const logApiBasic = require('./utilities').logApiBasic;

// CONFIGS
// ===============================================================================

// VARS
// ===============================================================================
const router = express.Router();

// FOR '/task'
const head_route_name = '/task';


// ROUTES


//------------------------------------------------------------------------
// GET task
//------------------------------------------------------------------------
router.get('/get', async (req, res)=>{
    
    // BASIC REQUEST INFO
    //=============================================================
    const request_namepath = req.path;
    const time_requested = moment_tz().tz('Asia/Jakarta');

    // PARAM
    //=============================================================
    const data_toview_on_error = {
        "QUERY": req.query
    };
    const url_query = req.query;
    console.log(data_toview_on_error);

    // JOI VALIDATION
    //=============================================================
    let joi_schema = joi.object({
        "Title": joi.string().default(null),
        "Action_Time_Start": joi.date().timestamp('unix').default(null),
        "Action_Time_End": joi.date().timestamp('unix').default(null),
        "Created_Time_Start": joi.date().timestamp('unix').default(null),
        "Created_Time_End": joi.date().timestamp('unix').default(null),
        "Updated_Time_Start": joi.date().timestamp('unix').default(null),
        "Updated_Time_End": joi.date().timestamp('unix').default(null),
        "Is_Finished": joi.boolean().default(null),
        // "Page": joi.number().min(1).required(),
        // "Limit": joi.number().default(20).invalid(0)
    }).required();

    let joi_valid = joi_schema.validate(url_query);
    if (joi_valid.error){
        const message = {
            "message": "Failed",
            "error_key": "error_param",
            "error_message": joi_valid.error.stack,
            "error_data": joi_valid.error.details
        };
        //LOGGING
        logApiBasic(
            `Request ${head_route_name}/${request_namepath} Failed`,
            `REQUEST GOT AT : ${time_requested} \n` +
            "REQUEST BODY/PARAM : \n" +
            JSON.stringify(data_toview_on_error, null, 2),
            JSON.stringify(message, null, 2)
        );
        res.status(200).json(message);
        return; //END
    }

    // PARAMETER
    //=============================================================
    let title = joi_valid.value["Title"];
    let action_time_start = joi_valid.value["Action_Time_Start"] == null ? null : moment_tz(joi_valid.value["Action_Time_Start"]).unix();
    let action_time_end = joi_valid.value["Action_Time_End"] == null ? null : moment_tz(joi_valid.value["Action_Time_End"]).unix();
    let created_time_start = joi_valid.value["Created_Time_Start"] == null ? null : moment_tz(joi_valid.value["Created_Time_Start"]).unix();
    let created_time_end = joi_valid.value["Created_Time_End"] == null ? null : moment_tz(joi_valid.value["Created_Time_End"]).unix();
    let updated_time_start = joi_valid.value["Updated_Time_Start"] == null ? null : moment_tz(joi_valid.value["Updated_Time_Start"]).unix();
    let updated_time_end = joi_valid.value["Updated_Time_End"] == null ? null : moment_tz(joi_valid.value["Updated_Time_End"]).unix();
    let is_finished = joi_valid.value["Is_Finished"];
    // let current_page = joi_valid.value["Page"];
    // let limit = joi_valid.value["Limit"];

    // GET task
    //=============================================================
    let [task_success, task_result] = getTaskSearch(
        title,
        action_time_start,
        action_time_end,
        created_time_start,
        created_time_end,
        updated_time_start,
        updated_time_end,
        is_finished
    );

    // QUERY FAILS
    if (!task_success){
        console.log(task_result);
        const message = {
            "message": "Failed",
            "error_key": "error_internal_server",
            "error_message": task_result,
            "error_data": "ON getTaskSearch"
        };
        //LOGGING
        logApiBasic(
            `Request ${head_route_name}/${request_namepath} Failed`,
            `REQUEST GOT AT : ${time_requested} \n` +
            "REQUEST BODY/PARAM : \n" +
            JSON.stringify(data_toview_on_error, null, 2),
            JSON.stringify(message, null, 2)
        );
        res.status(200).json(message);
        return; //END
    }


    // ASSEMBLY RESPONSE
    //=============================================================
    res.status(200).json({
        "message": "Success",
        "data": task_result
    });
    return; //END
    
});


//------------------------------------------------------------------------
// PUT UPDATE task
//------------------------------------------------------------------------
router.put('/update/:id', async (req, res)=>{

    // BASIC REQUEST INFO
    //=============================================================
    const request_namepath = req.path;
    const time_requested = moment_tz().tz('Asia/Jakarta');

    // PARAM
    //=============================================================
    const data_toview_on_error = {
        "PARAMS": req.params,
        "BODY": req.body
    };
    const req_body = req.body;

    // JOI VALIDATION
    //=============================================================
    let joi_body_schema = joi.object({
        "Title": joi.string().required(),
        "Objective_List": joi.array().items(
            joi.object({
                "Objective_Name": joi.string().required(),
                "Is_Finished": joi.boolean().required()
            }).required()
        ).required().min(1)
    }).required();

    let joi_id_schema = joi.number().required();

    let joi_body_valid = joi_body_schema.validate(req_body);
    if (joi_body_valid.error){
        const message = {
            "message": "Failed",
            "error_key": "error_param",
            "error_message": joi_body_valid.error.stack,
            "error_data": joi_body_valid.error.details
        };
        //LOGGING
        logApiBasic(
            `Request ${head_route_name}/${request_namepath} Failed`,
            `REQUEST GOT AT : ${time_requested} \n` +
            "REQUEST BODY/PARAM : \n" +
            JSON.stringify(data_toview_on_error, null, 2),
            JSON.stringify(message, null, 2)
        );
        res.status(200).json(message);
        return; //END
    }

    let joi_id_valid = joi_id_schema.validate(req.params.id);
    if (joi_id_valid.error){
        const message = {
            "message": "Failed",
            "error_key": "error_param",
            "error_message": joi_id_valid.error.stack,
            "error_data": joi_id_valid.error.details
        };
        //LOGGING
        logApiBasic(
            `Request ${head_route_name}/${request_namepath} Failed`,
            `REQUEST GOT AT : ${time_requested} \n` +
            "REQUEST BODY/PARAM : \n" +
            JSON.stringify(data_toview_on_error, null, 2),
            JSON.stringify(message, null, 2)
        );
        res.status(200).json(message);
        return; //END
    }


    // PARAMETER
    //=============================================================
    let task_id = req.params.id;
    let title = joi_body_valid.value["Title"];
    let objective_list = joi_body_valid.value["Objective_List"];

    // CHECK ID task
    //=============================================================
    let [check_task_success, check_task_result] = checkTaskIDExists(
        task_id
    );

    // QUERY FAILS
    if (!check_task_success){
        console.log(check_task_result);
        const message = {
            "message": "Failed",
            "error_key": "error_internal_server",
            "error_message": check_task_result,
            "error_data": "ON checkTaskIDExists"
        };
        //LOGGING
        logApiBasic(
            `Request ${head_route_name}/${request_namepath} Failed`,
            `REQUEST GOT AT : ${time_requested} \n` +
            "REQUEST BODY/PARAM : \n" +
            JSON.stringify(data_toview_on_error, null, 2),
            JSON.stringify(message, null, 2)
        );
        res.status(200).json(message);
        return; //END
    }

    // ID DOESNT EXISTS
    if (!check_task_result){
        console.log(check_task_result);
        const message = {
            "message": "Failed",
            "error_key": "error_id_not_found",
            "error_message": "Cant found data with id :: " + task_id.toString(),
            "error_data": {
                "ON": "checkTaskIDExists",
                "ID": task_id
            }
        };
        //LOGGING
        logApiBasic(
            `Request ${head_route_name}/${request_namepath} Failed`,
            `REQUEST GOT AT : ${time_requested} \n` +
            "REQUEST BODY/PARAM : \n" +
            JSON.stringify(data_toview_on_error, null, 2),
            JSON.stringify(message, null, 2)
        );
        res.status(200).json(message);
        return; //END
    }

    // UPDATE task
    //=============================================================
    let [task_success, task_result] = updateTask(
        task_id,
        title,
        objective_list
    );

    // QUERY FAILS
    if (!task_success){
        console.log(task_result);
        const message = {
            "message": "Failed",
            "error_key": "error_internal_server",
            "error_message": task_result,
            "error_data": "ON updateTask"
        };
        //LOGGING
        logApiBasic(
            `Request ${head_route_name}/${request_namepath} Failed`,
            `REQUEST GOT AT : ${time_requested} \n` +
            "REQUEST BODY/PARAM : \n" +
            JSON.stringify(data_toview_on_error, null, 2),
            JSON.stringify(message, null, 2)
        );
        res.status(200).json(message);
        return; //END
    }


    // ASSEMBLY RESPONSE
    //=============================================================
    res.status(200).json({
        "message": "Success"
    });
    return; //END
    
});


//------------------------------------------------------------------------
// POST ADD task
//------------------------------------------------------------------------
router.post('/add', async (req, res)=>{

    // BASIC REQUEST INFO
    //=============================================================
    const request_namepath = req.path;
    const time_requested = moment_tz().tz('Asia/Jakarta');

    // PARAM
    //=============================================================
    const data_toview_on_error = {
        "PARAMS": req.params,
        "BODY": req.body
    };
    const req_body = req.body;

    // JOI VALIDATION
    //=============================================================
    let joi_body_schema = joi.object({
        "Title": joi.string().required(),
        "Action_Time": joi.date().timestamp('unix').required(),
        "Objective_List": joi.array().items(
            joi.string().required(),
        ).required().min(1)
    }).required();

    let joi_body_valid = joi_body_schema.validate(req_body);
    if (joi_body_valid.error){
        const message = {
            "message": "Failed",
            "error_key": "error_param",
            "error_message": joi_body_valid.error.stack,
            "error_data": joi_body_valid.error.details
        };
        //LOGGING
        logApiBasic(
            `Request ${head_route_name}/${request_namepath} Failed`,
            `REQUEST GOT AT : ${time_requested} \n` +
            "REQUEST BODY/PARAM : \n" +
            JSON.stringify(data_toview_on_error, null, 2),
            JSON.stringify(message, null, 2)
        );
        res.status(200).json(message);
        return; //END
    }


    // PARAMETER
    //=============================================================
    let title = joi_body_valid.value["Title"];
    let action_time = joi_body_valid.value["Action_Time"] == null ? null : moment_tz(joi_body_valid.value["Action_Time"]).unix();
    let objective_list = joi_body_valid.value["Objective_List"];

    // ADD task
    //=============================================================
    let [task_success, task_result] = addTask(
        title,
        action_time,
        objective_list
    );

    // QUERY FAILS
    if (!task_success){
        console.log(task_result);
        const message = {
            "message": "Failed",
            "error_key": "error_internal_server",
            "error_message": task_result,
            "error_data": "ON updateTask"
        };
        //LOGGING
        logApiBasic(
            `Request ${head_route_name}/${request_namepath} Failed`,
            `REQUEST GOT AT : ${time_requested} \n` +
            "REQUEST BODY/PARAM : \n" +
            JSON.stringify(data_toview_on_error, null, 2),
            JSON.stringify(message, null, 2)
        );
        res.status(200).json(message);
        return; //END
    }


    // ASSEMBLY RESPONSE
    //=============================================================
    res.status(200).json({
        "message": "Success"
    });
    return; //END
    
});


//------------------------------------------------------------------------
// DELETE task
//------------------------------------------------------------------------
router.delete('/delete/:id', async (req, res)=>{

    // BASIC REQUEST INFO
    //=============================================================
    const request_namepath = req.path;
    const time_requested = moment_tz().tz('Asia/Jakarta');

    // PARAM
    //=============================================================
    const data_toview_on_error = {
        "PARAMS": req.params,
        "BODY": req.body
    };

    // JOI VALIDATION
    //=============================================================
    let joi_id_schema = joi.number().required();

    let joi_id_valid = joi_id_schema.validate(req.params.id);
    if (joi_id_valid.error){
        const message = {
            "message": "Failed",
            "error_key": "error_param",
            "error_message": joi_id_valid.error.stack,
            "error_data": joi_id_valid.error.details
        };
        //LOGGING
        logApiBasic(
            `Request ${head_route_name}/${request_namepath} Failed`,
            `REQUEST GOT AT : ${time_requested} \n` +
            "REQUEST BODY/PARAM : \n" +
            JSON.stringify(data_toview_on_error, null, 2),
            JSON.stringify(message, null, 2)
        );
        res.status(200).json(message);
        return; //END
    }


    // PARAMETER
    //=============================================================
    let task_id = req.params.id;

    // CHECK ID task
    //=============================================================
    let [check_task_success, check_task_result] = checkTaskIDExists(
        task_id
    );

    // QUERY FAILS
    if (!check_task_success){
        console.log(check_task_result);
        const message = {
            "message": "Failed",
            "error_key": "error_internal_server",
            "error_message": check_task_result,
            "error_data": "ON checkTaskIDExists"
        };
        //LOGGING
        logApiBasic(
            `Request ${head_route_name}/${request_namepath} Failed`,
            `REQUEST GOT AT : ${time_requested} \n` +
            "REQUEST BODY/PARAM : \n" +
            JSON.stringify(data_toview_on_error, null, 2),
            JSON.stringify(message, null, 2)
        );
        res.status(200).json(message);
        return; //END
    }

    // ID DOESNT EXISTS
    if (!check_task_result){
        console.log(check_task_result);
        const message = {
            "message": "Failed",
            "error_key": "error_id_not_found",
            "error_message": "Cant found data with id :: " + task_id.toString(),
            "error_data": {
                "ON": "checkTaskIDExists",
                "ID": task_id
            }
        };
        //LOGGING
        logApiBasic(
            `Request ${head_route_name}/${request_namepath} Failed`,
            `REQUEST GOT AT : ${time_requested} \n` +
            "REQUEST BODY/PARAM : \n" +
            JSON.stringify(data_toview_on_error, null, 2),
            JSON.stringify(message, null, 2)
        );
        res.status(200).json(message);
        return; //END
    }


    // DELETE task
    //=============================================================
    let [task_success, task_result] = deleteTask(
        task_id
    );

    // QUERY FAILS
    if (!task_success){
        console.log(task_result);
        const message = {
            "message": "Failed",
            "error_key": "error_internal_server",
            "error_message": task_result,
            "error_data": "ON updateTask"
        };
        //LOGGING
        logApiBasic(
            `Request ${head_route_name}/${request_namepath} Failed`,
            `REQUEST GOT AT : ${time_requested} \n` +
            "REQUEST BODY/PARAM : \n" +
            JSON.stringify(data_toview_on_error, null, 2),
            JSON.stringify(message, null, 2)
        );
        res.status(200).json(message);
        return; //END
    }


    // ASSEMBLY RESPONSE
    //=============================================================
    res.status(200).json({
        "message": "Success"
    });
    return; //END
    
});


//------------------------------------------------------------------------
// GET task By ID
//------------------------------------------------------------------------
router.get('/get/:id', async (req, res)=>{

    // BASIC REQUEST INFO
    //=============================================================
    const request_namepath = req.path;
    const time_requested = moment_tz().tz('Asia/Jakarta');

    // PARAM
    //=============================================================
    const data_toview_on_error = {
        "PARAMS": req.params
    };

    // JOI VALIDATION
    //=============================================================
    let joi_id_schema = joi.number().required();

    let joi_id_valid = joi_id_schema.validate(req.params.id);
    if (joi_id_valid.error){
        const message = {
            "message": "Failed",
            "error_key": "error_param",
            "error_message": joi_id_valid.error.stack,
            "error_data": joi_id_valid.error.details
        };
        //LOGGING
        logApiBasic(
            `Request ${head_route_name}/${request_namepath} Failed`,
            `REQUEST GOT AT : ${time_requested} \n` +
            "REQUEST BODY/PARAM : \n" +
            JSON.stringify(data_toview_on_error, null, 2),
            JSON.stringify(message, null, 2)
        );
        res.status(200).json(message);
        return; //END
    }

    // PARAMETER
    //=============================================================
    let task_id = req.params.id;

    // GET task BY ID
    //=============================================================
    let [task_success, task_result] = getTaskByID(
        task_id
    );

    // QUERY FAILS
    if (!task_success){
        console.log(task_result);
        const message = {
            "message": "Failed",
            "error_key": "error_internal_server",
            "error_message": task_result,
            "error_data": "ON getTaskByID"
        };
        //LOGGING
        logApiBasic(
            `Request ${head_route_name}/${request_namepath} Failed`,
            `REQUEST GOT AT : ${time_requested} \n` +
            "REQUEST BODY/PARAM : \n" +
            JSON.stringify(data_toview_on_error, null, 2),
            JSON.stringify(message, null, 2)
        );
        res.status(200).json(message);
        return; //END
    }

    // ID NOT FOUND
    if (task_result == null){
        console.log(task_result);
        const message = {
            "message": "Failed",
            "error_key": "error_id_not_found",
            "error_message": "Cant found data with id :: " + task_id.toString(),
            "error_data": {
                "ON": "getTaskByID",
                "ID": task_id
            }
        };
        //LOGGING
        logApiBasic(
            `Request ${head_route_name}/${request_namepath} Failed`,
            `REQUEST GOT AT : ${time_requested} \n` +
            "REQUEST BODY/PARAM : \n" +
            JSON.stringify(data_toview_on_error, null, 2),
            JSON.stringify(message, null, 2)
        );
        res.status(200).json(message);
        return; //END
    }


    // ASSEMBLY RESPONSE
    //=============================================================
    res.status(200).json({
        "message": "Success",
        "data": task_result
    });
    return; //END
    
});




// EXPORTS
// ===============================================================================
module.exports = router
