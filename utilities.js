


function logApiBasic (error_text, error_trace, extra_data = '-'){

    console.error(
        "=====================================================" + '\n' +
        error_text.toString() +
        "-----------------------------------------------------" + '\n' +
        error_trace.toString() +
        "-----------------------------------------------------" + '\n' +
        extra_data.toString() +
        "=====================================================" + '\n'  
    );

}


exports.logApiBasic = logApiBasic;